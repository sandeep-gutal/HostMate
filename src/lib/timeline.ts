import type {
  ActivityRow,
  ScriptSectionRow,
  SubmissionRow,
  TimelineItemRow,
} from "@/lib/types";

export type TimelineViewItem = TimelineItemRow & {
  title: string;
  detail: string;
  link: string | null;
};

export function buildTimelineView(
  timeline: TimelineItemRow[],
  scripts: ScriptSectionRow[],
  submissions: SubmissionRow[],
  activities: ActivityRow[]
): TimelineViewItem[] {
  return timeline.map((item) => {
    if (item.kind === "script") {
      const ref = scripts.find((s) => s.id === item.ref_id);
      return {
        ...item,
        title: ref?.title ?? "Script",
        detail: ref?.content ?? "",
        link: null,
      };
    }
    if (item.kind === "submission") {
      const ref = submissions.find((s) => s.id === item.ref_id);
      return {
        ...item,
        title: ref?.title ?? "Performance",
        detail: [ref?.type, ref?.note, ref?.link].filter(Boolean).join(" · "),
        link: ref?.link ?? null,
      };
    }
    const ref = activities.find((s) => s.id === item.ref_id);
    return {
      ...item,
      title: ref?.title ?? "Activity",
      detail: ref?.description ?? "",
      link: null,
    };
  });
}
