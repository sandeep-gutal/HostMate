import { notFound } from "next/navigation";
import { GuestPortal } from "@/components/guest-portal";
import { getEventById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventPublicPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) notFound();
  return <GuestPortal event={event} />;
}
