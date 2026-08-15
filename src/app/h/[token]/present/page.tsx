import { notFound } from "next/navigation";
import { PresenterView } from "@/components/presenter-view";
import { buildTimelineView } from "@/components/timeline-panel";
import { getHostBundle } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PresentPage({ params }: { params: { token: string } }) {
  const bundle = await getHostBundle(params.token);
  if (!bundle) notFound();
  const items = buildTimelineView(
    bundle.timeline,
    bundle.scripts,
    bundle.submissions,
    bundle.activities
  ).map((item) => {
    if (item.kind === "script") {
      const full = bundle.scripts.find((s) => s.id === item.ref_id);
      return { ...item, detail: full?.content ?? item.detail };
    }
    if (item.kind === "activity") {
      const full = bundle.activities.find((s) => s.id === item.ref_id);
      return { ...item, detail: full?.description ?? item.detail };
    }
    return item;
  });

  return <PresenterView token={params.token} eventName={bundle.event.name} items={items} />;
}
