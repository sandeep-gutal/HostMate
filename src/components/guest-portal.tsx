"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { YouTubePlayer } from "@/components/youtube-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicEventAction, publicRsvpAction, publicSubmitAction } from "@/lib/actions";
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

export function GuestPortal({
  event,
  submissions,
  timeline,
  participants,
  scripts,
  activities,
}: {
  event: EventRow;
  submissions: (SubmissionRow & { participant_name: string | null })[];
  timeline: TimelineItemRow[];
  participants: ParticipantRow[];
  scripts: ScriptSectionRow[];
  activities: ActivityRow[];
}) {
  const [rsvpMsg, setRsvpMsg] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState("yes");
  const [link, setLink] = useState("");
  const [liveId, setLiveId] = useState(event.live_item_id);
  const [queue, setQueue] = useState(submissions);
  const [going, setGoing] = useState(participants.filter((p) => p.rsvp === "yes").length);

  const items = buildTimelineView(timeline, scripts, queue, activities);
  const live = items.find((item) => item.id === liveId);

  useEffect(() => {
    const timer = setInterval(() => {
      void getPublicEventAction(event.id).then((bundle) => {
        if (!bundle) return;
        setLiveId(bundle.event.live_item_id);
        setQueue(bundle.submissions);
        setGoing(bundle.participants.filter((p) => p.rsvp === "yes").length);
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [event.id]);

  const dateLabel = event.date
    ? new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Date soon";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pb-16">
      <SiteHeader compact />
      <header className="grid gap-3">
        <p className="text-sm font-medium text-primary">You&apos;re invited</p>
        <h1 className="font-display text-4xl leading-tight">{event.name}</h1>
        <p className="text-muted-foreground">
          {dateLabel} · {event.type}
        </p>
        <p className="text-sm text-muted-foreground">{going} going · no account needed</p>
      </header>

      {event.live_status === "live" && live ? (
        <section className="grid gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
          <p className="text-xs uppercase tracking-wide text-primary">Happening now</p>
          <h2 className="font-display text-2xl">{live.title}</h2>
          {youtubeIdFromUrl(live.link) ? (
            <YouTubePlayer url={live.link} title={live.title} autoplay />
          ) : (
            <p className="text-sm text-muted-foreground">On stage — listen in the room.</p>
          )}
        </section>
      ) : null}

      <Card>
        <CardContent className="grid gap-4 p-5">
          <div>
            <h2 className="font-display text-2xl">Are you coming?</h2>
            <p className="text-sm text-muted-foreground">The host sees this under Guests.</p>
          </div>
          <form
            className="grid gap-3"
            action={async (formData) => {
              formData.set("rsvp", rsvp);
              try {
                const result = await publicRsvpAction(formData);
                setRsvpMsg(result?.error || result?.message || "Saved.");
              } catch (err) {
                setRsvpMsg(err instanceof Error ? err.message : "Could not save RSVP.");
              }
            }}
          >
            <input type="hidden" name="event_id" value={event.id} />
            <div className="grid grid-cols-3 gap-2">
              {[
                ["yes", "Going"],
                ["maybe", "Maybe"],
                ["no", "Can't"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRsvp(value)}
                  className={`rounded-full px-3 py-2 text-sm ${
                    rsvp === value ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="phone_or_email">Phone or email</Label>
              <Input id="phone_or_email" name="phone_or_email" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="fun_fact">Fun fact for intros</Label>
              <Textarea id="fun_fact" name="fun_fact" rows={2} placeholder="I once…" />
            </div>
            {rsvpMsg ? <p className="text-sm text-primary">{rsvpMsg}</p> : null}
            <Button type="submit" className="h-11">
              Save RSVP
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-5">
          <div>
            <h2 className="font-display text-2xl">Send a song</h2>
            <p className="text-sm text-muted-foreground">
              Paste YouTube. The host plays it from HostMate — not from a messy WhatsApp thread.
            </p>
          </div>
          <form
            className="grid gap-3"
            action={async (formData) => {
              try {
                const result = await publicSubmitAction(formData);
                setSubMsg(result?.error || result?.message || "Saved.");
                const bundle = await getPublicEventAction(event.id);
                if (bundle) setQueue(bundle.submissions);
              } catch (err) {
                setSubMsg(err instanceof Error ? err.message : "Could not save.");
              }
            }}
          >
            <input type="hidden" name="event_id" value={event.id} />
            <input type="hidden" name="type" value="song" />
            <Input name="name" required placeholder="Your name" />
            <Input name="title" required placeholder="Song title" />
            <Input
              name="link"
              placeholder="YouTube link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            {youtubeIdFromUrl(link) ? <YouTubePlayer url={link} title="Preview" /> : null}
            <Input name="duration" type="number" min={1} defaultValue={3} />
            {subMsg ? <p className="text-sm text-primary">{subMsg}</p> : null}
            <Button type="submit" variant="secondary" className="h-11">
              Add to the playlist
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Tonight&apos;s playlist</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Be the first to add a song.</p>
        ) : (
          queue.map((song, index) => (
            <div key={song.id} className="flex items-center gap-3 rounded-2xl border bg-card/80 p-3">
              <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{song.title}</p>
                <p className="text-xs text-muted-foreground">
                  {song.participant_name || song.source}
                  {youtubeIdFromUrl(song.link) ? " · playable" : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
