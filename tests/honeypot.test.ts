import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createHoneypotApp } from "@/honeypot/handlers/app";
import { rateLimiter } from "@/honeypot/rate-limit";
import { closeDb, getDb } from "@/database";
import { listLoginEvents, listSecurityEvents } from "@/database/repositories";

let server: Server;
let base: string;

describe("honeypot request logging & safety", () => {
  beforeAll(async () => {
    await getDb();
    rateLimiter.reset();
    rateLimiter.configure({ maxRequests: 1000, windowMs: 60_000, delayMs: 0 });
    const app = createHoneypotApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const address = server.address();
    if (address && typeof address === "object") {
      base = `http://127.0.0.1:${address.port}`;
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await closeDb();
  });

  it("serves the fake homepage", async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/BrightCart/);
  });

  it("serves fake login page and never grants access", async () => {
    const res = await fetch(`${base}/login`);
    expect(res.status).toBe(200);
    expect(await res.text()).toMatch(/Sign In/i);
  });

  it("records events for sensitive paths", async () => {
    await fetch(`${base}/admin/login`, { headers: { "user-agent": "UnitTestAgent/1.0" } });
    await new Promise((r) => setTimeout(r, 300));
    const events = await listSecurityEvents({ limit: 50 });
    expect(events.some((e) => e.path === "/admin/login")).toBe(true);
  });

  it("stores suspicious query payloads as text and never executes them", async () => {
    const marker = `hp_test_${Date.now()}`;
    const payload = `'; DROP TABLE security_events; --<script>window.${marker}=1</script>`;
    const res = await fetch(`${base}/search?q=${encodeURIComponent(payload)}`, {
      headers: { "user-agent": "UnitTestAgent/1.0" },
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    // payload must be HTML-escaped in output, not interpreted
    expect(html).not.toContain("<script>window.hp_test_");
    await new Promise((r) => setTimeout(r, 400));
    const events = await listSecurityEvents({ limit: 50, search: "search" });
    const hit = events.find((e) => e.path === "/search");
    expect(hit).toBeTruthy();
    expect(hit!.is_suspicious).toBe(1);
    // table still exists (no SQL executed)
    const still = await listSecurityEvents({ limit: 5 });
    expect(still.length).toBeGreaterThan(0);
  });

  it("records fake login attempts without storing passwords", async () => {
    const res = await fetch(`${base}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "user-agent": "UnitTestAgent/1.0" },
      body: new URLSearchParams({ username: "admin", password: "SuperSecret123!" }).toString(),
    });
    expect(res.status).toBe(401);
    await new Promise((r) => setTimeout(r, 300));
    const logins = await listLoginEvents(20);
    const entry = logins.find((l) => l.username === "admin");
    expect(entry).toBeTruthy();
    expect(entry).not.toHaveProperty("password");
    const serialized = JSON.stringify(entry);
    expect(serialized).not.toContain("SuperSecret123!");
    expect(entry!.password_submitted).toBe(1);
    expect(entry!.password_indicator).toBeTruthy();
  });

  it("returns 404 page for unknown paths and logs the attempt", async () => {
    const res = await fetch(`${base}/definitely-not-a-real-page`);
    expect(res.status).toBe(404);
    await new Promise((r) => setTimeout(r, 300));
    const events = await listSecurityEvents({ limit: 50, search: "definitely-not-a-real-page" });
    expect(events.length).toBeGreaterThan(0);
  });

  it("applies rate limiting with HTTP 429", async () => {
    rateLimiter.reset();
    rateLimiter.configure({ maxRequests: 5, windowMs: 60_000, delayMs: 0 });
    let saw429 = false;
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${base}/products`, { headers: { "user-agent": "RateTest/1.0" } });
      if (res.status === 429) {
        saw429 = true;
        expect(res.headers.get("retry-after")).toBeTruthy();
        break;
      }
    }
    expect(saw429).toBe(true);
    rateLimiter.configure({ maxRequests: 1000 });
    rateLimiter.reset();
  });

  it("handles unexpected HTTP methods safely", async () => {
    const res = await fetch(`${base}/api`, { method: "DELETE" });
    expect([404, 405, 200]).toContain(res.status);
  });
});
