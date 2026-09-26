import type { DetectionContext } from "@/types";
import { hit, type Detector } from "../types";

const SCANNER_AGENTS: Array<{ re: RegExp; label: string }> = [
  { re: /sqlmap/i, label: "sqlmap" },
  { re: /nikto/i, label: "Nikto" },
  { re: /nmap|zmap|masscan/i, label: "network scanner" },
  { re: /gobuster|dirbuster|dirb|feroxbuster|wfuzz|ffuf/i, label: "content discovery tool" },
  { re: /wpscan|joomscan|droopescan/i, label: "CMS scanner" },
  { re: /acunetix|nessus|openvas|qualys|havij|arachni|w3af/i, label: "vulnerability scanner" },
  { re: /zgrab|censys|shodan|internetdb/i, label: "internet scanning service" },
  { re: /python-requests\/|python-urllib|go-http-client|libwww-perl|winhttp|java\/1\./i, label: "scripted HTTP client" },
  { re: /httpclient|okhttp|scrapy|crawler|spiderbot/i, label: "crawler/HTTP client" },
  { re: /emailcollector|hrefparse|scanalert/i, label: "scraping tool" },
  { re: /"scan"|scanner\/|vulnerability/i, label: "scanner-like user agent" },
];

export const scannerUserAgentDetector: Detector = {
  name: "scanner-user-agent",
  description: "Flags user agents commonly used by security scanners and scripted clients.",
  enabledByDefault: true,
  detect(ctx: DetectionContext) {
    const matched = SCANNER_AGENTS.find(({ re }) => re.test(ctx.userAgent));
    if (!matched) return null;
    return hit(
      "Scanner Activity",
      "Medium",
      `User-Agent resembles a known scanning tool (${matched.label})`,
      "Medium",
    );
  },
};
