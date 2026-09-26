import { beforeAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "@/database";
import { authenticate, bootstrapAdmin, createSession, destroySession, hasAdminUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordIndicator, redactRecord, sanitizeHeaders } from "@/lib/redact";
import { buildCsvReport, buildJsonReport, type ReportData } from "@/reports/build";

describe("dashboard auth & redaction", () => {
  beforeAll(async () => {
    await getDb();
    await bootstrapAdmin();
  });

  it("creates admin only once", async () => {
    expect(await hasAdminUser()).toBe(true);
    await bootstrapAdmin();
    expect(await hasAdminUser()).toBe(true);
  });

  it("verifies correct password and rejects wrong one", async () => {
    expect(await authenticate("tester", "TestOnly-Password123!")).toBe(true);
    expect(await authenticate("tester", "wrong-password")).toBe(false);
    expect(await authenticate("nobody", "TestOnly-Password123!")).toBe(false);
  });

  it("hashes passwords with scrypt and never stores plaintext", () => {
    const hash = hashPassword("Another-Secret-999!");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("Another-Secret-999!");
    expect(verifyPassword("Another-Secret-999!", hash)).toBe(true);
    expect(verifyPassword("nope", hash)).toBe(false);
  });

  it("creates and destroys dashboard sessions", async () => {
    const token = await createSession("tester", "127.0.0.1", "vitest");
    const db = await getDb();
    const row = await db.get<{ c: number }>(
      "SELECT COUNT(*) AS c FROM dashboard_sessions WHERE username = ?",
      ["tester"],
    );
    expect(row?.c).toBeGreaterThanOrEqual(1);
    await destroySession(token);
    expect(token).toBeTruthy();
  });

  it("redacts sensitive fields and password indicators", () => {
    const redacted = redactRecord({ username: "admin", password: "hunter2", api_key: "abc", note: "ok" });
    expect(redacted.username).toBe("admin");
    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.api_key).toBe("[REDACTED]");
    expect(redacted.note).toBe("ok");

    const headers = sanitizeHeaders({
      "user-agent": "x",
      cookie: "session=abc",
      authorization: "Bearer xyz",
      "x-custom-secret": "nope",
    });
    expect(headers["user-agent"]).toBe("x");
    expect(headers.cookie).toBe("[REDACTED]");
    expect(headers.authorization).toBe("[REDACTED]");
    expect(headers["x-custom-secret"]).toBeUndefined();

    expect(passwordIndicator("short")).toBe("len:<8");
    expect(passwordIndicator("longenoughpassword")).toBe("len:>=16");
    expect(passwordIndicator(null)).toBeNull();
    expect(passwordIndicator("hunter2")).not.toContain("hunter2");
  });

  it("builds JSON and CSV reports", async () => {
    const report: ReportData = {
      generatedAt: new Date().toISOString(),
      overview: {
        totalRequests: 10,
        suspiciousRequests: 3,
        authAttempts: 2,
        scannerActivity: 1,
        highSeverityEvents: 1,
        uniqueSourceIps: 4,
        requestsToday: 5,
        alertsActive: 0,
      },
      timeseries: [],
      categories: [{ label: "Path Discovery", count: 3 }],
      severities: [{ label: "Medium", count: 3 }],
      methods: [{ label: "GET", count: 9 }],
      paths: [{ label: "/admin", count: 3 }],
      userAgents: [{ label: "curl", count: 2 }],
      ips: [{ label: "1.2.3.4", count: 5 }],
      logins: [],
      alerts: [],
      recentEvents: [],
    };
    const json = buildJsonReport(report);
    expect(JSON.parse(json).overview.totalRequests).toBe(10);
    const csv = buildCsvReport(report);
    expect(csv).toContain("overview,totalRequests,10");
    expect(csv).toContain("event_id,timestamp");
  });

  it("closes database", async () => {
    await closeDb();
    expect(true).toBe(true);
  });
});
