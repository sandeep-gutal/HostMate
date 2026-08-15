import type { EventTemplate } from "@/lib/types";
import independence from "../../data/templates/independence-day.json";
import diwali from "../../data/templates/diwali.json";
import annualDay from "../../data/templates/annual-day.json";
import kidsBirthday from "../../data/templates/kids-birthday.json";
import corporate from "../../data/templates/corporate.json";

export const EVENT_TEMPLATES: EventTemplate[] = [
  independence,
  diwali,
  annualDay,
  kidsBirthday,
  corporate,
] as EventTemplate[];

export function getTemplate(id: string): EventTemplate | undefined {
  return EVENT_TEMPLATES.find((t) => t.id === id);
}
