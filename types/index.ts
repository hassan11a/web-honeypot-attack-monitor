export type Severity = "Info" | "Low" | "Medium" | "High" | "Critical";

export type EventCategory =
  | "Reconnaissance"
  | "Authentication Probing"
  | "Path Discovery"
  | "Suspicious Request"
  | "Scanner Activity"
  | "Possible Injection Attempt"
  | "Possible Traversal Attempt"
  | "Rate Limit Violation"
  | "Normal Traffic";

export type MonitoringLevel = "Normal" | "Suspicious" | "High Activity";

export type LoginResult = "failed" | "success" | "locked";

export interface DetectionResult {
  category: EventCategory;
  severity: Severity;
  detected: boolean;
  reason: string;
  confidence: "Low" | "Medium" | "High";
}

export interface DetectionContext {
  method: string;
  path: string;
  rawQuery: string;
  query: Record<string, string>;
  bodyFields: Record<string, string>;
  userAgent: string;
  referer: string;
  sourceIp: string;
  host: string;
  headers: Record<string, string>;
  /** Requests from this IP within the current rate-limit window. */
  recentRequestCount: number;
  /** Authentication attempts from this IP in the recent window. */
  recentAuthAttempts: number;
  /** Requests to sensitive paths from this IP in the recent window. */
  recentSensitiveHits: number;
  timestamp: string;
}

export interface EngineDetection {
  detected: boolean;
  category: EventCategory;
  severity: Severity;
  reason: string;
  confidence: "Low" | "Medium" | "High";
  matches: Array<{
    detector: string;
    category: EventCategory;
    severity: Severity;
    reason: string;
    confidence: "Low" | "Medium" | "High";
  }>;
}

export interface SecurityEvent {
  id: number;
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

export interface LoginEvent {
  id: number;
  timestamp: string;
  source_ip: string;
  username: string;
  result: LoginResult;
  user_agent: string;
  path: string;
  password_submitted: boolean;
  password_indicator: string | null;
}

export interface ScanSession {
  id: number;
  source_ip: string;
  started_at: string;
  ended_at: string;
  total_requests: number;
  suspicious_requests: number;
  status: "active" | "closed";
}

export interface AlertRecord {
  id: number;
  timestamp: string;
  type: string;
  severity: Severity;
  title: string;
  reason: string;
  source_ip: string | null;
  count: number;
  acknowledged: boolean;
}

export interface IpActivity {
  source_ip: string;
  first_seen: string;
  last_seen: string;
  total_requests: number;
  suspicious_requests: number;
  auth_attempts: number;
  monitoring_level: MonitoringLevel;
  top_user_agent: string | null;
  updated_at: string;
}

export interface OverviewStats {
  totalRequests: number;
  suspiciousRequests: number;
  authAttempts: number;
  scannerActivity: number;
  highSeverityEvents: number;
  uniqueSourceIps: number;
  requestsToday: number;
  alertsActive: number;
}

export interface DetectorDefinition {
  name: string;
  description: string;
  enabledByDefault: boolean;
}

export interface AppSettings {
  rateLimitMaxRequests: number;
  rateLimitWindowSeconds: number;
  rateLimitDelayMs: number;
  authAttemptThreshold: number;
  sensitivePathThreshold: number;
  requestsPerMinuteAlert: number;
  scannerWindowMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  rateLimitMaxRequests: 120,
  rateLimitWindowSeconds: 60,
  rateLimitDelayMs: 0,
  authAttemptThreshold: 5,
  sensitivePathThreshold: 10,
  requestsPerMinuteAlert: 300,
  scannerWindowMinutes: 10,
};
