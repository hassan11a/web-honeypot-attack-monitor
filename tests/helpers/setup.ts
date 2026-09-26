import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honeypot-vitest-"));
process.env.DB_CLIENT = "sqlite";
process.env.SQLITE_FILE = path.join(dir, "test.db");
(process.env as Record<string, string | undefined>).NODE_ENV = "test";
process.env.SECURE_COOKIES = "0";
process.env.LOG_LEVEL = "error";
process.env.DASHBOARD_USER = "tester";
process.env.DASHBOARD_PASSWORD = "TestOnly-Password123!";
process.env.SESSION_COOKIE_NAME = "hp_session";
