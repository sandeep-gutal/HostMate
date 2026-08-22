import { unstable_noStore as noStore } from "next/cache";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let sql: Sql | null = null;

export function getSql(): Sql {
  noStore();
  if (!sql) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "Set POSTGRES_URL (Vercel Postgres / Neon) or DATABASE_URL before using the database."
      );
    }
    sql = neon(url);
  }
  return sql;
}

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  const client = getSql();
  try {
    await client`ALTER TABLE events ADD COLUMN IF NOT EXISTS live_item_id UUID`;
    await client`ALTER TABLE events ADD COLUMN IF NOT EXISTS live_status TEXT NOT NULL DEFAULT 'idle'`;
    schemaReady = true;
  } catch (err) {
    schemaReady = false;
    const message = err instanceof Error ? err.message : "Database schema check failed.";
    if (/relation "events" does not exist/i.test(message)) {
      throw new Error(
        "Database tables are missing. Run npm run db:setup (or npm run db:migrate) against your Postgres database."
      );
    }
    throw err;
  }
}
