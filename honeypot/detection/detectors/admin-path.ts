import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const ADMIN_PATH_PATTERNS = [
  /\/admin\b/i,
  /\/administrator\b/i,
  /\/wp-admin\b/i,
  /\/wp-login/i,
  /\/phpmyadmin\b/i,
  /\/pma\b/i,
  /\/myadmin\b/i,
  /\/manager\b/i,
  /\/manager-html/i,
  /\/console\b/i,
  /\/cpanel\b/i,
  /\/webmail\b/i,
  /\/backend\b/i,
  /\/controlpanel\b/i,
  /\/c\/admin/i,
  /\/adminer/i,
  /\/dashboard\b/i,
  /\/panel\b/i,
  /\/superuser\b/i,
  /\/solr\b/i,
  /\/jmx-console/i,
];

export const adminPathDetector: Detector = {
  name: "admin-path",
  description: "Flags requests targeting common administrative or control-panel paths.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const matched = ADMIN_PATH_PATTERNS.find((re) => re.test(ctx.path));
    if (!matched) return null;
    return hit(
      "Path Discovery",
      "Medium",
      `Request targeted a sensitive-looking administrative path: ${ctx.path}`,
      "High",
    );
  },
};
