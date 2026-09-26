import path from "node:path";

function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  get isProduction() {
    return this.env === "production";
  },
  dbClient: (process.env.DB_CLIENT ?? "sqlite") as "sqlite" | "postgres",
  sqliteFile: process.env.SQLITE_FILE ?? path.join(process.cwd(), "data", "honeypot.db"),
  postgresUrl: process.env.DATABASE_URL ?? "",
  honeypotPort: int(process.env.HONEYPOT_PORT, 8080),
  dashboardPort: int(process.env.PORT, 3000),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "hp_session",
  sessionTtlHours: int(process.env.SESSION_TTL_HOURS, 12),
  dashboardUser: process.env.DASHBOARD_USER ?? "admin",
  dashboardPassword: process.env.DASHBOARD_PASSWORD ?? "",
  maxRequestBodyBytes: int(process.env.MAX_REQUEST_BODY_BYTES, 64 * 1024),
  maxQueryLength: int(process.env.MAX_QUERY_LENGTH, 2048),
  requestTimeoutMs: int(process.env.REQUEST_TIMEOUT_MS, 15_000),
  trustProxy: process.env.TRUST_PROXY === "1",
  secureCookies: process.env.SECURE_COOKIES === "1",
  enableTestData: process.env.ENABLE_TEST_DATA === "1" && process.env.NODE_ENV !== "production",
};

export type AppConfig = typeof config;
