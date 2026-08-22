"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ACTIVITIES_LIBRARY } from "@/lib/activities-library";
import { parseScript } from "@/lib/parse-script";
import {
  addActivity,
  addManualScriptSection,
  addParticipant,
  addSubmission,
  createEvent,
  deleteActivity,
  deleteScriptSection,
  deleteSubmission,
  getEventById,
  getEventByToken,
  getPublicBundle,
  listParticipants,
  listSubmissions,
  reorderSubmissions,
  reorderTimeline,
  replaceScriptSections,
  setLiveState,
  toggleFavorite,
  updateScriptSection,
  updateSubmission,
  updateTimelineDuration,
} from "@/lib/queries";

function num(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function createEventAction(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) return { error: "Give the event a name." };

  try {
    const event = await createEvent({
      name,
      type: str(formData.get("type")) || "Custom",
      date: str(formData.get("date")) || null,
      tone: str(formData.get("tone")) || "casual",
      language: str(formData.get("language")) || "English",
      expected_audience: num(formData.get("expected_audience")),
      duration_minutes: num(formData.get("duration_minutes")),
      template_id: str(formData.get("template_id")) || null,
    });

    redirect(`/h/${event.host_token}`);
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    const message = err instanceof Error ? err.message : "Could not create event.";
    if (/POSTGRES_URL|DATABASE_URL/i.test(message)) {
      return {
        error: "Database not configured. Set DATABASE_URL (or POSTGRES_URL) and run npm run db:setup.",
      };
    }
    if (/relation .* does not exist|column .* does not exist/i.test(message)) {
      return { error: "Database schema is out of date. Run npm run db:setup, then try again." };
    }
    return { error: message };
  }
}

export async function savePastedScriptAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  const raw = str(formData.get("script"));
  if (!raw) return;
  const sections = parseScript(raw);
  await replaceScriptSections(event.id, sections, "pasted");
  revalidatePath(`/h/${token}`);
}

export async function updateSectionAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await updateScriptSection(str(formData.get("id")), event.id, {
    title: str(formData.get("title")) || undefined,
    content: str(formData.get("content")),
    duration_minutes: num(formData.get("duration_minutes")),
  });
  revalidatePath(`/h/${token}`);
}

export async function addSectionAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await addManualScriptSection(
    event.id,
    str(formData.get("title")) || "New section",
    str(formData.get("content"))
  );
  revalidatePath(`/h/${token}`);
}

export async function deleteSectionAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await deleteScriptSection(str(formData.get("id")), event.id);
  revalidatePath(`/h/${token}`);
}

export async function addHostSongAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  const title = str(formData.get("title"));
  if (!title) return;
  await addSubmission({
    eventId: event.id,
    participantId: null,
    type: (str(formData.get("type")) as "song" | "performance" | "game") || "song",
    title,
    link: str(formData.get("link")) || null,
    duration: num(formData.get("duration")),
    note: str(formData.get("note")) || null,
    source: "host",
  });
  revalidatePath(`/h/${token}`);
}

export async function updateSongAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await updateSubmission(str(formData.get("id")), event.id, {
    title: str(formData.get("title")) || undefined,
    note: str(formData.get("note")),
    duration: num(formData.get("duration")),
    link: str(formData.get("link")),
  });
  revalidatePath(`/h/${token}`);
}

export async function deleteSongAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await deleteSubmission(str(formData.get("id")), event.id);
  revalidatePath(`/h/${token}`);
}

export async function reorderSongsAction(token: string, ids: string[]): Promise<void> {
  const event = await getEventByToken(token);
  if (!event) return;
  await reorderSubmissions(event.id, ids);
  revalidatePath(`/h/${token}`);
}

export async function addCustomActivityAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  const title = str(formData.get("title"));
  if (!title) return;
  await addActivity({
    eventId: event.id,
    title,
    description: str(formData.get("description")),
    duration_minutes: num(formData.get("duration_minutes")),
    source: "manual",
  });
  revalidatePath(`/h/${token}`);
}

export async function addLibraryActivityAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  const item = ACTIVITIES_LIBRARY.find((a) => a.id === str(formData.get("library_id")));
  if (!item) return;
  await addActivity({
    eventId: event.id,
    title: item.title,
    description: item.description,
    duration_minutes: item.duration_minutes,
    source: "library",
  });
  revalidatePath(`/h/${token}`);
}

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await toggleFavorite(str(formData.get("id")), event.id);
  revalidatePath(`/h/${token}`);
}

export async function deleteActivityAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await deleteActivity(str(formData.get("id")), event.id);
  revalidatePath(`/h/${token}`);
}

export async function reorderTimelineAction(token: string, ids: string[]): Promise<void> {
  const event = await getEventByToken(token);
  if (!event) return;
  await reorderTimeline(event.id, ids);
  revalidatePath(`/h/${token}`);
}

export async function updateTimelineDurationAction(formData: FormData): Promise<void> {
  const token = str(formData.get("token"));
  const event = await getEventByToken(token);
  if (!event) return;
  await updateTimelineDuration(
    str(formData.get("id")),
    event.id,
    num(formData.get("duration_minutes"))
  );
  revalidatePath(`/h/${token}`);
}

export async function setLiveItemAction(token: string, liveItemId: string | null, liveStatus: "idle" | "live" | "ended") {
  const event = await getEventByToken(token);
  if (!event) return { error: "Event not found." };
  await setLiveState(event.id, liveItemId, liveStatus);
  revalidatePath(`/h/${token}`);
  revalidatePath(`/h/${token}/present`);
  revalidatePath(`/e/${event.id}`);
  return { ok: true };
}

export async function listQueueAction(token: string) {
  const event = await getEventByToken(token);
  if (!event) return [];
  return listSubmissions(event.id);
}

export async function getPublicEventAction(eventId: string) {
  return getPublicBundle(eventId);
}

export async function listPeopleAction(token: string) {
  const event = await getEventByToken(token);
  if (!event) return [];
  return listParticipants(event.id);
}

export async function publicRsvpAction(formData: FormData) {
  try {
    const eventId = str(formData.get("event_id"));
    const event = await getEventById(eventId);
    if (!event) return { error: "Event not found." };
    const name = str(formData.get("name"));
    if (!name) return { error: "Name is required." };
    await addParticipant({
      eventId: event.id,
      name,
      phone_or_email: str(formData.get("phone_or_email")) || null,
      fun_fact: str(formData.get("fun_fact")) || null,
      rsvp: str(formData.get("rsvp")) || "yes",
    });
    revalidatePath(`/e/${event.id}`);
    revalidatePath(`/h/${event.host_token}`);
    return { ok: true, message: "RSVP saved. The host will see you under People." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save RSVP.";
    return { error: message };
  }
}

export async function publicSubmitAction(formData: FormData) {
  try {
    const eventId = str(formData.get("event_id"));
    const event = await getEventById(eventId);
    if (!event) return { error: "Event not found." };
    const name = str(formData.get("name"));
    const title = str(formData.get("title"));
    if (!name || !title) return { error: "Name and title are required." };
    const participant = await addParticipant({
      eventId: event.id,
      name,
      phone_or_email: str(formData.get("phone_or_email")) || null,
      fun_fact: str(formData.get("fun_fact")) || null,
      rsvp: "yes",
    });
    await addSubmission({
      eventId: event.id,
      participantId: participant.id,
      type: (str(formData.get("type")) as "song" | "performance" | "game") || "song",
      title,
      link: str(formData.get("link")) || null,
      duration: num(formData.get("duration")),
      note: null,
      source: "participant",
    });
    revalidatePath(`/e/${event.id}`);
    revalidatePath(`/h/${event.host_token}`);
    return { ok: true, message: "Submitted. The host will see it in Songs and People." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save submission.";
    return { error: message };
  }
}
