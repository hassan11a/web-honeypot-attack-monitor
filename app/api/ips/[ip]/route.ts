import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  getIpActivity,
  getIpTopPaths,
  listLoginEvents,
  listSecurityEvents,
} from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/ips/[ip]">) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { ip } = await ctx.params;
  const decoded = decodeURIComponent(ip);
  const [activity, paths, events, logins] = await Promise.all([
    getIpActivity(decoded),
    getIpTopPaths(decoded, 10),
    listSecurityEvents({ ip: decoded, limit: 100 }),
    listLoginEvents(50, decoded),
  ]);
  if (!activity && events.length === 0) {
    return NextResponse.json({ error: "IP not found" }, { status: 404 });
  }
  return NextResponse.json({ activity, paths, events, logins });
}
