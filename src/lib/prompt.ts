import type { EventRow } from "@/lib/types";

export function buildScriptPrompt(event: EventRow): string {
  const date = event.date
    ? new Date(event.date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "date to be confirmed";
  const audience = event.expected_audience
    ? `about ${event.expected_audience} people`
    : "a mixed community audience";
  const duration = event.duration_minutes
    ? `${event.duration_minutes} minutes`
    : "a typical 45–90 minute programme";

  return `You are an experienced live-event host and emcee.

Write a ready-to-speak run-of-show SCRIPT for this event. Do not write a blog post. Write words the host can say into a microphone.

EVENT
- Name: ${event.name}
- Type: ${event.type}
- Date: ${date}
- Expected audience: ${audience}
- Language: ${event.language} (write the script in this language; short English stage directions in brackets are OK)
- Tone: ${event.tone}
- Duration to cover with spoken material: ${duration}

STRUCTURE (use these exact headings so it is easy to paste back)
## Opening
## Segment Transitions
## Closing

REQUIREMENTS
- Opening: welcome, set the tone, introduce the host as [HOST NAME], mention any flag / lamp / cake moment if relevant to ${event.type}.
- Segment Transitions: 3 short bridges the host can use between speeches, songs, and games. Label them (INTO SONGS / INTO GAMES / INTO CLOSING).
- Closing: vote of thanks plus a clear instruction for what happens next (food, departure, photo).
- Keep sentences speakable. Short paragraphs. Leave blanks like [CHIEF GUEST] and [SOCIETY NAME] where a name is unknown.
- No copyrighted song lyrics. You may NAME songs.
- No AI self-references. Just the script.`;
}
