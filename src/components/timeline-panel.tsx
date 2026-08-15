"use client";

import Link from "next/link";
import { SortableList } from "@/components/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reorderTimelineAction, updateTimelineDurationAction } from "@/lib/actions";
import type {
  ActivityRow,
  ScriptSectionRow,
  SubmissionRow,
  TimelineItemRow,
} from "@/lib/types";

export type TimelineViewItem = TimelineItemRow & {
  title: string;
  detail: string;
};

export function buildTimelineView(
  timeline: TimelineItemRow[],
  scripts: ScriptSectionRow[],
  submissions: SubmissionRow[],
  activities: ActivityRow[]
): TimelineViewItem[] {
  return timeline.map((item) => {
    if (item.kind === "script") {
      const ref = scripts.find((s) => s.id === item.ref_id);
      return {
        ...item,
        title: ref?.title ?? "Script",
        detail: ref?.content?.slice(0, 140) ?? "",
      };
    }
    if (item.kind === "submission") {
      const ref = submissions.find((s) => s.id === item.ref_id);
      return {
        ...item,
        title: ref?.title ?? "Performance",
        detail: [ref?.type, ref?.note, ref?.link].filter(Boolean).join(" · "),
      };
    }
    const ref = activities.find((s) => s.id === item.ref_id);
    return {
      ...item,
      title: ref?.title ?? "Activity",
      detail: ref?.description?.slice(0, 140) ?? "",
    };
  });
}

export function TimelinePanel({
  token,
  items,
}: {
  token: string;
  items: TimelineViewItem[];
}) {
  const total = items.reduce((sum, item) => sum + (item.duration_minutes ?? 0), 0);
  const ids = items.map((i) => i.id);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Estimated total: <span className="text-foreground">{total} min</span>
        </p>
        <Button asChild>
          <Link href={`/h/${token}/present`}>Open presenter mode</Link>
        </Button>
      </div>
      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add script sections, songs, or activities and they will show up here.
        </p>
      ) : (
        <SortableList
          ids={ids}
          onReorder={(next) => {
            void reorderTimelineAction(token, next);
          }}
        >
          {(id) => {
            const item = byId[id];
            if (!item) return null;
            return (
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                    {item.kind}
                  </span>
                  <p className="font-medium">{item.title}</p>
                </div>
                {item.detail ? (
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                ) : null}
                <form action={updateTimelineDurationAction} className="flex items-center gap-2">
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="id" value={item.id} />
                  <Input
                    name="duration_minutes"
                    type="number"
                    min={0}
                    className="w-24"
                    defaultValue={item.duration_minutes ?? 0}
                    aria-label="Minutes"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                  <Button type="submit" size="sm" variant="secondary">
                    Set
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
