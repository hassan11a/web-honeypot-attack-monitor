import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { acknowledgeAlert, listAlerts } from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);
  const activeOnly = url.searchParams.get("active") === "1";
  const alerts = await listAlerts(limit, !activeOnly);
  return NextResponse.json({ alerts });
}

export async function PATCH(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  let body: { id?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (typeof body.id !== "number") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await acknowledgeAlert(body.id);
  return NextResponse.json({ ok: true });
}
