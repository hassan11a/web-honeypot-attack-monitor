import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { countSecurityEvents, listSecurityEvents } from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const suspiciousOnly = url.searchParams.get("suspicious") === "1";
  const category = url.searchParams.get("category") ?? undefined;
  const severity = url.searchParams.get("severity") ?? undefined;
  const ip = url.searchParams.get("ip") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? 100) || 100;
  const offset = Number(url.searchParams.get("offset") ?? 0) || 0;
  const stream = url.searchParams.get("stream") === "1";
  const sinceId = Number(url.searchParams.get("sinceId") ?? 0) || 0;

  const filters = { suspiciousOnly, category, severity, ip, search, limit, offset };

  if (stream) {
    const events = await listSecurityEvents({ limit: Math.min(limit, 50) });
    const newer = sinceId > 0 ? events.filter((e) => e.id > sinceId) : events;
    return NextResponse.json({ events: newer, latestId: events[0]?.id ?? sinceId });
  }

  const [events, total] = await Promise.all([
    listSecurityEvents(filters),
    countSecurityEvents(filters),
  ]);
  return NextResponse.json({ events, total, limit, offset });
}
