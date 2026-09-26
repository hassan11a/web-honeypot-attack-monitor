import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const SENSITIVE_QUERY_KEYS = [
  "cmd",
  "exec",
  "command",
  "ping",
  "query",
  "shell",
  "run",
  "ip",
  "region",
  "upload",
  "file",
  "filename",
  "path",
  "dest",
  "continue",
  "url",
  "uri",
  "href",
  "redirect",
  "return",
  "next",
  "data",
  "debug",
  "test",
  "admin",
  "token",
  "api_key",
  "apikey",
  "access_token",
  "reset_token",
];

const PATH_PROBE = /\/(search|api|export|download|fetch|proxy|redirect|page|view|file|read|include|load)\b/i;

export const suspiciousQueryDetector: Detector = {
  name: "suspicious-query",
  description: "Flags query strings with command, redirect, file, or debug-style parameters.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const keys = Object.keys(ctx.query).map((k) => k.toLowerCase());
    if (keys.length === 0) return null;
    const matched = keys.filter((k) => SENSITIVE_QUERY_KEYS.includes(k));
    if (matched.length > 0 && PATH_PROBE.test(ctx.path)) {
      return hit(
        "Suspicious Request",
        "Medium",
        `Query string contains sensitive-looking parameter name(s): ${matched.join(", ")}`,
        "Low",
      );
    }
    if (matched.length >= 2) {
      return hit(
        "Suspicious Request",
        "Medium",
        `Multiple sensitive-looking query parameters observed: ${matched.join(", ")}`,
        "Low",
      );
    }
    const longValues = Object.values(ctx.query).filter((v) => v.length > 400);
    if (longValues.length > 0) {
      return hit(
        "Suspicious Request",
        "Low",
        "Query string contains unusually long parameter value(s) (possible encoded payload)",
        "Low",
      );
    }
    return null;
  },
};
