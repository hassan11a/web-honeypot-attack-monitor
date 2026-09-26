import type { DbClient } from "./client";

export const SQLITE_SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params TEXT,
  user_agent TEXT NOT NULL DEFAULT '',
  referer TEXT,
  status_code INTEGER NOT NULL,
  request_size INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected INTEGER NOT NULL DEFAULT 0,
  detection_reason TEXT NOT NULL DEFAULT '',
  confidence TEXT NOT NULL DEFAULT '',
  request_headers TEXT,
  host TEXT,
  content_type TEXT,
  body_summary TEXT,
  monitoring_level TEXT NOT NULL DEFAULT 'Normal',
  is_suspicious INTEGER NOT NULL DEFAULT 0,
  scan_session_id INTEGER
);

CREATE TABLE IF NOT EXISTS scan_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_ip TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  suspicious_requests INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS login_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  username TEXT NOT NULL,
  result TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '',
  password_submitted INTEGER NOT NULL DEFAULT 0,
  password_indicator TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_ip TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  acknowledged INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ip_activity (
  source_ip TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  suspicious_requests INTEGER NOT NULL DEFAULT 0,
  auth_attempts INTEGER NOT NULL DEFAULT 0,
  monitoring_level TEXT NOT NULL DEFAULT 'Normal',
  top_user_agent TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS dashboard_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS detector_state (
  name TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_events_suspicious ON security_events(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_events_category ON security_events(category);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
`;

export const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  timestamp TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params TEXT,
  user_agent TEXT NOT NULL DEFAULT '',
  referer TEXT,
  status_code INTEGER NOT NULL,
  request_size INTEGER NOT NULL DEFAULT 0,
  response_time INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  detected INTEGER NOT NULL DEFAULT 0,
  detection_reason TEXT NOT NULL DEFAULT '',
  confidence TEXT NOT NULL DEFAULT '',
  request_headers TEXT,
  host TEXT,
  content_type TEXT,
  body_summary TEXT,
  monitoring_level TEXT NOT NULL DEFAULT 'Normal',
  is_suspicious INTEGER NOT NULL DEFAULT 0,
  scan_session_id BIGINT
);
CREATE TABLE IF NOT EXISTS scan_sessions (
  id BIGSERIAL PRIMARY KEY,
  source_ip TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  suspicious_requests INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS login_events (
  id BIGSERIAL PRIMARY KEY,
  timestamp TEXT NOT NULL,
  source_ip TEXT NOT NULL,
  username TEXT NOT NULL,
  result TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '',
  password_submitted INTEGER NOT NULL DEFAULT 0,
  password_indicator TEXT
);
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_ip TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  acknowledged INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ip_activity (
  source_ip TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  suspicious_requests INTEGER NOT NULL DEFAULT 0,
  auth_attempts INTEGER NOT NULL DEFAULT 0,
  monitoring_level TEXT NOT NULL DEFAULT 'Normal',
  top_user_agent TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS dashboard_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS dashboard_sessions (
  id BIGSERIAL PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT
);
CREATE TABLE IF NOT EXISTS detector_state (
  name TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_events_suspicious ON security_events(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_events_category ON security_events(category);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
`;

export async function migrate(db: DbClient): Promise<void> {
  const script = db.dialect === "sqlite" ? SQLITE_SCHEMA : POSTGRES_SCHEMA;
  const statements = script
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await db.exec(statement);
  }
}
