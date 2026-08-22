"use client";

import { youtubeEmbedUrl, youtubeIdFromUrl, youtubeThumb } from "@/lib/youtube";

export function YouTubePlayer({
  url,
  title,
  autoplay = false,
  className,
}: {
  url: string | null | undefined;
  title: string;
  autoplay?: boolean;
  className?: string;
}) {
  const id = youtubeIdFromUrl(url);
  if (!id) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/40 px-4 text-center text-sm text-muted-foreground">
        Add a YouTube link to play this in HostMate.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border bg-black shadow-lg">
        <iframe
          title={title}
          src={youtubeEmbedUrl(id, autoplay)}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function YouTubeThumb({
  url,
  title,
}: {
  url: string | null | undefined;
  title: string;
}) {
  const id = youtubeIdFromUrl(url);
  if (!id) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Song
      </div>
    );
  }
  return (
    // External YouTube thumbs; next/image would need remotePatterns
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={youtubeThumb(id)}
      alt={title}
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  );
}
