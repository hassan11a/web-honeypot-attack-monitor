import { config } from "@/lib/config";
import type { DbClient } from "./client";
import { createPostgresClient } from "./postgres";
import { createSqliteClient } from "./sqlite";
import { migrate } from "./schema";

export type { DbClient, SqlParam } from "./client";

let client: DbClient | null = null;
let migrated = false;

export async function getDb(): Promise<DbClient> {
  if (!client) {
    client =
      config.dbClient === "postgres"
        ? createPostgresClient(config.postgresUrl)
        : createSqliteClient(config.sqliteFile);
  }
  if (!migrated) {
    await migrate(client);
    migrated = true;
  }
  return client;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    migrated = false;
  }
}
