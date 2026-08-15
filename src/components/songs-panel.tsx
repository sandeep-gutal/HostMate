"use client";

import { CopyButton } from "@/components/copy-button";
import { SortableList } from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addHostSongAction,
  deleteSongAction,
  reorderSongsAction,
  updateSongAction,
} from "@/lib/actions";
import type { SubmissionRow } from "@/lib/types";

export function SongsPanel({
  token,
  submissions,
}: {
  token: string;
  submissions: (SubmissionRow & { participant_name: string | null })[];
}) {
  const ids = submissions.map((s) => s.id);
  const byId = Object.fromEntries(submissions.map((s) => [s.id, s]));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a slot</CardTitle>
          <CardDescription>
            Template songs start as a checklist. Edit, remove, or add your own. Guests can also
            submit from the public link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addHostSongAction} className="grid gap-3">
            <input type="hidden" name="token" value={token} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label>Type</Label>
                <select
                  name="type"
                  className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
                  defaultValue="song"
                >
                  <option value="song">Song</option>
                  <option value="performance">Performance</option>
                  <option value="game">Game</option>
                </select>
              </div>
              <div className="grid gap-1">
                <Label>Duration (minutes)</Label>
                <Input name="duration" type="number" min={1} defaultValue={3} />
              </div>
            </div>
            <Input name="title" required placeholder="Title" />
            <Input name="link" placeholder="YouTube link (optional)" />
            <Input name="note" placeholder="Note (e.g. great for flag hoisting)" />
            <Button type="submit">Add to running order</Button>
          </form>
        </CardContent>
      </Card>

      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">No songs or performances yet.</p>
      ) : (
        <SortableList
          ids={ids}
          onReorder={(next) => {
            void reorderSongsAction(token, next);
          }}
        >
          {(id) => {
            const item = byId[id];
            if (!item) return null;
            return (
              <div className="grid gap-2">
              <form action={updateSongAction} className="grid gap-2">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{item.type}</span>
                  <span>{item.source}</span>
                  {item.participant_name ? <span>by {item.participant_name}</span> : null}
                </div>
                <Input name="title" defaultValue={item.title} />
                <Input name="note" defaultValue={item.note ?? ""} placeholder="Note" />
                <div className="grid grid-cols-[1fr_6rem] gap-2">
                  <Input name="link" defaultValue={item.link ?? ""} placeholder="YouTube link" />
                  <Input
                    name="duration"
                    type="number"
                    min={1}
                    defaultValue={item.duration ?? 3}
                    aria-label="Minutes"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="sm" variant="secondary">
                    Save
                  </Button>
                  {item.link ? <CopyButton text={item.link} label="Copy link" /> : null}
                </div>
              </form>
              <form action={deleteSongAction}>
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                  Remove
                </Button>
              </form>
              </div>
            );
          }}
        </SortableList>
      )}
    </div>
  );
}
