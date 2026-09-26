import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getSecurityEvent } from "@/database/repositories";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/events/[id]">) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  const event = await getSecurityEvent(numericId);
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ event });
}
