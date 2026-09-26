/**
 * Development-only test data generator.
 * Refuses to run when NODE_ENV=production.
 *
 * Usage: npm run testdata
 */
import { config } from "@/lib/config";
import { getDb, closeDb } from "@/database";
import {
  insertLoginEvent,
  insertSecurityEvent,
  upsertIpActivity,
} from "@/database/repositories";
import { runDetection } from "@/honeypot/detection";
import type { DetectionContext } from "@/types";

if (config.isProduction) {
  console.error("Refusing to generate test data in production.");
  process.exit(1);
}

const SAMPLES: Array<Partial<DetectionContext>> = [
  { method: "GET", path: "/admin/login", userAgent: "Mozilla/5.0" },
  { method: "GET", path: "/wp-admin/install.php", userAgent: "sqlmap/1.7.2#stable" },
  { method: "GET", path: "/.env", userAgent: "curl/8.4.0" },
  { method: "GET", path: "/search", userAgent: "Mozilla/5.0", query: { q: "' OR 1=1 --" } },
  { method: "GET", path: "/backup/site.zip", userAgent: "Nikto/2.5.0" },
  { method: "GET", path: "/index.php?page=../../etc/passwd", userAgent: "python-requests/2.31.0" },
  { method: "DELETE", path: "/api/v1/orders/1", userAgent: "Go-http-client/2.0" },
  { method: "GET", path: "/.git/config", userAgent: "Mozilla/5.0" },
  { method: "POST", path: "/login", userAgent: "Mozilla/5.0", bodyFields: { username: "admin", password: "x" } },
  { method: "GET", path: "/", userAgent: "Mozilla/5.0 (Windows NT 10.0)" },
  { method: "GET", path: "/products", userAgent: "Mozilla/5.0" },
  { method: "GET", path: "/actuator/env", userAgent: "curl/8.4.0" },
];

const IPS = ["203.0.113.10", "198.51.100.44", "192.0.2.7", "10.0.0.5"];

async function main(): Promise<void> {
  await getDb();
  const now = Date.now();

  for (let i = 0; i < 80; i++) {
    const sample = SAMPLES[i % SAMPLES.length]!;
    const ip = IPS[i % IPS.length]!;
    const ts = new Date(now - (80 - i) * 60_000).toISOString();
    const ctx: DetectionContext = {
      method: sample.method ?? "GET",
      path: sample.path ?? "/",
      rawQuery: "",
      query: sample.query ?? {},
      bodyFields: sample.bodyFields ?? {},
      userAgent: sample.userAgent ?? "",
      referer: "",
      sourceIp: ip,
      host: "demo.local",
      headers: {},
      recentRequestCount: i % 40,
      recentAuthAttempts: sample.path?.includes("login") ? 3 : 0,
      recentSensitiveHits: sample.path?.includes("admin") ? 3 : 0,
      timestamp: ts,
    };
    if (ctx.query && Object.keys(ctx.query).length > 0) {
      ctx.rawQuery = Object.entries(ctx.query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
    }

    const detection = await runDetection(ctx);
    const suspicious = detection.detected && detection.severity !== "Info";

    await insertSecurityEvent({
      timestamp: ts,
      source_ip: ip,
      method: ctx.method,
      path: ctx.path,
      query_params: ctx.rawQuery ? JSON.stringify(ctx.query) : null,
      user_agent: ctx.userAgent,
      referer: null,
      status_code: ctx.path.includes("login") && ctx.method === "POST" ? 401 : ctx.path.startsWith("/.env") || ctx.path.includes("backup") ? 404 : 200,
      request_size: 400 + (i % 900),
      response_time: 20 + (i % 180),
      category: detection.category,
      severity: detection.severity,
      detected: detection.detected,
      detection_reason: detection.reason,
      confidence: detection.confidence,
      request_headers: JSON.stringify({ "user-agent": ctx.userAgent, host: ctx.host }),
      host: ctx.host,
      content_type: "text/html",
      body_summary: null,
      monitoring_level: suspicious ? "Suspicious" : "Normal",
      is_suspicious: suspicious,
      scan_session_id: null,
    });

    await upsertIpActivity({
      source_ip: ip,
      timestamp: ts,
      user_agent: ctx.userAgent,
      suspicious,
      authAttempt: ctx.path.includes("login"),
      monitoring_level: suspicious ? "Suspicious" : "Normal",
    });
  }

  for (let i = 0; i < 6; i++) {
    await insertLoginEvent({
      timestamp: new Date(now - i * 5 * 60_000).toISOString(),
      source_ip: IPS[i % IPS.length]!,
      username: i % 2 === 0 ? "admin" : "root",
      result: i >= 4 ? "locked" : "failed",
      user_agent: "sqlmap/1.7.2",
      path: i % 2 === 0 ? "/admin/login" : "/login",
      password_submitted: true,
      password_indicator: "len:8-11",
    });
  }

  console.log("Test data inserted (dev only).");
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
