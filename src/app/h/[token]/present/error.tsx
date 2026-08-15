"use client";

export default function PresenterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-2xl font-semibold">Presenter mode couldn&apos;t load</h1>
      <p className="max-w-md text-sm text-neutral-400">
        {error.message || "Refresh and try again from the host run-of-show tab."}
      </p>
      <button
        type="button"
        className="rounded-lg bg-white px-4 py-2 text-black"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
