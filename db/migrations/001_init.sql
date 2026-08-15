CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE,
  tone TEXT NOT NULL DEFAULT 'casual',
  language TEXT NOT NULL DEFAULT 'English',
  expected_audience INTEGER,
  duration_minutes INTEGER,
  host_token TEXT NOT NULL UNIQUE,
  template_id TEXT REFERENCES templates(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_or_email TEXT,
  fun_fact TEXT,
  rsvp TEXT NOT NULL DEFAULT 'yes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('song', 'performance', 'game')),
  title TEXT NOT NULL,
  link TEXT,
  duration INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'participant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS script_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('template', 'pasted', 'manual')),
  duration_minutes INTEGER
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER,
  source TEXT NOT NULL CHECK (source IN ('template', 'manual', 'library')),
  is_favorite BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('script', 'submission', 'activity')),
  ref_id UUID NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_host_token ON events(host_token);
CREATE INDEX IF NOT EXISTS idx_participants_event ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_submissions_event ON submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_script_event ON script_sections(event_id);
CREATE INDEX IF NOT EXISTS idx_activities_event ON activities(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event ON timeline_items(event_id, order_index);
