import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

export const frequencyDetector: Detector = {
  name: "request-frequency",
  description: "Flags unusually high request frequency from a single source IP.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    if (ctx.recentRequestCount >= 200) {
      return hit(
        "Rate Limit Violation",
        "High",
        `Source generated ${ctx.recentRequestCount} requests inside the monitoring window (possible automated activity)`,
        "High",
      );
    }
    if (ctx.recentRequestCount >= 100) {
      return hit(
        "Rate Limit Violation",
        "Medium",
        `Source generated ${ctx.recentRequestCount} requests inside the monitoring window`,
        "Medium",
      );
    }
    return null;
  },
};
