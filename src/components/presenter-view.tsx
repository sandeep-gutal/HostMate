"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { YouTubePlayer } from "@/components/youtube-player";
import { Button } from "@/components/ui/button";
import { setLiveItemAction } from "@/lib/actions";
import { youtubeIdFromUrl } from "@/lib/youtube";
import type { TimelineViewItem } from "@/lib/timeline";

export function PresenterView({
  token,
  eventName,
  items,
  liveItemId,
}: {
  token: string;
  eventName: string;
  items: TimelineViewItem[];
  liveItemId: string | null;
}) {
  const start = Math.max(
    0,
    items.findIndex((item) => item.id === liveItemId)
  );
  const [index, setIndex] = useState(start < 0 ? 0 : start);
  const item = items[index];
  const next = items[index + 1];
  const remaining = useMemo(
    () => items.slice(index).reduce((sum, row) => sum + (row.duration_minutes ?? 0), 0),
    [items, index]
  );

  useEffect(() => {
    if (!item) return;
    void setLiveItemAction(token, item.id, "live");
  }, [item, token]);

  if (!item) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-4 text-white">
        <p className="font-display text-3xl">Nothing on the run of show yet.</p>
        <Button asChild variant="secondary">
          <Link href={`/h/${encodeURIComponent(token)}`}>Back to organizer</Link>
        </Button>
      </main>
    );
  }

  const playable = Boolean(youtubeIdFromUrl(item.link));

  return (
    <main className="flex min-h-dvh flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-neutral-400">
        <span className="truncate">{eventName}</span>
        <span>
          {index + 1}/{items.length} · {remaining}m left
        </span>
        <Link
          href={`/h/${encodeURIComponent(token)}`}
          className="underline"
          onClick={() => {
            void setLiveItemAction(token, item.id, "idle");
          }}
        >
          Exit
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-5 px-5 py-6 sm:px-12">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">{item.kind}</p>
        <h1 className="font-display text-4xl leading-tight sm:text-6xl">{item.title}</h1>
        {playable ? (
          <YouTubePlayer url={item.link} title={item.title} autoplay />
        ) : (
          <p className="max-w-3xl whitespace-pre-wrap text-xl leading-relaxed text-neutral-100 sm:text-3xl">
            {item.detail || "No notes on this beat."}
          </p>
        )}
        {playable && item.detail ? (
          <p className="max-w-2xl text-base text-neutral-300">{item.detail}</p>
        ) : null}
        {next ? (
          <p className="text-sm text-neutral-500">
            Next: {next.title}
            {youtubeIdFromUrl(next.link) ? " · playable" : ""}
          </p>
        ) : (
          <p className="text-sm text-neutral-500">Last item — wrap when you&apos;re ready.</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <Button
          className="h-14 text-lg"
          variant="secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        <Button
          className="h-14 text-lg"
          disabled={index >= items.length - 1}
          onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
