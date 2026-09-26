import { DEFAULT_SETTINGS, type AppSettings } from "@/types";
import { getAllSettings, setSetting } from "@/database/repositories";

const KEYS: Array<keyof AppSettings> = [
  "rateLimitMaxRequests",
  "rateLimitWindowSeconds",
  "rateLimitDelayMs",
  "authAttemptThreshold",
  "sensitivePathThreshold",
  "requestsPerMinuteAlert",
  "scannerWindowMinutes",
];

function parseIntSafe(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await getAllSettings();
  return {
    rateLimitMaxRequests: parseIntSafe(raw.rateLimitMaxRequests, DEFAULT_SETTINGS.rateLimitMaxRequests),
    rateLimitWindowSeconds: parseIntSafe(raw.rateLimitWindowSeconds, DEFAULT_SETTINGS.rateLimitWindowSeconds),
    rateLimitDelayMs: parseIntSafe(raw.rateLimitDelayMs, DEFAULT_SETTINGS.rateLimitDelayMs),
    authAttemptThreshold: parseIntSafe(raw.authAttemptThreshold, DEFAULT_SETTINGS.authAttemptThreshold),
    sensitivePathThreshold: parseIntSafe(raw.sensitivePathThreshold, DEFAULT_SETTINGS.sensitivePathThreshold),
    requestsPerMinuteAlert: parseIntSafe(raw.requestsPerMinuteAlert, DEFAULT_SETTINGS.requestsPerMinuteAlert),
    scannerWindowMinutes: parseIntSafe(raw.scannerWindowMinutes, DEFAULT_SETTINGS.scannerWindowMinutes),
  };
}

export async function saveSettings(input: Partial<AppSettings>): Promise<AppSettings> {
  for (const key of KEYS) {
    const value = input[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      await setSetting(key, String(Math.floor(value)));
    }
  }
  return loadSettings();
}
