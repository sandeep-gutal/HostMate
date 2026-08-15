import Link from "next/link";
import { CreateEventForm } from "@/components/create-event-form";
import { EVENT_TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <header className="grid gap-3">
        <p className="text-sm font-medium text-primary">HostMate</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Run the society function without losing the plot.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          A phone-first toolkit for Independence Day, Diwali, annual day, birthdays, and mixers.
          Private host link. Public guest link. No login. No AI API calls — templates and a
          copy-paste prompt instead.
        </p>
      </header>

      <CreateEventForm />

      <section className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Shipped templates</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {EVENT_TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-xl border bg-card p-4 text-sm">
              <p className="font-medium">{t.name}</p>
              <p className="text-muted-foreground">
                {t.script_sections.length} script parts · {t.songs.length} songs ·{" "}
                {t.activities.length} activities
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">
        Already have a host link? Open it from your notes. Guests go to the public event URL the
        host shares.{" "}
        <Link className="underline" href="/#create">
          Create a new event above.
        </Link>
      </p>
    </main>
  );
}
