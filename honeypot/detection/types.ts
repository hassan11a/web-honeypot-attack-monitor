import type { DetectionContext, DetectionResult } from "@/types";

export interface Detector {
  name: string;
  description: string;
  enabledByDefault: boolean;
  detect(ctx: DetectionContext): DetectionResult | null;
}

export function hit(
  category: DetectionResult["category"],
  severity: DetectionResult["severity"],
  reason: string,
  confidence: DetectionResult["confidence"] = "Medium",
): DetectionResult {
  return { category, severity, detected: true, reason, confidence };
}
