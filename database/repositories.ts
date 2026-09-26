import { getDb } from "@/database";
import type {
  AlertRecord,
  EventCategory,
  IpActivity,
  LoginEvent,
  LoginResult,
  MonitoringLevel,
  OverviewStats,
  ScanSession,
  SecurityEvent,
  Severity,
} from "@/types";

export interface InsertEventInput {
  timestamp: string;
  source_ip: string;
  method: string;
  path: string;
  query_params: string | null;
  user_agent: string;
  referer: string | null;
  status_code: number;
  request_size: number;
  response_time: number;
  category: EventCategory;
  severity: Severity;
  detected: boolean;
  detection_reason: string;
  confidence: string;
  request_headers: string | null;
  host: string | null;
  content_type: string | null;
  body_summary: string | null;
  monitoring_level: MonitoringLevel;
  is_suspicious: boolean;
  scan_session_id: number | null;
}

export async function insertSecurityEvent(input: InsertEventInput): Promise<number> {
  const db = await getDb();
  const res = await db.run(
    `INSERT INTO security_events (
      timestamp, source_ip, method, path, query_params, user_agent, referer,
      status_code, request_size, response_time, category, severity, detected,
      detection_reason, confidence, request_headers, host, content_type,
      body_summary, monitoring_level, is_suspicious, scan_session_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.timestamp,
      input.source_ip,
      input.method,
      input.path,
      input.query_params,
      input.user_agent,
      input.referer,
      input.status_code,
      input.request_size,
      input.response_time,
      input.category,
      input.severity,
      input.detected ? 1 : 0,
      input.detection_reason,
      input.confidence,
      input.request_headers,
      input.host,
      input.content_type,
      input.body_summary,
      input.monitoring_level,
      input.is_suspicious ? 1 : 0,
      input.scan_session_id,
    ],
  );
  if (db.dialect === "sqlite") {
    const row = await db.get<{ id: number }>("SELECT last_insert_rowid() AS id");
    return row?.id ?? res.changes;
  }
  const row = await db.get<{ id: number }>("SELECT lastval() AS id");
  return row?.id ?? res.changes;
}

export async function lastInsertedId(): Promise<number> {
  const db = await getDb();
  const row = await db.get<{ id: number }>(
    db.dialect === "sqlite" ? "SELECT last_insert_rowid() AS id" : "SELECT lastval() AS id",
  );
  return row?.id ?? 0;
}

export interface EventFilters {
  suspiciousOnly?: boolean;
  category?: string;
  severity?: string;
  ip?: string;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

function buildEventWhere(filters: EventFilters): { sql: string; params: (string | number)[] } {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (filters.suspiciousOnly) clauses.push("is_suspicious = 1");
  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  if (filters.severity) {
    clauses.push("severity = ?");
    params.push(filters.severity);
  }
  if (filters.ip) {
    clauses.push("source_ip = ?");
    params.push(filters.ip);
  }
  if (filters.from) {
    clauses.push("timestamp >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("timestamp <= ?");
    params.push(filters.to);
  }
  if (filters.search) {
    clauses.push("(path LIKE ? OR user_agent LIKE ? OR detection_reason LIKE ?)");
    const like = `%${filters.search}%`;
    params.push(like, like, like);
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function listSecurityEvents(filters: EventFilters = {}): Promise<SecurityEvent[]> {
  const db = await getDb();
  const where = buildEventWhere(filters);
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
  const offset = Math.max(filters.offset ?? 0, 0);
  return db.all<SecurityEvent>(
    `SELECT * FROM security_events ${where.sql} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...where.params, limit, offset],
  );
}

export async function getSecurityEvent(id: number): Promise<SecurityEvent | undefined> {
  const db = await getDb();
  return db.get<SecurityEvent>("SELECT * FROM security_events WHERE id = ?", [id]);
}

export async function countSecurityEvents(filters: EventFilters = {}): Promise<number> {
  const db = await getDb();
  const where = buildEventWhere(filters);
  const row = await db.get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM security_events ${where.sql}`,
    where.params,
  );
  return row?.c ?? 0;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const db = await getDb();
  const now = new Date();
  const startOfDay = `${now.toISOString().slice(0, 10)}T00:00:00.000Z`;
  const row = await db.get<Record<string, number>>(
    `SELECT
       COUNT(*) AS totalRequests,
       COALESCE(SUM(CASE WHEN is_suspicious = 1 THEN 1 ELSE 0 END), 0) AS suspiciousRequests,
       COALESCE(SUM(CASE WHEN category = 'Authentication Probing' THEN 1 ELSE 0 END), 0) AS authAttempts,
       COALESCE(SUM(CASE WHEN category = 'Scanner Activity' THEN 1 ELSE 0 END), 0) AS scannerActivity,
       COALESCE(SUM(CASE WHEN severity IN ('High','Critical') THEN 1 ELSE 0 END), 0) AS highSeverityEvents,
       COALESCE(SUM(CASE WHEN timestamp >= ? THEN 1 ELSE 0 END), 0) AS requestsToday
     FROM security_events`,
    [startOfDay],
  );
  const ips = await db.get<{ c: number }>(
    "SELECT COUNT(DISTINCT source_ip) AS c FROM security_events",
  );
  const logins = await db.get<{ c: number }>("SELECT COUNT(*) AS c FROM login_events");
  const alerts = await db.get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM alerts WHERE acknowledged = 0",
  );
  return {
    totalRequests: row?.totalRequests ?? 0,
    suspiciousRequests: row?.suspiciousRequests ?? 0,
    authAttempts: Math.max(row?.authAttempts ?? 0, logins?.c ?? 0),
    scannerActivity: row?.scannerActivity ?? 0,
    highSeverityEvents: row?.highSeverityEvents ?? 0,
    uniqueSourceIps: ips?.c ?? 0,
    requestsToday: row?.requestsToday ?? 0,
    alertsActive: alerts?.c ?? 0,
  };
}

export async function getRequestsOverTime(hours = 24): Promise<Array<{ bucket: string; count: number; suspicious: number }>> {
  const db = await getDb();
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const rows = await db.all<{ bucket: string; count: number; suspicious: number }>(
    `SELECT substr(timestamp, 1, 13) AS bucket,
            COUNT(*) AS count,
            COALESCE(SUM(CASE WHEN is_suspicious = 1 THEN 1 ELSE 0 END), 0) AS suspicious
     FROM security_events
     WHERE timestamp >= ?
     GROUP BY bucket
     ORDER BY bucket ASC`,
    [since],
  );
  return rows;
}

export async function getGroupCounts(
  column: "category" | "severity" | "method" | "path" | "user_agent" | "source_ip",
  limit = 10,
  filters: EventFilters = {},
): Promise<Array<{ label: string; count: number }>> {
  const db = await getDb();
  const where = buildEventWhere(filters);
  const allowed = new Set(["category", "severity", "method", "path", "user_agent", "source_ip"]);
  if (!allowed.has(column)) throw new Error("invalid column");
  return db.all<{ label: string; count: number }>(
    `SELECT ${column} AS label, COUNT(*) AS count FROM security_events ${where.sql}
     GROUP BY ${column} ORDER BY count DESC LIMIT ?`,
    [...where.params, limit],
  );
}

export async function insertLoginEvent(input: {
  timestamp: string;
  source_ip: string;
  username: string;
  result: LoginResult;
  user_agent: string;
  path: string;
  password_submitted: boolean;
  password_indicator: string | null;
}): Promise<number> {
  const db = await getDb();
  await db.run(
    `INSERT INTO login_events
      (timestamp, source_ip, username, result, user_agent, path, password_submitted, password_indicator)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.timestamp,
      input.source_ip,
      input.username.slice(0, 128),
      input.result,
      input.user_agent.slice(0, 512),
      input.path.slice(0, 512),
      input.password_submitted ? 1 : 0,
      input.password_indicator,
    ],
  );
  return lastInsertedId();
}

export async function listLoginEvents(limit = 100, ip?: string): Promise<LoginEvent[]> {
  const db = await getDb();
  if (ip) {
    return db.all<LoginEvent>(
      "SELECT * FROM login_events WHERE source_ip = ? ORDER BY id DESC LIMIT ?",
      [ip, limit],
    );
  }
  return db.all<LoginEvent>("SELECT * FROM login_events ORDER BY id DESC LIMIT ?", [limit]);
}

export async function countLoginAttemptsSince(ip: string, sinceIso: string): Promise<number> {
  const db = await getDb();
  const row = await db.get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM login_events WHERE source_ip = ? AND timestamp >= ?",
    [ip, sinceIso],
  );
  return row?.c ?? 0;
}

export async function upsertIpActivity(input: {
  source_ip: string;
  timestamp: string;
  user_agent: string;
  suspicious: boolean;
  authAttempt: boolean;
  monitoring_level: MonitoringLevel;
}): Promise<void> {
  const db = await getDb();
  const existing = await db.get<IpActivity>("SELECT * FROM ip_activity WHERE source_ip = ?", [
    input.source_ip,
  ]);
  if (!existing) {
    await db.run(
      `INSERT INTO ip_activity
        (source_ip, first_seen, last_seen, total_requests, suspicious_requests, auth_attempts, monitoring_level, top_user_agent, updated_at)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      [
        input.source_ip,
        input.timestamp,
        input.timestamp,
        input.suspicious ? 1 : 0,
        input.authAttempt ? 1 : 0,
        input.monitoring_level,
        input.user_agent,
        input.timestamp,
      ],
    );
    return;
  }
  const levelRank: Record<MonitoringLevel, number> = { Normal: 0, Suspicious: 1, "High Activity": 2 };
  const nextLevel =
    levelRank[input.monitoring_level] > levelRank[existing.monitoring_level]
      ? input.monitoring_level
      : existing.monitoring_level;
  await db.run(
    `UPDATE ip_activity SET
       last_seen = ?,
       total_requests = total_requests + 1,
       suspicious_requests = suspicious_requests + ?,
       auth_attempts = auth_attempts + ?,
       monitoring_level = ?,
       top_user_agent = COALESCE(top_user_agent, ?),
       updated_at = ?
     WHERE source_ip = ?`,
    [
      input.timestamp,
      input.suspicious ? 1 : 0,
      input.authAttempt ? 1 : 0,
      nextLevel,
      input.user_agent,
      input.timestamp,
      input.source_ip,
    ],
  );
}

export async function listIpActivity(limit = 100): Promise<IpActivity[]> {
  const db = await getDb();
  return db.all<IpActivity>(
    "SELECT * FROM ip_activity ORDER BY last_seen DESC LIMIT ?",
    [limit],
  );
}

export async function getIpActivity(ip: string): Promise<IpActivity | undefined> {
  const db = await getDb();
  return db.get<IpActivity>("SELECT * FROM ip_activity WHERE source_ip = ?", [ip]);
}

export async function getIpTopPaths(ip: string, limit = 10): Promise<Array<{ path: string; count: number }>> {
  const db = await getDb();
  return db.all(
    "SELECT path, COUNT(*) AS count FROM security_events WHERE source_ip = ? GROUP BY path ORDER BY count DESC LIMIT ?",
    [ip, limit],
  );
}

export async function insertAlert(input: {
  timestamp: string;
  type: string;
  severity: Severity;
  title: string;
  reason: string;
  source_ip: string | null;
  count: number;
}): Promise<void> {
  const db = await getDb();
  const recent = await db.get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM alerts
     WHERE type = ? AND acknowledged = 0 AND timestamp >= ?`,
    [input.type, new Date(Date.now() - 15 * 60_000).toISOString()],
  );
  if ((recent?.c ?? 0) > 0) return;
  await db.run(
    `INSERT INTO alerts (timestamp, type, severity, title, reason, source_ip, count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.timestamp,
      input.type,
      input.severity,
      input.title,
      input.reason,
      input.source_ip,
      input.count,
    ],
  );
}

export async function listAlerts(limit = 50, includeAck = true): Promise<AlertRecord[]> {
  const db = await getDb();
  if (includeAck) {
    return db.all<AlertRecord>("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", [limit]);
  }
  return db.all<AlertRecord>(
    "SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY id DESC LIMIT ?",
    [limit],
  );
}

export async function acknowledgeAlert(id: number): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE alerts SET acknowledged = 1 WHERE id = ?", [id]);
}

export async function getScanSessionForIp(ip: string): Promise<ScanSession | undefined> {
  const db = await getDb();
  return db.get<ScanSession>(
    "SELECT * FROM scan_sessions WHERE source_ip = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
    [ip],
  );
}

export async function createScanSession(ip: string, now: string): Promise<number> {
  const db = await getDb();
  await db.run(
    "INSERT INTO scan_sessions (source_ip, started_at, ended_at, total_requests, suspicious_requests, status) VALUES (?, ?, ?, 0, 0, 'active')",
    [ip, now, now],
  );
  return lastInsertedId();
}

export async function touchScanSession(id: number, now: string, suspicious: boolean): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE scan_sessions SET ended_at = ?, total_requests = total_requests + 1,
     suspicious_requests = suspicious_requests + ? WHERE id = ?`,
    [now, suspicious ? 1 : 0, id],
  );
}

export async function closeStaleScanSessions(idleMinutes = 30): Promise<void> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - idleMinutes * 60_000).toISOString();
  await db.run(
    "UPDATE scan_sessions SET status = 'closed' WHERE status = 'active' AND ended_at < ?",
    [cutoff],
  );
}

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb();
  const row = await db.get<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (db.dialect === "sqlite") {
    await db.run(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value],
    );
  } else {
    await db.run(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [key, value],
    );
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.all<{ key: string; value: string }>("SELECT key, value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getDetectorStates(): Promise<Record<string, boolean>> {
  const db = await getDb();
  const rows = await db.all<{ name: string; enabled: number }>("SELECT name, enabled FROM detector_state");
  return Object.fromEntries(rows.map((r) => [r.name, r.enabled === 1]));
}

export async function setDetectorState(name: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  if (db.dialect === "sqlite") {
    await db.run(
      "INSERT INTO detector_state (name, enabled) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET enabled = excluded.enabled",
      [name, enabled ? 1 : 0],
    );
  } else {
    await db.run(
      "INSERT INTO detector_state (name, enabled) VALUES (?, ?) ON CONFLICT (name) DO UPDATE SET enabled = EXCLUDED.enabled",
      [name, enabled ? 1 : 0],
    );
  }
}
