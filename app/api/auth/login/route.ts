import { NextResponse } from "next/server";
import { authenticate, clearFailedLogins, createSession, loginRateKey, noteFailedLogin, setSessionCookie, bootstrapAdmin } from "@/lib/auth";
import { clientIpFrom } from "@/lib/api-auth";

export async function POST(request: Request) {
  await bootstrapAdmin();
  const ip = clientIpFrom(request);
  if (loginRateKey(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = (body.username ?? "").trim().slice(0, 128);
  const password = body.password ?? "";
  if (!username || !password || password.length > 256) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const ok = await authenticate(username, password);
  if (!ok) {
    noteFailedLogin(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearFailedLogins(ip);
  const token = await createSession(username, ip, request.headers.get("user-agent") ?? "");
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, username });
}
