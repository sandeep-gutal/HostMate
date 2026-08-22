"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const missingDb = /POSTGRES_URL|DATABASE_URL/i.test(error.message);
  const needsSetup = /relation .* does not exist|column .* does not exist/i.test(error.message);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="font-display text-3xl tracking-tight">Couldn&apos;t load this event</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {missingDb
          ? "The database connection is not configured. Add DATABASE_URL (or POSTGRES_URL) in your environment, then run npm run db:setup."
          : needsSetup
            ? "The database schema looks out of date. Run npm run db:setup against your Postgres database, then refresh."
            : "This is usually a temporary server issue or a bad host link. Try again, or create a new event from the home page."}
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
