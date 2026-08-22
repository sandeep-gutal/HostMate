"use client";

import { useEffect, useState } from "react";
import { YouTubePlayer, YouTubeThumb } from "@/components/youtube-player";
import { SortableList } from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addHostSongAction,
  deleteSongAction,
  listQueueAction,
  reorderSongsAction,
  updateSongAction,
} from "@/lib/actions";
import { youtubeIdFromUrl } from "@/lib/youtube";
import type { SubmissionRow } from "@/lib/types";

export function SongsPanel({
  token,
  submissions,
  onPlay,
}: {
  token: string;
  submissions: (SubmissionRow & { participant_name: string | null })[];
  onPlay?: (id: string) => void;
}) {
  const [rows, setRows] = useState(submissions);
  const [saved, setSaved] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setRows(submissions);
  }, [submissions]);

  async function refresh() {
    const next = await listQueueAction(token);
    setRows(next);
  }

  const ids = rows.map((s) => s.id);
  const byId = Object.fromEntries(rows.map((s) => [s.id, s]));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add to the playlist</CardTitle>
          <CardDescription>
            Paste a YouTube link to play it on this page. Guests can send songs too — they land here
            and in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              await addHostSongAction(formData);
              await refresh();
              setSaved("Saved to database.");
            }}
            className="grid gap-3"
          >
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
                <Label>Minutes</Label>
                <Input name="duration" type="number" min={1} defaultValue={3} />
              </div>
            </div>
            <Input name="title" required placeholder="Title" />
            <Input
              name="link"
              placeholder="YouTube link"
              onChange={(e) => setPreview(e.target.value)}
            />
            {youtubeIdFromUrl(preview) ? (
              <YouTubePlayer url={preview} title="Preview" />
            ) : null}
            <Input name="note" placeholder="When to play it (flag, cake, entry…)" />
            <Button type="submit">Save to playlist</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Order is stored for presenter mode.
        </p>
        {saved ? <p className="text-xs text-primary">{saved}</p> : null}
      </div>

      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">No songs yet. Add one or share the guest link.</p>
      ) : (
        <SortableList
          ids={ids}
          onReorder={(next) => {
            const mapped = next.map((id) => byId[id]).filter(Boolean);
            setRows(mapped);
            void reorderSongsAction(token, next).then(() => setSaved("Order saved."));
          }}
        >
          {(id) => {
            const item = byId[id];
            if (!item) return null;
            return (
              <div className="grid gap-3">
                <div className="flex gap-3">
                  <YouTubeThumb url={item.link} title={item.title} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type}
                      {item.participant_name ? ` · ${item.participant_name}` : ""} · {item.source}
                    </p>
                  </div>
                  {youtubeIdFromUrl(item.link) ? (
                    <Button type="button" size="sm" onClick={() => onPlay?.(item.id)}>
                      Play
                    </Button>
                  ) : null}
                </div>
                <form
                  action={async (formData) => {
                    await updateSongAction(formData);
                    await refresh();
                    setSaved("Edits saved.");
                  }}
                  className="grid gap-2"
                >
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="id" value={item.id} />
                  <Input name="title" defaultValue={item.title} />
                  <Input name="link" defaultValue={item.link ?? ""} placeholder="YouTube link" />
                  <div className="flex gap-2">
                    <Input
                      name="duration"
                      type="number"
                      min={1}
                      defaultValue={item.duration ?? 3}
                      className="w-24"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      Save
                    </Button>
                  </div>
                  <Input name="note" defaultValue={item.note ?? ""} placeholder="Note" />
                </form>
                <form
                  action={async (formData) => {
                    await deleteSongAction(formData);
                    await refresh();
                  }}
                >
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
