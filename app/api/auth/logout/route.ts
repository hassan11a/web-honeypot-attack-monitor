import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { clearSessionCookie, destroySession } from "@/lib/auth";

export async function POST() {
  const store = await cookies();
  const token = store.get(config.sessionCookieName)?.value;
  if (token) await destroySession(token);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
