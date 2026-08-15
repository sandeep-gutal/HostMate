export const EVENT_TYPES = [
  "Independence Day",
  "Diwali",
  "Annual Day",
  "Birthday",
  "Corporate",
  "Custom",
] as const;

export const TONES = ["formal", "fun", "patriotic", "casual"] as const;

export const LANGUAGES = ["English", "Hindi", "Hinglish", "Marathi", "Tamil", "Telugu"] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type Tone = (typeof TONES)[number];

export type EventRow = {
  id: string;
  name: string;
  type: string;
  date: string | null;
  tone: string;
  language: string;
  expected_audience: number | null;
  duration_minutes: number | null;
  host_token: string;
  template_id: string | null;
  created_at: string;
};

export type ParticipantRow = {
  id: string;
  event_id: string;
  name: string;
  phone_or_email: string | null;
  fun_fact: string | null;
  rsvp: string;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  event_id: string;
  participant_id: string | null;
  type: "song" | "performance" | "game";
  title: string;
  link: string | null;
  duration: number | null;
  order_index: number;
  note: string | null;
  source: string;
};

export type ScriptSectionRow = {
  id: string;
  event_id: string;
  title: string;
  content: string;
  order_index: number;
  source: "template" | "pasted" | "manual";
  duration_minutes: number | null;
};

export type ActivityRow = {
  id: string;
  event_id: string;
  title: string;
  description: string;
  duration_minutes: number | null;
  source: "template" | "manual" | "library";
  is_favorite: boolean;
};

export type TimelineItemRow = {
  id: string;
  event_id: string;
  kind: "script" | "submission" | "activity";
  ref_id: string;
  duration_minutes: number | null;
  order_index: number;
};

export type TemplateSong = {
  title: string;
  note: string;
  duration: number;
  link?: string;
};

export type TemplateActivity = {
  title: string;
  description: string;
  duration_minutes: number;
};

export type TemplateScriptSection = {
  title: string;
  content: string;
  duration_minutes: number;
};

export type EventTemplate = {
  id: string;
  name: string;
  type: EventType;
  script_sections: TemplateScriptSection[];
  songs: TemplateSong[];
  activities: TemplateActivity[];
};
