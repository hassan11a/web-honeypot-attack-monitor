import "server-only";
import { cookies } from "next/headers";
import { getDb } from "@/database";
import { config } from "@/lib/config";
import { generateSessionToken, hashPassword, hashToken, verifyPassword } from "@/lib/password";

export interface SessionUser {
  username: string;
  expiresAt: string;
}

interface SessionRow {
  token_hash: string;
  username: string;
  expires_at: string;
}

export async function bootstrapAdmin(): Promise<void> {
  const db = await getDb();
  const existing = await db.get<{ id: number }>("SELECT id FROM dashboard_users LIMIT 1");
  if (existing) return;
  const username = config.dashboardUser;
  const password = config.dashboardPassword || "ChangeMe-Str0ng!";
  await db.run(
    "INSERT INTO dashboard_users (username, password_hash, created_at) VALUES (?, ?, ?)",
    [username, hashPassword(password), new Date().toISOString()],
  );
}

export async function hasAdminUser(): Promise<boolean> {
  const db = await getDb();
  const row = await db.get<{ id: number }>("SELECT id FROM dashboard_users LIMIT 1");
  return Boolean(row);
}

const failedLogins = new Map<string, { count: number; resetAt: number }>();
const LOGIN_MAX_FAILURES = 8;
const LOGIN_WINDOW_MS = 15 * 60_000;

export function loginRateKey(ip: string): string | null {
  const entry = failedLogins.get(ip);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    failedLogins.delete(ip);
    return null;
  }
  return entry.count >= LOGIN_MAX_FAILURES ? ip : null;
}

export function noteFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = failedLogins.get(ip);
  if (!entry || now > entry.resetAt) {
    failedLogins.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearFailedLogins(ip: string): void {
  failedLogins.delete(ip);
}

export async function authenticate(username: string, password: string): Promise<boolean> {
  const db = await getDb();
  const user = await db.get<{ username: string; password_hash: string }>(
    "SELECT username, password_hash FROM dashboard_users WHERE username = ?",
    [username],
  );
  if (!user) {
    // Constant-ish work even when user missing
    verifyPassword(password, "scrypt$16384$00000000000000000000000000000000$" + "00".repeat(64));
    return false;
  }
  return verifyPassword(password, user.password_hash);
}

export async function createSession(username: string, ip: string, userAgent: string): Promise<string> {
  const db = await getDb();
  const token = generateSessionToken();
  const now = new Date();
  const expires = new Date(now.getTime() + config.sessionTtlHours * 3600_000);
  await db.run(
    "INSERT INTO dashboard_sessions (token_hash, username, created_at, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
    [hashToken(token), username, now.toISOString(), expires.toISOString(), ip, userAgent.slice(0, 256)],
  );
  return token;
}

export async function destroySession(token: string): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM dashboard_sessions WHERE token_hash = ?", [hashToken(token)]);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(config.sessionCookieName)?.value;
  if (!token) return null;
  const db = await getDb();
  const row = await db.get<SessionRow>(
    "SELECT token_hash, username, expires_at FROM dashboard_sessions WHERE token_hash = ?",
    [hashToken(token)],
  );
  if (!row) return null;
  if (Date.parse(row.expires_at) < Date.now()) {
    await db.run("DELETE FROM dashboard_sessions WHERE token_hash = ?", [hashToken(token)]);
    return null;
  }
  return { username: row.username, expiresAt: row.expires_at };
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(config.sessionCookieName, token, {
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: config.sessionTtlHours * 3600,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(config.sessionCookieName);
}

export async function cleanupExpiredSessions(): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM dashboard_sessions WHERE expires_at < ?", [new Date().toISOString()]);
}
