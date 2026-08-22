"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p className="text-sm text-muted-foreground">
            {/POSTGRES_URL|DATABASE_URL/i.test(error.message)
              ? "Database is not configured. Set DATABASE_URL in your environment and run migrations."
              : "A server error occurred. Refresh or return home and try again."}
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">Digest: {error.digest}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
