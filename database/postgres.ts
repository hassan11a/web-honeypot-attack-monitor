import { Pool } from "pg";
import { toPgPlaceholders, type DbClient, type SqlParam } from "./client";

export function createPostgresClient(connectionString: string): DbClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when DB_CLIENT=postgres");
  }
  const pool = new Pool({ connectionString, max: 10 });

  return {
    dialect: "postgres",
    async all<T>(sql: string, params: SqlParam[] = []): Promise<T[]> {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return res.rows as T[];
    },
    async get<T>(sql: string, params: SqlParam[] = []): Promise<T | undefined> {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return res.rows[0] as T | undefined;
    },
    async run(sql: string, params: SqlParam[] = []) {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return { changes: res.rowCount ?? 0 };
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    },
  };
}
