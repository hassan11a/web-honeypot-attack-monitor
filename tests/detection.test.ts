import { describe, expect, it } from "vitest";
import { runDetection, detectorCatalog } from "@/honeypot/detection";
import type { DetectionContext } from "@/types";

function ctx(partial: Partial<DetectionContext> = {}): DetectionContext {
  return {
    method: "GET",
    path: "/",
    rawQuery: "",
    query: {},
    bodyFields: {},
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    referer: "",
    sourceIp: "203.0.113.5",
    host: "demo.local",
    headers: {},
    recentRequestCount: 1,
    recentAuthAttempts: 0,
    recentSensitiveHits: 0,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

describe("detection engine", () => {
  it("classifies normal traffic as Normal Traffic", async () => {
    const result = await runDetection(ctx({ path: "/products" }));
    expect(result.detected).toBe(false);
    expect(result.category).toBe("Normal Traffic");
    expect(result.matches).toHaveLength(0);
  });

  it("detects admin path discovery", async () => {
    const result = await runDetection(ctx({ path: "/admin/login" }));
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Path Discovery");
    expect(result.severity).toBe("Medium");
    expect(result.reason).toMatch(/administrative path/i);
  });

  it("detects backup/config file probes", async () => {
    const result = await runDetection(ctx({ path: "/.env" }));
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Path Discovery");
    expect(result.severity).toBe("High");
  });

  it("detects directory traversal indicators", async () => {
    const result = await runDetection(
      ctx({
        path: "/download",
        query: { file: "../../../../etc/passwd" },
        rawQuery: "file=../../../../etc/passwd",
      }),
    );
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Possible Traversal Attempt");
    expect(result.reason).toMatch(/possible traversal attempt/i);
  });

  it("treats injection payloads as inert text", async () => {
    const payload = "' UNION SELECT username, password FROM users --";
    const result = await runDetection(
      ctx({ path: "/search", query: { q: payload }, rawQuery: `q=${encodeURIComponent(payload)}` }),
    );
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Possible Injection Attempt");
    expect(result.reason).toMatch(/possible|pattern/i);
    expect(ctx({ query: { q: payload } }).query.q).toBe(payload);
  });

  it("detects scanner user agents", async () => {
    const result = await runDetection(ctx({ userAgent: "sqlmap/1.7.2#stable (https://sqlmap.org)" }));
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Scanner Activity");
  });

  it("detects unexpected HTTP methods", async () => {
    const result = await runDetection(ctx({ method: "TRACE", path: "/" }));
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Suspicious Request");
  });

  it("detects high request frequency as rate-limit violation", async () => {
    const result = await runDetection(ctx({ recentRequestCount: 150 }));
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Rate Limit Violation");
  });

  it("detects repeated authentication probing", async () => {
    const result = await runDetection(
      ctx({
        path: "/admin/login",
        method: "POST",
        recentAuthAttempts: 6,
        bodyFields: { username: "admin", password: "x" },
      }),
    );
    expect(result.detected).toBe(true);
    expect(result.category).toBe("Authentication Probing");
    expect(result.severity).toBe("High");
  });

  it("detects reconnaissance paths", async () => {
    const result = await runDetection(ctx({ path: "/.git/config" }));
    expect(result.detected).toBe(true);
    expect(["Reconnaissance", "Path Discovery"]).toContain(result.category);
  });

  it("uses cautious language for pattern-based findings", async () => {
    const result = await runDetection(
      ctx({ path: "/search", rawQuery: "q=<script>alert(1)</script>", query: { q: "<script>alert(1)</script>" } }),
    );
    expect(result.detected).toBe(true);
    expect(result.reason.toLowerCase()).toMatch(/possible|suspicious|pattern/);
    expect(result.reason.toLowerCase()).toMatch(/not proof|pattern-based/);
    expect(result.reason.toLowerCase()).not.toMatch(/\bwas exploited\b|\battack succeeded\b/);
  });

  it("exposes an independent catalog of detectors", () => {
    const catalog = detectorCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(8);
    for (const d of catalog) {
      expect(d.name).toBeTruthy();
      expect(d.description).toBeTruthy();
    }
  });
});
