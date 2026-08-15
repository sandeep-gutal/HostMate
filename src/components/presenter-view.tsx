"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TimelineViewItem } from "@/lib/timeline";

export function PresenterView({
  token,
  eventName,
  items,
}: {
  token: string;
  eventName: string;
  items: TimelineViewItem[];
}) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const remaining = useMemo(
    () => items.slice(index).reduce((sum, i) => sum + (i.duration_minutes ?? 0), 0),
    [items, index]
  );

  if (!item) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-4 text-white">
        <p className="text-2xl">No run-of-show items yet.</p>
        <Button asChild variant="secondary">
          <Link href={`/h/${encodeURIComponent(token)}`}>Back to host</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-neutral-400">
        <span>{eventName}</span>
        <span>
          {index + 1} / {items.length} · ~{remaining} min left
        </span>
        <Link className="underline" href={`/h/${encodeURIComponent(token)}`}>
          Exit
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-6 px-5 py-8 sm:px-12">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300">{item.kind}</p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">{item.title}</h1>
        <p className="max-w-3xl whitespace-pre-wrap text-xl leading-relaxed text-neutral-100 sm:text-3xl">
          {item.detail || "No notes on this item."}
        </p>
        <p className="text-lg text-neutral-400">{item.duration_minutes ?? 0} minutes</p>
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
