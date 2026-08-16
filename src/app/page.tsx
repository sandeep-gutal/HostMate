import { CreateEventForm } from "@/components/create-event-form";
import { SiteHeader } from "@/components/site-header";
import { EVENT_TEMPLATES } from "@/lib/templates";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-16">
      <SiteHeader />
      <section className="grid gap-5 pt-4">
        <p className="text-sm font-medium text-primary">For society functions, festivals, and birthdays</p>
        <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          Run the evening from one phone.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          HostMate is the invite + playlist + teleprompter for community events. Guests RSVP and
          send songs. You play them in the app. Presenter notes stay on screen — and everything
          saves to the database, not just this browser.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {["Organizer desk", "On-stage presenter", "Guest invite"].map((label) => (
            <span key={label} className="rounded-full border bg-card/80 px-3 py-1 text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </section>

      <CreateEventForm />

      <section className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Start from a finished programme</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {EVENT_TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-2xl border bg-card/80 p-4 text-sm backdrop-blur">
              <p className="font-medium">{t.name}</p>
              <p className="mt-1 text-muted-foreground">
                {t.script_sections.length} script beats · {t.songs.length} songs ·{" "}
                {t.activities.length} games
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
