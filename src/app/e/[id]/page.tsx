import { notFound } from "next/navigation";
import { GuestPortal } from "@/components/guest-portal";
import { getPublicBundle } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function EventPublicPage({ params }: { params: { id: string } }) {
  const bundle = await getPublicBundle(params.id);
  if (!bundle) notFound();
  return (
    <GuestPortal
      event={bundle.event}
      submissions={bundle.submissions}
      timeline={bundle.timeline}
      participants={bundle.participants}
      scripts={bundle.scripts}
      activities={bundle.activities}
    />
  );
}
