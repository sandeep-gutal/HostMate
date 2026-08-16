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

export function getConnectionUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL;
}
