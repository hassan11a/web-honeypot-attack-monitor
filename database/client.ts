export type SqlParam = string | number | boolean | null | Buffer;

export interface DbClient {
  dialect: "sqlite" | "postgres";
  all<T = Record<string, unknown>>(sql: string, params?: SqlParam[]): Promise<T[]>;
  get<T = Record<string, unknown>>(sql: string, params?: SqlParam[]): Promise<T | undefined>;
  run(sql: string, params?: SqlParam[]): Promise<{ changes: number }>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

/** Converts `?` placeholders to `$1..$n` for Postgres. Strings are not parsed for `?` inside literals (we avoid literal `?` in SQL). */
export function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}
