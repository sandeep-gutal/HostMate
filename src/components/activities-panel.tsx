"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVITIES_LIBRARY } from "@/lib/activities-library";
import {
  addCustomActivityAction,
  addLibraryActivityAction,
  deleteActivityAction,
  toggleFavoriteAction,
} from "@/lib/actions";
import type { ActivityRow } from "@/lib/types";

export function ActivitiesPanel({
  token,
  activities,
}: {
  token: string;
  activities: ActivityRow[];
}) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>
            Curated icebreakers, jokes, and games. Add one to this event&apos;s timeline — no AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {ACTIVITIES_LIBRARY.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.duration_minutes} min · {item.tags.join(", ")}
                  </p>
                </div>
                <form action={addLibraryActivityAction}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="library_id" value={item.id} />
                  <Button type="submit" size="sm" variant="secondary">
                    Add to event
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add custom activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addCustomActivityAction} className="grid gap-3">
            <input type="hidden" name="token" value={token} />
            <Input name="title" required placeholder="Title" />
            <Textarea name="description" rows={3} placeholder="How to run it…" />
            <Input name="duration_minutes" type="number" min={1} defaultValue={5} />
            <Button type="submit">Save activity</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">On this event</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing added yet.</p>
        ) : null}
        {activities.map((item) => (
          <div key={item.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.duration_minutes ?? "?"} min · {item.source}
                </p>
              </div>
              <div className="flex gap-1">
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" size="icon" variant="ghost" aria-label="Favorite">
                    <Star className={item.is_favorite ? "fill-primary text-primary" : ""} />
                  </Button>
                </form>
                <form action={deleteActivityAction}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                    Remove
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
