import { randomBytes } from "crypto";
import { getSql } from "@/lib/db";
import { getTemplate } from "@/lib/templates";
import type {
  ActivityRow,
  EventRow,
  ParticipantRow,
  ScriptSectionRow,
  SubmissionRow,
  TimelineItemRow,
} from "@/lib/types";

export function newHostToken() {
  return randomBytes(24).toString("base64url");
}

export async function getEventByToken(token: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM events WHERE host_token = ${token} LIMIT 1
  `;
  return (rows[0] as EventRow | undefined) ?? null;
}

export async function getEventById(id: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`;
  return (rows[0] as EventRow | undefined) ?? null;
}

export async function createEvent(input: {
  name: string;
  type: string;
  date: string | null;
  tone: string;
  language: string;
  expected_audience: number | null;
  duration_minutes: number | null;
  template_id: string | null;
}) {
  const sql = getSql();
  const host_token = newHostToken();
  const template = input.template_id ? getTemplate(input.template_id) : undefined;

  if (template) {
    await sql`
      INSERT INTO templates (id, name, type, payload)
      VALUES (${template.id}, ${template.name}, ${template.type}, ${JSON.stringify(template)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        payload = EXCLUDED.payload
    `;
  }

  const rows = await sql`
    INSERT INTO events (
      name, type, date, tone, language, expected_audience, duration_minutes, host_token, template_id
    ) VALUES (
      ${input.name},
      ${input.type},
      ${input.date},
      ${input.tone},
      ${input.language},
      ${input.expected_audience},
      ${input.duration_minutes},
      ${host_token},
      ${template?.id ?? null}
    )
    RETURNING *
  `;
  const event = rows[0] as EventRow;

  if (template) {
    await cloneTemplateIntoEvent(event.id, template.id);
  }

  return event;
}

export async function cloneTemplateIntoEvent(eventId: string, templateId: string) {
  const template = getTemplate(templateId);
  if (!template) return;
  const sql = getSql();
  let order = 0;

  for (const section of template.script_sections) {
    const inserted = await sql`
      INSERT INTO script_sections (event_id, title, content, order_index, source, duration_minutes)
      VALUES (
        ${eventId},
        ${section.title},
        ${section.content},
        ${order},
        'template',
        ${section.duration_minutes}
      )
      RETURNING id
    `;
    await sql`
      INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
      VALUES (${eventId}, 'script', ${inserted[0].id}, ${section.duration_minutes}, ${order})
    `;
    order += 1;
  }

  for (const song of template.songs) {
    const inserted = await sql`
      INSERT INTO submissions (
        event_id, participant_id, type, title, link, duration, order_index, note, source
      ) VALUES (
        ${eventId},
        null,
        'song',
        ${song.title},
        ${song.link ?? null},
        ${song.duration},
        ${order},
        ${song.note},
        'template'
      )
      RETURNING id
    `;
    await sql`
      INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
      VALUES (${eventId}, 'submission', ${inserted[0].id}, ${song.duration}, ${order})
    `;
    order += 1;
  }

  for (const activity of template.activities) {
    const inserted = await sql`
      INSERT INTO activities (event_id, title, description, duration_minutes, source)
      VALUES (
        ${eventId},
        ${activity.title},
        ${activity.description},
        ${activity.duration_minutes},
        'template'
      )
      RETURNING id
    `;
    await sql`
      INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
      VALUES (${eventId}, 'activity', ${inserted[0].id}, ${activity.duration_minutes}, ${order})
    `;
    order += 1;
  }
}

export async function listScriptSections(eventId: string) {
  const sql = getSql();
  return (await sql`
    SELECT * FROM script_sections WHERE event_id = ${eventId} ORDER BY order_index, title
  `) as ScriptSectionRow[];
}

export async function replaceScriptSections(
  eventId: string,
  sections: { title: string; content: string }[],
  source: "pasted" | "manual"
) {
  const sql = getSql();
  await sql`DELETE FROM timeline_items WHERE event_id = ${eventId} AND kind = 'script'`;
  await sql`DELETE FROM script_sections WHERE event_id = ${eventId}`;

  const maxOrder = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM timeline_items WHERE event_id = ${eventId}
  `;
  let order = Number(maxOrder[0]?.max ?? -1) + 1;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const inserted = await sql`
      INSERT INTO script_sections (event_id, title, content, order_index, source, duration_minutes)
      VALUES (${eventId}, ${section.title}, ${section.content}, ${i}, ${source}, 5)
      RETURNING id
    `;
    await sql`
      INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
      VALUES (${eventId}, 'script', ${inserted[0].id}, 5, ${order})
    `;
    order += 1;
  }
}

export async function updateScriptSection(
  id: string,
  eventId: string,
  fields: { title?: string; content?: string; duration_minutes?: number | null }
) {
  const sql = getSql();
  const title = fields.title;
  const content = fields.content;
  const duration = fields.duration_minutes;
  await sql`
    UPDATE script_sections SET
      title = COALESCE(${title ?? null}, title),
      content = COALESCE(${content ?? null}, content),
      duration_minutes = COALESCE(${duration ?? null}, duration_minutes)
    WHERE id = ${id} AND event_id = ${eventId}
  `;
  if (duration != null) {
    await sql`
      UPDATE timeline_items
      SET duration_minutes = ${duration}
      WHERE event_id = ${eventId} AND kind = 'script' AND ref_id = ${id}
    `;
  }
}

export async function addManualScriptSection(eventId: string, title: string, content: string) {
  const sql = getSql();
  const maxS = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM script_sections WHERE event_id = ${eventId}
  `;
  const maxT = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM timeline_items WHERE event_id = ${eventId}
  `;
  const inserted = await sql`
    INSERT INTO script_sections (event_id, title, content, order_index, source, duration_minutes)
    VALUES (${eventId}, ${title}, ${content}, ${Number(maxS[0].max) + 1}, 'manual', 5)
    RETURNING *
  `;
  await sql`
    INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
    VALUES (${eventId}, 'script', ${inserted[0].id}, 5, ${Number(maxT[0].max) + 1})
  `;
  return inserted[0] as ScriptSectionRow;
}

export async function deleteScriptSection(id: string, eventId: string) {
  const sql = getSql();
  await sql`DELETE FROM timeline_items WHERE event_id = ${eventId} AND kind = 'script' AND ref_id = ${id}`;
  await sql`DELETE FROM script_sections WHERE id = ${id} AND event_id = ${eventId}`;
}

export async function listSubmissions(eventId: string) {
  const sql = getSql();
  return (await sql`
    SELECT s.*, p.name AS participant_name
    FROM submissions s
    LEFT JOIN participants p ON p.id = s.participant_id
    WHERE s.event_id = ${eventId}
    ORDER BY s.order_index, s.created_at
  `) as (SubmissionRow & { participant_name: string | null })[];
}

export async function addSubmission(input: {
  eventId: string;
  participantId: string | null;
  type: "song" | "performance" | "game";
  title: string;
  link: string | null;
  duration: number | null;
  note: string | null;
  source: string;
}) {
  const sql = getSql();
  const maxS = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM submissions WHERE event_id = ${input.eventId}
  `;
  const maxT = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM timeline_items WHERE event_id = ${input.eventId}
  `;
  const inserted = await sql`
    INSERT INTO submissions (
      event_id, participant_id, type, title, link, duration, order_index, note, source
    ) VALUES (
      ${input.eventId},
      ${input.participantId},
      ${input.type},
      ${input.title},
      ${input.link},
      ${input.duration},
      ${Number(maxS[0].max) + 1},
      ${input.note},
      ${input.source}
    )
    RETURNING *
  `;
  await sql`
    INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
    VALUES (
      ${input.eventId},
      'submission',
      ${inserted[0].id},
      ${input.duration},
      ${Number(maxT[0].max) + 1}
    )
  `;
  return inserted[0] as SubmissionRow;
}

export async function updateSubmission(
  id: string,
  eventId: string,
  fields: { title?: string; note?: string | null; duration?: number | null; link?: string | null }
) {
  const sql = getSql();
  await sql`
    UPDATE submissions SET
      title = COALESCE(${fields.title ?? null}, title),
      note = COALESCE(${fields.note ?? null}, note),
      duration = COALESCE(${fields.duration ?? null}, duration),
      link = COALESCE(${fields.link ?? null}, link)
    WHERE id = ${id} AND event_id = ${eventId}
  `;
  if (fields.duration != null) {
    await sql`
      UPDATE timeline_items SET duration_minutes = ${fields.duration}
      WHERE event_id = ${eventId} AND kind = 'submission' AND ref_id = ${id}
    `;
  }
}

export async function deleteSubmission(id: string, eventId: string) {
  const sql = getSql();
  await sql`DELETE FROM timeline_items WHERE event_id = ${eventId} AND kind = 'submission' AND ref_id = ${id}`;
  await sql`DELETE FROM submissions WHERE id = ${id} AND event_id = ${eventId}`;
}

export async function reorderSubmissions(eventId: string, ids: string[]) {
  const sql = getSql();
  for (let i = 0; i < ids.length; i++) {
    await sql`
      UPDATE submissions SET order_index = ${i} WHERE id = ${ids[i]} AND event_id = ${eventId}
    `;
  }
}

export async function listActivities(eventId: string) {
  const sql = getSql();
  return (await sql`
    SELECT * FROM activities WHERE event_id = ${eventId} ORDER BY is_favorite DESC, title
  `) as ActivityRow[];
}

export async function addActivity(input: {
  eventId: string;
  title: string;
  description: string;
  duration_minutes: number | null;
  source: "template" | "manual" | "library";
}) {
  const sql = getSql();
  const inserted = await sql`
    INSERT INTO activities (event_id, title, description, duration_minutes, source)
    VALUES (${input.eventId}, ${input.title}, ${input.description}, ${input.duration_minutes}, ${input.source})
    RETURNING *
  `;
  const maxT = await sql`
    SELECT COALESCE(MAX(order_index), -1) AS max FROM timeline_items WHERE event_id = ${input.eventId}
  `;
  await sql`
    INSERT INTO timeline_items (event_id, kind, ref_id, duration_minutes, order_index)
    VALUES (
      ${input.eventId},
      'activity',
      ${inserted[0].id},
      ${input.duration_minutes},
      ${Number(maxT[0].max) + 1}
    )
  `;
  return inserted[0] as ActivityRow;
}

export async function toggleFavorite(id: string, eventId: string) {
  const sql = getSql();
  await sql`
    UPDATE activities SET is_favorite = NOT is_favorite WHERE id = ${id} AND event_id = ${eventId}
  `;
}

export async function deleteActivity(id: string, eventId: string) {
  const sql = getSql();
  await sql`DELETE FROM timeline_items WHERE event_id = ${eventId} AND kind = 'activity' AND ref_id = ${id}`;
  await sql`DELETE FROM activities WHERE id = ${id} AND event_id = ${eventId}`;
}

export async function listParticipants(eventId: string) {
  const sql = getSql();
  return (await sql`
    SELECT * FROM participants WHERE event_id = ${eventId} ORDER BY created_at DESC
  `) as ParticipantRow[];
}

export async function addParticipant(input: {
  eventId: string;
  name: string;
  phone_or_email: string | null;
  fun_fact: string | null;
  rsvp: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO participants (event_id, name, phone_or_email, fun_fact, rsvp)
    VALUES (${input.eventId}, ${input.name}, ${input.phone_or_email}, ${input.fun_fact}, ${input.rsvp})
    RETURNING *
  `;
  return rows[0] as ParticipantRow;
}

export async function listTimeline(eventId: string) {
  const sql = getSql();
  return (await sql`
    SELECT * FROM timeline_items WHERE event_id = ${eventId} ORDER BY order_index, id
  `) as TimelineItemRow[];
}

export async function reorderTimeline(eventId: string, ids: string[]) {
  const sql = getSql();
  for (let i = 0; i < ids.length; i++) {
    await sql`
      UPDATE timeline_items SET order_index = ${i} WHERE id = ${ids[i]} AND event_id = ${eventId}
    `;
  }
}

export async function updateTimelineDuration(
  id: string,
  eventId: string,
  duration_minutes: number | null
) {
  const sql = getSql();
  await sql`
    UPDATE timeline_items
    SET duration_minutes = ${duration_minutes}
    WHERE id = ${id} AND event_id = ${eventId}
  `;
}

export async function getHostBundle(token: string) {
  const event = await getEventByToken(token);
  if (!event) return null;
  const [scripts, submissions, activities, participants, timeline] = await Promise.all([
    listScriptSections(event.id),
    listSubmissions(event.id),
    listActivities(event.id),
    listParticipants(event.id),
    listTimeline(event.id),
  ]);
  return { event, scripts, submissions, activities, participants, timeline };
}
