export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-content-center gap-2 px-4 text-center">
      <h1 className="text-2xl font-semibold">Link not found</h1>
      <p className="text-sm text-muted-foreground">
        This host or event link is invalid. Ask the organiser for a new one.
      </p>
    </main>
  );
}
