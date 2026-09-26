import {
  closeStaleScanSessions,
  countLoginAttemptsSince,
  createScanSession,
  getScanSessionForIp,
  insertLoginEvent,
  insertSecurityEvent,
  touchScanSession,
  upsertIpActivity,
} from "@/database/repositories";
import { logger } from "@/lib/logger";
import { passwordIndicator } from "@/lib/redact";
import type { EngineDetection, LoginResult, MonitoringLevel } from "@/types";
import { evaluateAlerts, getAlertThresholds } from "../alerts";
import { rateLimiter } from "../rate-limit";
import { isAuthPath, type CapturedRequest } from "../request-monitor";

const SCAN_SESSION_IDLE_MS = 30 * 60_000;

async function resolveScanSession(ip: string, now: string): Promise<number> {
  const existing = await getScanSessionForIp(ip);
  if (existing && Date.parse(existing.ended_at) >= Date.now() - SCAN_SESSION_IDLE_MS) {
    return existing.id;
  }
  if (existing) {
    // stale active session: create a new one
  }
  return createScanSession(ip, now);
}

export async function recordRequest(
  captured: CapturedRequest,
  detection: EngineDetection,
  statusCode: number,
  responseTimeMs: number,
): Promise<void> {
  const suspicious = detection.detected && detection.severity !== "Info";
  const sessionId = await resolveScanSession(captured.sourceIp, captured.timestamp);

  try {
    await insertSecurityEvent({
      timestamp: captured.timestamp,
      source_ip: captured.sourceIp,
      method: captured.method,
      path: captured.path,
      query_params: captured.rawQuery ? JSON.stringify(captured.query) : null,
      user_agent: captured.userAgent,
      referer: captured.referer || null,
      status_code: statusCode,
      request_size: captured.requestSize,
      response_time: Math.round(responseTimeMs),
      category: detection.category,
      severity: detection.severity,
      detected: detection.detected,
      detection_reason: detection.reason,
      confidence: detection.confidence,
      request_headers: JSON.stringify(captured.headers),
      host: captured.host || null,
      content_type: captured.contentType || null,
      body_summary: captured.bodySummary,
      monitoring_level: captured.monitoringLevel,
      is_suspicious: suspicious,
      scan_session_id: sessionId,
    });

    await touchScanSession(sessionId, captured.timestamp, suspicious);

    await upsertIpActivity({
      source_ip: captured.sourceIp,
      timestamp: captured.timestamp,
      user_agent: captured.userAgent,
      suspicious,
      authAttempt: isAuthPath(captured.path) && captured.method === "POST",
      monitoring_level: captured.monitoringLevel as MonitoringLevel,
    });

    await closeStaleScanSessions();

    if (suspicious) {
      await raiseAlerts(captured, detection);
    }

    logger.info("event.recorded", {
      ip: captured.sourceIp,
      method: captured.method,
      path: captured.path,
      category: detection.category,
      severity: detection.severity,
      status: statusCode,
    });
  } catch (err) {
    logger.error("event.record_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

async function raiseAlerts(captured: CapturedRequest, detection: EngineDetection): Promise<void> {
  try {
    const thresholds = await getAlertThresholds();

    if (detection.category === "Scanner Activity") {
      await evaluateAlerts({
        type: "scanner_activity",
        title: "Scanner-like activity detected",
        reason: detection.reason,
        sourceIp: captured.sourceIp,
        severity: "Medium",
      });
    }

    if (detection.category === "Possible Injection Attempt" || detection.category === "Possible Traversal Attempt") {
      await evaluateAlerts({
        type: "suspicious_path",
        title: "High-risk pattern observed in request",
        reason: detection.reason,
        sourceIp: captured.sourceIp,
        severity: "High",
      });
    }

    if (detection.category === "Rate Limit Violation" || rateLimiter.snapshotCount(captured.sourceIp) > thresholds.requestsPerMinuteAlert) {
      await evaluateAlerts({
        type: "rate_limit",
        title: "Request volume threshold exceeded",
        reason: `Source exceeded the configured request threshold inside the monitoring window (${rateLimiter.snapshotCount(captured.sourceIp)} requests)`,
        sourceIp: captured.sourceIp,
        severity: "Medium",
      });
    }

    if (detection.category === "Authentication Probing" && detection.severity === "High") {
      await evaluateAlerts({
        type: "auth_attempts",
        title: "Multiple authentication attempts",
        reason: detection.reason,
        sourceIp: captured.sourceIp,
        severity: "High",
      });
    }
  } catch (err) {
    logger.error("alert.evaluate_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

export interface LoginTrapInput {
  ip: string;
  username: string;
  password: string | undefined;
  userAgent: string;
  path: string;
}

/**
 * Records a fake authentication attempt. Never validates against a real
 * credential store and never persists the plaintext password.
 */
export async function recordLoginAttempt(input: LoginTrapInput): Promise<LoginResult> {
  const now = new Date().toISOString();
  const thresholds = await getAlertThresholds();
  const recent = await countLoginAttemptsSince(
    input.ip,
    new Date(Date.now() - thresholds.authAttemptThreshold * 60_000).toISOString(),
  );
  const result: LoginResult = recent + 1 >= thresholds.authAttemptThreshold ? "locked" : "failed";

  await insertLoginAttemptSafe({
    timestamp: now,
    source_ip: input.ip,
    username: input.username,
    result,
    user_agent: input.userAgent,
    path: input.path,
    password_submitted: Boolean(input.password),
    password_indicator: passwordIndicator(input.password),
  });

  rateLimiter.note({ ip: input.ip, isAuthPath: true, forceSuspicious: true });

  if (recent + 1 >= thresholds.authAttemptThreshold) {
    await evaluateAlerts({
      type: "auth_attempts",
      title: "Repeated admin/login attempts",
      reason: `Source attempted authentication ${recent + 1} times inside the threshold window`,
      sourceIp: input.ip,
      severity: "High",
      count: recent + 1,
    });
  }

  return result;
}

async function insertLoginAttemptSafe(row: {
  timestamp: string;
  source_ip: string;
  username: string;
  result: LoginResult;
  user_agent: string;
  path: string;
  password_submitted: boolean;
  password_indicator: string | null;
}): Promise<void> {
  try {
    await insertLoginEvent(row);
  } catch (err) {
    logger.error("login.record_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}
