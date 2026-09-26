import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const BACKUP_FILE_PATTERNS = [
  /\.(bak|backup|old|orig|save|swp|tmp)$/i,
  /\.(sql|sqlite|sqlite3|db3|mdb)$/i,
  /\.(env|git|svn|hg|DS_Store)$/i,
  /\/\.env/i,
  /\/\.git\//i,
  /\/\.git$|\/\.gitignore/i,
  /\/\.svn\//i,
  /\/web\.config$/i,
  /\/wp-config\.php/i,
  /\/config\.php$/i,
  /\/config\.json$/i,
  /\/settings\.json$/i,
  /\/\.aws\//i,
  /\/\.ssh\//i,
  /\/id_rsa/i,
  /\/dump/i,
  /\/backup/i,
  /\/\.htaccess/i,
  /\/\.htpasswd/i,
  /\/crossdomain\.xml$/i,
  /\/phpinfo/i,
  /\/\.well-known\/security\.txt/i,
];

export const backupFileDetector: Detector = {
  name: "backup-file",
  description: "Flags requests for configuration, backup, or credential-looking files.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const target = `${ctx.path}${ctx.rawQuery ? "?" + ctx.rawQuery : ""}`;
    const matched = BACKUP_FILE_PATTERNS.find((re) => re.test(target));
    if (!matched) return null;
    return hit(
      "Path Discovery",
      "High",
      "Request targeted a configuration or backup-looking file path (suspicious indicator)",
      "High",
    );
  },
};
