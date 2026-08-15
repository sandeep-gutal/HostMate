"use client";

import Link from "next/link";
import { ActivitiesPanel } from "@/components/activities-panel";
import { CopyButton } from "@/components/copy-button";
import { PeoplePanel } from "@/components/people-panel";
import { ScriptHelp } from "@/components/script-help";
import { SongsPanel } from "@/components/songs-panel";
import { TimelinePanel, buildTimelineView } from "@/components/timeline-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="grid gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Host console</p>
        <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
        <p className="text-sm text-muted-foreground">
          {event.type}
          {event.date ? ` · ${event.date}` : ""} · {event.tone} · {event.language}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your links</CardTitle>
          <CardDescription>
            Bookmark the host link. Anyone with it can edit this event. Guests only need the public
            link.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground">Private host link</p>
            <p className="break-all font-mono text-xs">{hostUrl}</p>
            <CopyButton text={hostUrl} label="Copy host link" />
          </div>
          <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground">Public guest link</p>
            <p className="break-all font-mono text-xs">{publicUrl}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={publicUrl} label="Copy guest link" />
              <Button asChild variant="outline">
                <Link href={`/e/${event.id}`}>Open guest page</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="show">Run of show</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
        <TabsContent value="script">
          <ScriptHelp event={event} sections={scripts} />
        </TabsContent>
        <TabsContent value="songs">
          <SongsPanel token={event.host_token} submissions={submissions} />
        </TabsContent>
        <TabsContent value="activities">
          <ActivitiesPanel token={event.host_token} activities={activities} />
        </TabsContent>
        <TabsContent value="show">
          <TimelinePanel token={event.host_token} items={items} />
        </TabsContent>
        <TabsContent value="people">
          <PeoplePanel people={participants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
