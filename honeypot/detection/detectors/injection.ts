import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const INJECTION_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /(\bunion\b[\s\S]{0,30}\bselect\b)|(\bselect\b[\s\S]{0,40}\bfrom\b)/i, label: "SQL select/union pattern" },
  { re: /('|")\s*(or|and)\s*('|")?\s*\d+\s*=\s*\d+/i, label: "SQL tautology pattern" },
  { re: /;\s*(drop|delete|update|insert|truncate)\b/i, label: "SQL stacked statement pattern" },
  { re: /\b(sleep|benchmark|pg_sleep|waitfor\s+delay)\s*\(/i, label: "SQL time-based pattern" },
  { re: /--\s*$|--\s|#\s*$/m, label: "SQL comment terminator" },
  { re: /<\s*script\b|javascript\s*:|onerror\s*=|onload\s*=/i, label: "XSS script pattern" },
  { re: /\$\{.*(env|process|require)/i, label: "template injection pattern" },
  { re: /\{\{.*\}\}/, label: "template expression pattern" },
  { re: /(\|\s*tee\b)|(\|\s*nc\b)|(\|\s*curl\b)|(\|\s*wget\b)|(`[^`]+`)|(\$\([^)]+\))/i, label: "shell command injection pattern" },
  { re: /\b(\/bin\/bash|\/bin\/sh|cmd\.exe|powershell\.exe)\b/i, label: "shell binary reference" },
  { re: /\beval\s*\(/i, label: "eval() call pattern" },
  { re: /\bbase64[-_]?decode\b|atob\s*\(/i, label: "obfuscation decoder pattern" },
  { re: /\b(union|select|insert|update|delete|drop|alter|create|truncate)\b.*\b(from|into|table|database)\b/i, label: "SQL keyword combination" },
  { re: /(\.\.\/)|(<script)|(%3cscript)/i, label: "generic payload marker" },
  { re: /\b(svn|git|hg|cvs)\b.*\bcheckout\b/i, label: "VCS keyword pattern" },
  { re: /jndi:(ldap|rmi|dns|iiop):/i, label: "JNDI lookup pattern" },
  { re: /\$\{jndi:/i, label: "Log4Shell-style JNDI pattern" },
];

export const injectionDetector: Detector = {
  name: "injection-pattern",
  description:
    "Flags query/body strings containing common SQL, XSS, command-injection, or template payload patterns. Input is treated as text only.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const values = [
      ctx.path,
      ctx.rawQuery,
      ...Object.values(ctx.query),
      ...Object.values(ctx.bodyFields),
    ];
    for (const { re, label } of INJECTION_PATTERNS) {
      if (values.some((v) => v && re.test(v))) {
        return hit(
          "Possible Injection Attempt",
          "High",
          `Suspicious indicator: request data matched a ${label} (pattern-based, not proof of a successful attack)`,
          "Medium",
        );
      }
    }
    return null;
  },
};
