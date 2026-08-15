import { readFileSync, readdirSync } from "fs";
import path from "path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

function getUrl() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Set POSTGRES_URL or DATABASE_URL in .env.local");
  }
  return url;
}

function splitSql(sql: string) {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

async function migrate() {
  const sql = neon(getUrl());
  const dir = path.join(process.cwd(), "db/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const raw = readFileSync(path.join(dir, file), "utf8");
    for (const stmt of splitSql(raw)) {
      await sql.query(stmt);
    }
    console.log(`Applied ${file}`);
  }
}

async function seed() {
  const sql = neon(getUrl());
  const dir = path.join(process.cwd(), "data/templates");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const payload = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as {
      id: string;
      name: string;
      type: string;
    };
    await sql`
      INSERT INTO templates (id, name, type, payload)
      VALUES (${payload.id}, ${payload.name}, ${payload.type}, ${JSON.stringify(payload)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        payload = EXCLUDED.payload
    `;
    console.log(`Seeded template ${payload.id}`);
  }
}

const cmd = process.argv[2];
if (cmd === "seed") {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  migrate()
    .then(() => {
      if (cmd === "all") return seed();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
