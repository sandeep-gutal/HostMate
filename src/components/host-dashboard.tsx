"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListMusic, Radio, Users, type LucideIcon } from "lucide-react";
import { ActivitiesPanel } from "@/components/activities-panel";
import { CopyButton } from "@/components/copy-button";
import { PeoplePanel } from "@/components/people-panel";
import { ScriptHelp } from "@/components/script-help";
import { SiteHeader } from "@/components/site-header";
import { SongsPanel } from "@/components/songs-panel";
import { TimelinePanel } from "@/components/timeline-panel";
import { YouTubePlayer } from "@/components/youtube-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildTimelineView } from "@/lib/timeline";
import { youtubeIdFromUrl } from "@/lib/youtube";
import type {
  ActivityRow,
  EventRow,
  ParticipantRow,
  ScriptSectionRow,
  SubmissionRow,
  TimelineItemRow,
} from "@/lib/types";

export function HostDashboard({
  event,
  scripts,
  submissions,
  activities,
  participants,
  timeline,
  origin,
}: {
  event: EventRow;
  scripts: ScriptSectionRow[];
  submissions: (SubmissionRow & { participant_name: string | null })[];
  activities: ActivityRow[];
  participants: ParticipantRow[];
  timeline: TimelineItemRow[];
  origin: string;
}) {
  const hostUrl = `${origin}/h/${event.host_token}`;
  const publicUrl = `${origin}/e/${event.id}`;
  const items = buildTimelineView(timeline, scripts, submissions, activities);
  const going = participants.filter((p) => p.rsvp === "yes").length;
  const maybe = participants.filter((p) => p.rsvp === "maybe").length;
  const liveItem = items.find((item) => item.id === event.live_item_id);
  const playable = useMemo(
    () => submissions.filter((s) => youtubeIdFromUrl(s.link)),
    [submissions]
  );
  const [playingId, setPlayingId] = useState<string | null>(playable[0]?.id ?? null);
  const playing = submissions.find((s) => s.id === playingId) ?? playable[0];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-24">
      <SiteHeader compact />
      <header className="grid gap-2 border-b border-white/[0.06] pb-6">
        <span className="eyebrow w-fit text-[10px]">Organizer desk</span>
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">{event.name}</h1>
        <p className="text-sm text-muted-foreground">
          {event.type}
          {event.date ? ` · ${event.date}` : ""} · {event.language}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Users} label="Going" value={String(going)} />
        <Stat icon={Radio} label="Maybe" value={String(maybe)} />
        <Stat icon={ListMusic} label="On the list" value={String(submissions.length)} />
      </div>

      <Card className="surface-card overflow-hidden border-primary/10">
        <CardContent className="grid gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Share with guests</p>
              <p className="text-sm text-muted-foreground">No login. They RSVP and send songs here.</p>
            </div>
            <CopyButton text={publicUrl} label="Copy invite" />
          </div>
          <p className="break-all font-mono text-[11px] text-muted-foreground">{publicUrl}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/h/${encodeURIComponent(event.host_token)}/present`}>Open presenter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/e/${event.id}`}>Preview guest page</Link>
            </Button>
            <CopyButton text={hostUrl} label="Copy host link" />
          </div>
          <p className="text-xs text-muted-foreground">
            Keep the host link private — it is the key to this event.
          </p>
        </CardContent>
      </Card>

      {event.live_status === "live" && liveItem ? (
        <div className="surface-card border-primary/30 bg-gradient-to-r from-primary/15 to-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Now on stage</p>
          <p className="mt-1 text-lg font-medium">{liveItem.title}</p>
        </div>
      ) : null}

      {playing ? (
        <section className="grid gap-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Play in HostMate</p>
              <h2 className="font-display text-2xl">{playing.title}</h2>
            </div>
          </div>
          <YouTubePlayer url={playing.link} title={playing.title} autoplay={false} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {playable.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => setPlayingId(song.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                  song.id === playing.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {song.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <Tabs defaultValue="home">
        <TabsList className="sticky top-2 z-10">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="show">Run of show</TabsTrigger>
          <TabsTrigger value="play">Games</TabsTrigger>
          <TabsTrigger value="people">Guests</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="grid gap-4">
          <h2 className="font-display text-xl">Up next</h2>
          {items.slice(0, 4).map((item, index) => (
            <div key={item.id} className="surface-card flex gap-3 p-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/20">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase text-muted-foreground">{item.kind}</p>
                <p className="font-medium">{item.title}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">
                {item.duration_minutes ?? 0}m
              </span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="play">
          <ActivitiesPanel token={event.host_token} activities={activities} />
        </TabsContent>
        <TabsContent value="queue">
          <SongsPanel
            token={event.host_token}
            submissions={submissions}
            onPlay={(id) => setPlayingId(id)}
          />
        </TabsContent>
        <TabsContent value="script">
          <ScriptHelp event={event} sections={scripts} />
        </TabsContent>
        <TabsContent value="show">
          <TimelinePanel token={event.host_token} items={items} />
        </TabsContent>
        <TabsContent value="people">
          <PeoplePanel token={event.host_token} people={participants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="surface-card relative overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <Icon className="mb-2 size-4 text-primary" strokeWidth={2} />
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
