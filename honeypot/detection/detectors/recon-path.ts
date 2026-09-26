import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const RECON_PATHS = [
  /\/\.git\b/i,
  /\/\.svn\b/i,
  /\/\.hg\b/i,
  /\/server-status/i,
  /\/server-info/i,
  /\/actuator\b/i,
  /\/actuator\/(env|health|heapdump|metrics)/i,
  /\/jmx-console/i,
  /\/invoker\/jmx/i,
  /\/\.DS_Store/i,
  /\/thumbs\.db$/i,
  /\/\boomerang\b/i,
  /\/remote\/login/i,
  /\/shell\b/i,
  /\/eval\b/i,
  /\/solr\/admin/i,
  /\/api-docs/i,
  /\/swagger\b/i,
  /\/graphql\b/i,
  /\/debug\/default\/view/i,
  /\/vendor\/phpunit/i,
  /\/elmah/i,
  /\/trace\.axd/i,
  /\/_profiler/i,
  /\/cgi-bin\b/i,
  /\/fm\/webselfservice/i,
  /\/hudson\b/i,
  /\/job\/\b/i,
  /\/boaform\b/i,
  /\/setup\.php$/i,
  /\/install\.php$/i,
  /\/\.aws\/credentials/i,
  /\/\.dockerenv/i,
  /\/proc\/self\/environ/i,
];

export const reconDetector: Detector = {
  name: "recon-path",
  description: "Flags paths commonly probed during reconnaissance and enumeration.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const matched = RECON_PATHS.find((re) => re.test(ctx.path));
    if (!matched) return null;
    return hit(
      "Reconnaissance",
      "Medium",
      `Request targeted a path commonly probed during reconnaissance: ${ctx.path}`,
      "Medium",
    );
  },
};
