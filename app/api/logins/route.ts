import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listLoginEvents } from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 500);
  const ip = url.searchParams.get("ip") ?? undefined;
  const logins = await listLoginEvents(limit, ip);
  return NextResponse.json({ logins });
}
