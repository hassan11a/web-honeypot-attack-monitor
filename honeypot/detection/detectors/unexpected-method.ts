import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const ALLOWED_METHODS = new Set(["GET", "POST", "HEAD", "OPTIONS"]);
const SUSPICIOUS_METHODS = new Set(["PUT", "DELETE", "TRACE", "TRACK", "CONNECT", "PATCH", "PROPFIND", "DEBUG"]);

export const unexpectedMethodDetector: Detector = {
  name: "unexpected-method",
  description: "Flags HTTP methods that are unusual for a public website.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const method = ctx.method.toUpperCase();
    if (SUSPICIOUS_METHODS.has(method)) {
      return hit(
        "Suspicious Request",
        "Medium",
        `Unexpected HTTP method ${method} received on a public web path`,
        "High",
      );
    }
    if (!ALLOWED_METHODS.has(method)) {
      return hit(
        "Suspicious Request",
        "Low",
        `Non-standard HTTP method ${method} observed`,
        "Medium",
      );
    }
    return null;
  },
};
