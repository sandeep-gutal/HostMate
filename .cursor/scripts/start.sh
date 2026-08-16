#!/usr/bin/env bash
set -euo pipefail

cd /workspace

load_env_file() {
  if [[ -f .env.local ]]; then
  node <<'NODE'
require("dotenv").config({ path: ".env.local", quiet: true });
for (const key of ["POSTGRES_URL", "DATABASE_URL"]) {
  const value = process.env[key];
  if (value) {
    process.stdout.write(`export ${key}=${JSON.stringify(value)}\n`);
  }
}
NODE
  fi
}

eval "$(load_env_file)"

if [[ -n "${POSTGRES_URL:-}" || -n "${DATABASE_URL:-}" ]]; then
  npm run db:setup
fi

exec npm run dev -- --hostname 0.0.0.0 --port 3000
