import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const AUTH_PATHS = [/\/login/i, /\/signin/i, /\/auth\b/i, /\/admin\/login/i, /\/wp-login\.php/i, /\/session/i];

export const authProbeDetector: Detector = {
  name: "auth-probe",
  description: "Flags repeated authentication endpoint activity from a single source.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const isAuthPath = AUTH_PATHS.some((re) => re.test(ctx.path));
    const hasCredentialFields =
      "username" in ctx.bodyFields ||
      "email" in ctx.bodyFields ||
      "user" in ctx.bodyFields ||
      "password" in ctx.bodyFields ||
      "pass" in ctx.bodyFields ||
      "pwd" in ctx.bodyFields;

    if (isAuthPath && ctx.recentAuthAttempts >= 3) {
      return hit(
        "Authentication Probing",
        "High",
        `Repeated authentication attempts detected from this source (${ctx.recentAuthAttempts} recent attempts)`,
        "High",
      );
    }
    if (isAuthPath && hasCredentialLikeFields(ctx)) {
      return hit(
        "Authentication Probing",
        "Medium",
        "Request submitted credential-like fields to an authentication path",
        "Medium",
      );
    }
    if (isAuthPath && ctx.method.toUpperCase() === "POST" && !hasCredentialFields) {
      return hit(
        "Authentication Probing",
        "Low",
        "POST submitted to an authentication path without standard credential field names",
        "Low",
      );
    }
    return null;
  },
};

function hasCredentialLikeFields(ctx: DetectionContext): boolean {
  return (
    "username" in ctx.bodyFields ||
    "email" in ctx.bodyFields ||
    "user" in ctx.bodyFields ||
    "login" in ctx.bodyFields
  );
}
