import type {
  AlertRecord,
  LoginEvent,
  OverviewStats,
  SecurityEvent,
} from "@/types";

export interface ReportData {
  generatedAt: string;
  overview: OverviewStats;
  timeseries: Array<{ bucket: string; count: number; suspicious: number }>;
  categories: Array<{ label: string; count: number }>;
  severities: Array<{ label: string; count: number }>;
  methods: Array<{ label: string; count: number }>;
  paths: Array<{ label: string; count: number }>;
  userAgents: Array<{ label: string; count: number }>;
  ips: Array<{ label: string; count: number }>;
  logins: LoginEvent[];
  alerts: AlertRecord[];
  recentEvents: SecurityEvent[];
}

const RECOMMENDATIONS = [
  "Review high-severity events and confirm they originate from expected lab or test sources.",
  "Keep rate limits and alert thresholds tuned to your environment's normal traffic baseline.",
  "Treat all pattern-based detections as indicators, not proof of successful exploitation.",
  "Rotate dashboard credentials regularly and restrict console access to management networks.",
  "Ensure the honeypot remains isolated from production systems and sensitive credentials.",
  "Export periodic reports (JSON/CSV) for offline analysis and retention.",
];

export function buildJsonReport(report: ReportData): string {
  return JSON.stringify(
    {
      title: "Web Honeypot Security Report",
      generatedAt: report.generatedAt,
      overview: report.overview,
      traffic: {
        timeseries: report.timeseries,
        httpMethods: report.methods,
        topPaths: report.paths,
        topUserAgents: report.userAgents,
        topSourceIps: report.ips,
      },
      detectionSummary: {
        byCategory: report.categories,
        bySeverity: report.severities,
      },
      authenticationAttempts: report.logins.slice(0, 50),
      alerts: report.alerts,
      recentEvents: report.recentEvents.slice(0, 50),
      recommendations: RECOMMENDATIONS,
      disclaimer:
        "Findings are pattern-based indicators for defensive monitoring. They do not confirm successful attacks.",
    },
    null,
    2,
  );
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsvReport(report: ReportData): string {
  const lines: string[] = [];
  lines.push("section,key,value");
  lines.push(`meta,generatedAt,${csvEscape(report.generatedAt)}`);
  lines.push(`overview,totalRequests,${report.overview.totalRequests}`);
  lines.push(`overview,suspiciousRequests,${report.overview.suspiciousRequests}`);
  lines.push(`overview,authAttempts,${report.overview.authAttempts}`);
  lines.push(`overview,scannerActivity,${report.overview.scannerActivity}`);
  lines.push(`overview,highSeverityEvents,${report.overview.highSeverityEvents}`);
  lines.push(`overview,uniqueSourceIps,${report.overview.uniqueSourceIps}`);
  lines.push(`overview,requestsToday,${report.overview.requestsToday}`);

  for (const row of report.categories) lines.push(`category,${csvEscape(row.label)},${row.count}`);
  for (const row of report.severities) lines.push(`severity,${csvEscape(row.label)},${row.count}`);
  for (const row of report.methods) lines.push(`method,${csvEscape(row.label)},${row.count}`);
  for (const row of report.paths) lines.push(`path,${csvEscape(row.label)},${row.count}`);
  for (const row of report.userAgents) lines.push(`userAgent,${csvEscape(row.label)},${row.count}`);
  for (const row of report.ips) lines.push(`sourceIp,${csvEscape(row.label)},${row.count}`);

  lines.push("");
  lines.push("event_id,timestamp,source_ip,method,path,status,category,severity,reason");
  for (const e of report.recentEvents) {
    lines.push(
      [
        e.id,
        csvEscape(e.timestamp),
        csvEscape(e.source_ip),
        e.method,
        csvEscape(e.path),
        e.status_code,
        csvEscape(e.category),
        e.severity,
        csvEscape(e.detection_reason),
      ].join(","),
    );
  }

  lines.push("");
  lines.push("login_id,timestamp,source_ip,username,result,path");
  for (const l of report.logins) {
    lines.push(
      [l.id, csvEscape(l.timestamp), csvEscape(l.source_ip), csvEscape(l.username), l.result, csvEscape(l.path)].join(
        ",",
      ),
    );
  }

  return lines.join("\n");
}

export { RECOMMENDATIONS };
