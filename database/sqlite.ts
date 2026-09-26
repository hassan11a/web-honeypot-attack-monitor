import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { DbClient, SqlParam } from "./client";

export function createSqliteClient(file: string): DbClient {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  const raw = new Database(file);
  raw.pragma("journal_mode = WAL");
  raw.pragma("foreign_keys = ON");

  return {
    dialect: "sqlite",
    async all<T>(sql: string, params: SqlParam[] = []): Promise<T[]> {
      return raw.prepare(sql).all(...(params as never[])) as T[];
    },
    async get<T>(sql: string, params: SqlParam[] = []): Promise<T | undefined> {
      return raw.prepare(sql).get(...(params as never[])) as T | undefined;
    },
    async run(sql: string, params: SqlParam[] = []) {
      const info = raw.prepare(sql).run(...(params as never[]));
      return { changes: info.changes };
    },
    async exec(sql: string) {
      raw.exec(sql);
    },
    async close() {
      raw.close();
    },
  };
}
