import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { HostDashboard } from "@/components/host-dashboard";
import { getHostBundle } from "@/lib/queries";

export const dynamic = "force-dynamic";

function originFromHeaders() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function HostPage({ params }: { params: { token: string } }) {
  const bundle = await getHostBundle(params.token);
  if (!bundle) notFound();

  return (
    <HostDashboard
      event={bundle.event}
      scripts={bundle.scripts}
      submissions={bundle.submissions}
      activities={bundle.activities}
      participants={bundle.participants}
      timeline={bundle.timeline}
      origin={originFromHeaders()}
    />
  );
}
