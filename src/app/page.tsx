import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Cake,
  Flag,
  GraduationCap,
  Music2,
  Presentation,
  Sparkles,
  Users,
} from "lucide-react";
import { CreateEventForm } from "@/components/create-event-form";
import { SiteHeader } from "@/components/site-header";
import { EVENT_TEMPLATES } from "@/lib/templates";

const FEATURES = [
  {
    icon: Users,
    title: "Guest invites",
    description: "RSVPs and song requests on a public link — no accounts.",
  },
  {
    icon: Music2,
    title: "Live playlist",
    description: "Queue YouTube tracks and play them from the organizer desk.",
  },
  {
    icon: Presentation,
    title: "Presenter mode",
    description: "Large-type script and run-of-show on stage or on your phone.",
  },
] as const;

const TEMPLATE_META: Record<string, { icon: LucideIcon; accent: string }> = {
  "independence-day-india": { icon: Flag, accent: "from-orange-500/20 to-emerald-500/10" },
  "diwali-celebration": { icon: Sparkles, accent: "from-amber-400/25 to-orange-500/10" },
  "annual-day-society": { icon: GraduationCap, accent: "from-sky-500/20 to-indigo-500/10" },
  "kids-birthday": { icon: Cake, accent: "from-pink-500/20 to-violet-500/10" },
  "corporate-mixer": { icon: Briefcase, accent: "from-slate-400/20 to-zinc-500/10" },
};

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pb-20">
      <SiteHeader />

      <section className="relative grid gap-8 pt-2">
        <div className="pointer-events-none absolute -left-20 top-0 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-5">
          <span className="eyebrow w-fit">For society functions &amp; community events</span>
          <h1 className="font-display max-w-2xl text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">Run the evening</span>
            <br />
            <span className="text-foreground/90">from one phone.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            HostMate is your invite, playlist, and teleprompter in one place. Guests RSVP and send
            songs. You control the show. Everything saves to the cloud — not just this browser.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="surface-card group p-4">
              <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <CreateEventForm />

      <section className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Ready-made programmes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start with a full script, song list, and games — then customize.
            </p>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {EVENT_TEMPLATES.map((t) => {
            const meta = TEMPLATE_META[t.id] ?? {
              icon: Sparkles,
              accent: "from-primary/20 to-primary/5",
            };
            const Icon = meta.icon;
            return (
              <li
                key={t.id}
                className={`surface-card-hover group relative overflow-hidden p-5`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-80`}
                />
                <div className="relative flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-background/50 text-primary ring-1 ring-white/10">
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{t.name}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.script_sections.length} script beats · {t.songs.length} songs ·{" "}
                      {t.activities.length} activities
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
