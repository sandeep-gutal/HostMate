import { notFound } from "next/navigation";
import { PresenterView } from "@/components/presenter-view";
import { getHostBundle } from "@/lib/queries";
import { buildTimelineView } from "@/lib/timeline";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PresentPage({ params }: { params: { token: string } }) {
  const bundle = await getHostBundle(decodeURIComponent(params.token));
  if (!bundle) notFound();
  const items = buildTimelineView(
    bundle.timeline,
    bundle.scripts,
    bundle.submissions,
    bundle.activities
  );

  return (
    <PresenterView
      token={bundle.event.host_token}
      eventName={bundle.event.name}
      items={items}
    />
  );
}
