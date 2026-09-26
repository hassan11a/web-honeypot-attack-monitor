import { beforeAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "@/database";
import {
  countSecurityEvents,
  getIpActivity,
  getOverviewStats,
  insertLoginEvent,
  insertSecurityEvent,
  listLoginEvents,
  listSecurityEvents,
  upsertIpActivity,
} from "@/database/repositories";

const baseEvent = {
  timestamp: new Date().toISOString(),
  source_ip: "203.0.113.99",
  method: "GET",
  path: "/admin",
  query_params: null,
  user_agent: "test-agent",
  referer: null,
  status_code: 200,
  request_size: 512,
  response_time: 12,
  category: "Path Discovery" as const,
  severity: "Medium" as const,
  detected: true,
  detection_reason: "sensitive path",
  confidence: "High",
  request_headers: "{}",
  host: "test",
  content_type: "text/html",
  body_summary: null,
  monitoring_level: "Suspicious" as const,
  is_suspicious: true,
  scan_session_id: null,
};

describe("database operations", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("inserts and retrieves security events", async () => {
    const res = await insertSecurityEvent(baseEvent);
    expect(res).toBeGreaterThan(0);
    const events = await listSecurityEvents({ limit: 50 });
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((e) => e.path === "/admin")).toBe(true);
    const count = await countSecurityEvents({ ip: "203.0.113.99" });
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("computes overview stats", async () => {
    const stats = await getOverviewStats();
    expect(stats.totalRequests).toBeGreaterThanOrEqual(1);
    expect(stats.suspiciousRequests).toBeGreaterThanOrEqual(1);
    expect(stats.uniqueSourceIps).toBeGreaterThanOrEqual(1);
  });

  it("stores login events without passwords", async () => {
    await insertLoginEvent({
      timestamp: new Date().toISOString(),
      source_ip: "203.0.113.99",
      username: "admin",
      result: "failed",
      user_agent: "test",
      path: "/login",
      password_submitted: true,
      password_indicator: "len:8-11",
    });
    const logins = await listLoginEvents(10);
    expect(logins.length).toBeGreaterThan(0);
    const row = logins[0]!;
    expect(row).not.toHaveProperty("password");
    expect(row.password_indicator).toBe("len:8-11");
  });

  it("tracks ip activity aggregates", async () => {
    await upsertIpActivity({
      source_ip: "198.51.100.1",
      timestamp: new Date().toISOString(),
      user_agent: "ua",
      suspicious: true,
      authAttempt: true,
      monitoring_level: "Suspicious",
    });
    await upsertIpActivity({
      source_ip: "198.51.100.1",
      timestamp: new Date().toISOString(),
      user_agent: "ua",
      suspicious: false,
      authAttempt: false,
      monitoring_level: "Normal",
    });
    const ip = await getIpActivity("198.51.100.1");
    expect(ip?.total_requests).toBe(2);
    expect(ip?.suspicious_requests).toBe(1);
    expect(ip?.auth_attempts).toBe(1);
    expect(ip?.monitoring_level).toBe("Suspicious");
  });

  it("round-trips event filters", async () => {
    const suspicious = await listSecurityEvents({ suspiciousOnly: true, limit: 50 });
    expect(suspicious.length).toBeGreaterThan(0);
    for (const e of suspicious) expect(e.is_suspicious).toBe(1);
    await closeDb();
  });
});
