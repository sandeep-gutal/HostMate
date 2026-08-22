import Link from "next/link";
import { CalendarDays } from "lucide-react";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="sticky top-0 z-50 -mx-4 border-b border-white/[0.06] bg-background/75 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-3 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <CalendarDays className="size-4" strokeWidth={2.25} />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">HostMate</span>
            {!compact ? (
              <span className="block text-[11px] text-muted-foreground">Event command center</span>
            ) : null}
          </div>
        </Link>
        {!compact ? (
          <div className="hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:flex">
            <span className="rounded-md bg-secondary/80 px-2 py-1">Organize</span>
            <span className="text-border">·</span>
            <span className="rounded-md bg-secondary/80 px-2 py-1">Present</span>
            <span className="text-border">·</span>
            <span className="rounded-md bg-secondary/80 px-2 py-1">Invite</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
