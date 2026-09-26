import type { Request } from "express";
import { normalizeIp } from "@/lib/ip";
import { redactRecord, sanitizeHeaders, truncate } from "@/lib/redact";
import type { DetectionContext, MonitoringLevel } from "@/types";
import type { RateLimitDecision } from "../rate-limit";

export interface CapturedRequest {
  timestamp: string;
  sourceIp: string;
  method: string;
  path: string;
  rawQuery: string;
  query: Record<string, string>;
  bodyFields: Record<string, string>;
  userAgent: string;
  referer: string;
  host: string;
  contentType: string;
  headers: Record<string, string>;
  requestSize: number;
  bodySummary: string | null;
  monitoringLevel: MonitoringLevel;
}

const AUTH_PATH = /\/(login|signin|auth|admin\/login|wp-login)/i;
const SENSITIVE_PATH =
  /\/(admin|administrator|wp-admin|phpmyadmin|manager|console|cpanel|dashboard|\.env|\.git|backup|config|api\/v\d|login|auth)/i;

export function isAuthPath(path: string): boolean {
  return AUTH_PATH.test(path);
}

export function isSensitivePath(path: string): boolean {
  return SENSITIVE_PATH.test(path);
}

function queryToObject(url: URL): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (Object.keys(out).length >= 50) break;
    out[truncate(key, 128)] = truncate(value, 1024);
  }
  return out;
}

function bodyToObject(body: unknown): Record<string, string> {
  if (!body || typeof body !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (Object.keys(out).length >= 50) break;
    if (value === null || value === undefined) continue;
    out[truncate(key, 128)] = truncate(typeof value === "string" ? value : JSON.stringify(value), 1024);
  }
  return out;
}

export function captureRequest(req: Request): CapturedRequest {
  const host = req.headers.host ?? "";
  const url = new URL(req.originalUrl || req.url, `http://${host || "localhost"}`);
  const query = queryToObject(url);
  const rawBody = (req as Request & { body?: unknown }).body;
  const bodyFields = bodyToObject(rawBody);
  const headers = sanitizeHeaders(req.headers as Record<string, string | string[] | undefined>);
  const userAgent = truncate(String(req.headers["user-agent"] ?? ""), 512);
  const referer = truncate(String(req.headers["referer"] ?? ""), 1024);
  const sourceIp = normalizeIp(
    (req.headers["x-forwarded-for"] as string | undefined) ?? req.socket.remoteAddress ?? "",
  );

  const requestSize =
    Number(req.headers["content-length"] ?? 0) || Buffer.byteLength(req.originalUrl ?? "", "utf8");

  let bodySummary: string | null = null;
  if (Object.keys(bodyFields).length > 0) {
    bodySummary = truncate(JSON.stringify(redactRecord(bodyFields)), 2048);
  }

  return {
    timestamp: new Date().toISOString(),
    sourceIp,
    method: req.method.toUpperCase(),
    path: truncate(url.pathname, 1024),
    rawQuery: truncate(url.search.replace(/^\?/, ""), 2048),
    query,
    bodyFields: redactRecord(bodyFields) as Record<string, string>,
    userAgent,
    referer,
    host: truncate(host, 256),
    contentType: truncate(String(req.headers["content-type"] ?? ""), 256),
    headers,
    requestSize,
    bodySummary,
    monitoringLevel: "Normal",
  };
}

export function monitoringLevelFor(decision: RateLimitDecision): MonitoringLevel {
  if (!decision.elevated) return "Normal";
  return decision.requestCountInWindow > 240 ? "High Activity" : "Suspicious";
}

export function buildDetectionContext(
  captured: CapturedRequest,
  decision: RateLimitDecision,
): DetectionContext {
  captured.monitoringLevel = monitoringLevelFor(decision);
  return {
    method: captured.method,
    path: captured.path,
    rawQuery: captured.rawQuery,
    query: captured.query,
    bodyFields: captured.bodyFields,
    userAgent: captured.userAgent,
    referer: captured.referer,
    sourceIp: captured.sourceIp,
    host: captured.host,
    headers: captured.headers,
    recentRequestCount: decision.requestCountInWindow,
    recentAuthAttempts: decision.authAttemptsInWindow,
    recentSensitiveHits: decision.sensitiveHitsInWindow,
    timestamp: captured.timestamp,
  };
}
