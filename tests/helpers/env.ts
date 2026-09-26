import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function tempDbPath(name: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "honeypot-test-"));
  return path.join(dir, `${name}.db`);
}

export function useTempDbEnv(name = "test"): string {
  const file = tempDbPath(name);
  process.env.DB_CLIENT = "sqlite";
  process.env.SQLITE_FILE = file;
  (process.env as Record<string, string | undefined>).NODE_ENV = "test";
  return file;
}
