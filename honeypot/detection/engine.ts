import { getDetectorStates } from "@/database/repositories";
import type { DetectionContext, EngineDetection, EventCategory, Severity } from "@/types";
import { adminPathDetector } from "./detectors/admin-path";
import { authProbeDetector } from "./detectors/auth-probe";
import { backupFileDetector } from "./detectors/backup-file";
import { frequencyDetector } from "./detectors/frequency";
import { injectionDetector } from "./detectors/injection";
import { reconDetector } from "./detectors/recon-path";
import { scannerUserAgentDetector } from "./detectors/scanner-user-agent";
import { suspiciousQueryDetector } from "./detectors/suspicious-query";
import { traversalDetector } from "./detectors/traversal";
import { unexpectedMethodDetector } from "./detectors/unexpected-method";
import type { Detector } from "./types";

export const allDetectors: Detector[] = [
  adminPathDetector,
  backupFileDetector,
  traversalDetector,
  injectionDetector,
  scannerUserAgentDetector,
  unexpectedMethodDetector,
  authProbeDetector,
  frequencyDetector,
  reconDetector,
  suspiciousQueryDetector,
];

const SEVERITY_RANK: Record<Severity, number> = {
  Info: 0,
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

const CONFIDENCE_RANK = { Low: 0, Medium: 1, High: 2 } as const;

export function detectorCatalog() {
  return allDetectors.map((d) => ({
    name: d.name,
    description: d.description,
    enabledByDefault: d.enabledByDefault,
  }));
}

export async function runDetection(ctx: DetectionContext): Promise<EngineDetection> {
  let states: Record<string, boolean> = {};
  try {
    states = await getDetectorStates();
  } catch {
    states = {};
  }

  const matches: EngineDetection["matches"] = [];
  for (const detector of allDetectors) {
    const enabled = states[detector.name] ?? detector.enabledByDefault;
    if (!enabled) continue;
    try {
      const result = detector.detect(ctx);
      if (result?.detected) {
        matches.push({
          detector: detector.name,
          category: result.category,
          severity: result.severity,
          reason: result.reason,
          confidence: result.confidence,
        });
      }
    } catch {
      // A detector failure must never break request handling.
    }
  }

  if (matches.length === 0) {
    return {
      detected: false,
      category: "Normal Traffic",
      severity: "Info",
      reason: "No suspicious indicators matched active detection rules",
      confidence: "High",
      matches: [],
    };
  }

  const top = [...matches].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  const primary = top[0]!;
  const reason = matches.map((m) => m.reason).join("; ");
  const confidence = matches.reduce(
    (acc, m) => (CONFIDENCE_RANK[m.confidence] > CONFIDENCE_RANK[acc] ? m.confidence : acc),
    "Low" as "Low" | "Medium" | "High",
  );

  return {
    detected: true,
    category: primary.category as EventCategory,
    severity: primary.severity,
    reason,
    confidence,
    matches,
  };
}
