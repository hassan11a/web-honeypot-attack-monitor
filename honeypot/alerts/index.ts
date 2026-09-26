import { insertAlert } from "@/database/repositories";
import { DEFAULT_SETTINGS, type Severity } from "@/types";
import { getAllSettings } from "@/database/repositories";

export interface AlertInput {
  type: string;
  title: string;
  reason: string;
  sourceIp: string | null;
  severity?: Severity;
  count?: number;
}

function num(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function evaluateAlerts(input: AlertInput): Promise<void> {
  await insertAlert({
    timestamp: new Date().toISOString(),
    type: input.type,
    severity: input.severity ?? "Medium",
    title: input.title,
    reason: input.reason,
    source_ip: input.sourceIp,
    count: input.count ?? 1,
  });
}

export async function getAlertThresholds() {
  const settings = await getAllSettings();
  return {
    authAttemptThreshold: num(settings.authAttemptThreshold, DEFAULT_SETTINGS.authAttemptThreshold),
    sensitivePathThreshold: num(settings.sensitivePathThreshold, DEFAULT_SETTINGS.sensitivePathThreshold),
    requestsPerMinuteAlert: num(settings.requestsPerMinuteAlert, DEFAULT_SETTINGS.requestsPerMinuteAlert),
    scannerWindowMinutes: num(settings.scannerWindowMinutes, DEFAULT_SETTINGS.scannerWindowMinutes),
  };
}
