import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listIpActivity } from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? 100) || 100;
  const ips = await listIpActivity(Math.min(limit, 500));
  return NextResponse.json({ ips });
}
