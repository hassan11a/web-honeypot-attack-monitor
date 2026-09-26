export function normalizeIp(raw: string | undefined | null): string {
  if (!raw) return "unknown";
  let ip = raw.trim();
  if (ip.includes(",")) ip = ip.split(",")[0]!.trim();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (ip === "1" || ip.length === 0) return "unknown";
  return ip.slice(0, 64);
}

export function isPrivateIp(ip: string): boolean {
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^fe80:/i.test(ip) || /^fc00:/i.test(ip)) return true;
  return false;
}

export function ipKey(ip: string): string {
  return ip.replace(/[^0-9a-zA-Z:._-]/g, "_").slice(0, 64);
}
