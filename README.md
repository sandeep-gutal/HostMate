# HostMate

A phone-first toolkit for people hosting community and society events — Independence Day functions, Diwali nights, annual day, birthdays, and mixers.

You get a **private host link** (secret token, no login) and a **public guest link** for RSVPs, song requests, and performance sign-ups.

HostMate does **not** call any AI API. “Get script help” builds a prompt you copy into ChatGPT, Claude, or Gemini, then paste the result back.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Postgres via [`@neondatabase/serverless`](https://github.com/neondatabase/serverless) (MIT)
- Deploy on **Vercel Hobby (free)** + **Neon / Vercel Postgres free tier**

Vercel’s old `@vercel/postgres` package is sunset. This app talks to the same Neon-backed database using `POSTGRES_URL` (still injected by Vercel Postgres) or `DATABASE_URL` (Neon).

## 1. Scaffold (already done in this repo)

```bash
npm install
```

UI primitives live in `src/components/ui` (shadcn/ui). App code is in `src/`.

## 2. Database schema and seed

SQL migrations:

- `db/migrations/001_init.sql` — events, participants, submissions, script_sections, activities, templates, timeline_items

Templates (cloned into new events, also seeded into `templates`):

- `data/templates/independence-day.json`
- `data/templates/diwali.json`
- `data/templates/annual-day.json`
- `data/templates/kids-birthday.json`
- `data/templates/corporate.json`

```bash
npm run db:migrate   # apply SQL files
npm run db:seed      # upsert /data/templates into templates
# or both:
npm run db:setup
```

These scripts load `.env.local` then `.env`. They need `POSTGRES_URL` or `DATABASE_URL`.

## 3. Create a free Postgres database and deploy

### Option A — Vercel Marketplace Neon (recommended)

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new).
2. In the Vercel project: **Storage → Create Database → Neon Postgres** (Hobby / free).
3. Connect the database to the project. Vercel will set `POSTGRES_URL`, `DATABASE_URL`, and related vars on Production / Preview / Development.
4. Pull env locally:

```bash
npx vercel link
npx vercel env pull .env.local
```

5. Run migrations against that database:

```bash
npm run db:setup
```

6. Deploy:

```bash
npx vercel deploy
# production:
npx vercel deploy --prod
```

Or click **Deploy** after the GitHub import. After first deploy, run `npm run db:setup` once with production env (or use `npx vercel env pull` from production and run locally). You can also open the Neon SQL editor and paste `db/migrations/001_init.sql`, then run `npm run db:seed`.

### Option B — Vercel Postgres storage (legacy name, still Neon)

1. Project → **Storage → Create Database → Postgres**.
2. Confirm `POSTGRES_URL` is present: `npx vercel env ls`.
3. Same migrate / seed / deploy steps as above.

### Option C — Neon console

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Copy the **pooled** connection string.
3. Locally: put it in `.env.local` as `POSTGRES_URL` (and `DATABASE_URL`).
4. In Vercel: **Settings → Environment Variables** → add `POSTGRES_URL` and `DATABASE_URL` for Production, Preview, and Development.
5. `npm run db:setup` then `npx vercel deploy`.

### Env file

Copy `.env.example` to `.env.local`:

```
POSTGRES_URL=postgres://...
DATABASE_URL=postgres://...
```

Never commit `.env.local`.

## 4. Local development

```bash
npm install
npx vercel env pull .env.local   # or paste POSTGRES_URL yourself
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Feature map

| Area | Where |
| --- | --- |
| Event setup | Home page — template or blank; creates host + public links |
| Get script help | Host → **Script** — copy prompt, paste result, auto-split sections |
| Templates | `data/templates` cloned on create |
| Songs / performances | Host → **Songs** (drag to reorder); guests submit on `/e/[id]` |
| Activities | Host → **Activities** — static library + custom |
| Run of show | Host → **Run of show** — combined timeline + durations |
| Presenter mode | `/h/[token]/present` — large high-contrast type |
| Guest portal | `/e/[id]` — RSVP, fun fact, song/performance sign-up |

## Routes

- `/` — create event
- `/h/[host_token]` — private admin (treat the URL as a password)
- `/h/[host_token]/present` — presenter mode
- `/e/[event_id]` — public participant page

## Build order (how this repo was assembled)

1. Event setup  
2. Template seed data  
3. Get script help (prompt + paste + parse)  
4. Song and activity management  
5. Run-of-show + presenter mode  
6. Participant portal  

## License

Application code in this repository is provided for the HostMate project. Dependencies are MIT-licensed open source (Next.js, React, Tailwind, Radix, Neon serverless driver, dnd-kit, lucide).
