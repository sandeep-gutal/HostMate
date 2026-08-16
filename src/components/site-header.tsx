import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          H
        </span>
        <span className="text-sm font-medium tracking-wide">HostMate</span>
      </Link>
      {compact ? null : (
        <p className="hidden text-xs text-muted-foreground sm:block">Organize · Present · Invite</p>
      )}
    </header>
  );
}
