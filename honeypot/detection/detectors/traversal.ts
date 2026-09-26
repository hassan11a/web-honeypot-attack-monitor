import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%2e%2e\//i,
  /\.\.%2f/i,
  /%2e%2e\\/i,
  /\/etc\/passwd/i,
  /\/etc\/shadow/i,
  /\/proc\/self\//i,
  /\/windows\/win\.ini/i,
  /\/boot\.ini/i,
  /c:\\windows\\/i,
  /\.\.%00/i,
  /%252e%252e/i,
  /\/\.\.\//,
];

export const traversalDetector: Detector = {
  name: "path-traversal",
  description: "Flags directory-traversal indicators in path or query strings.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const haystacks = [ctx.path, ctx.rawQuery, ...Object.values(ctx.query), ...Object.values(ctx.bodyFields)];
    const matchedPattern = TRAVERSAL_PATTERNS.find((re) => haystacks.some((h) => re.test(h)));
    if (!matchedPattern) return null;
    return hit(
      "Possible Traversal Attempt",
      "High",
      "Request contains directory-traversal indicators (possible traversal attempt, pattern-based)",
      "Medium",
    );
  },
};
