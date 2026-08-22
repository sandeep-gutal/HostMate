"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { createEventAction } from "@/lib/actions";
import { EVENT_TYPES, LANGUAGES, TONES } from "@/lib/types";
import { EVENT_TEMPLATES } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CreateEventForm() {
  const [mode, setMode] = useState<"blank" | "template">("template");
  const [templateId, setTemplateId] = useState(EVENT_TEMPLATES[0]?.id ?? "");
  const selected = EVENT_TEMPLATES.find((t) => t.id === templateId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card id="create" className="surface-card overflow-hidden border-primary/15">
      <div className="h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-2xl tracking-tight">Create your event</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Get a private organizer link and a public guest invite. RSVPs, songs, and your run of show
          sync to Postgres — accessible from any device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          action={async (formData) => {
            setPending(true);
            setError(null);
            const result = await createEventAction(formData);
            if (result?.error) {
              setError(result.error);
              setPending(false);
            }
          }}
        >
          <div className="segmented">
            <button
              type="button"
              className={cn(
                "segmented-btn",
                mode === "template" ? "segmented-btn-active" : "segmented-btn-inactive"
              )}
              onClick={() => setMode("template")}
            >
              Start from template
            </button>
            <button
              type="button"
              className={cn(
                "segmented-btn",
                mode === "blank" ? "segmented-btn-active" : "segmented-btn-inactive"
              )}
              onClick={() => {
                setMode("blank");
                setTemplateId("");
              }}
            >
              Start blank
            </button>
          </div>

          {mode === "template" ? (
            <div className="grid gap-2">
              <Label htmlFor="template_id">Template</Label>
              <select
                id="template_id"
                name="template_id"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="field-select"
              >
                {EVENT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-background text-foreground">
                    {t.name}
                  </option>
                ))}
              </select>
              {selected ? (
                <p className="rounded-lg border border-white/[0.06] bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Includes {selected.script_sections.length} script sections,{" "}
                  {selected.songs.length} suggested songs, and {selected.activities.length}{" "}
                  icebreakers — all editable after creation.
                </p>
              ) : null}
            </div>
          ) : (
            <input type="hidden" name="template_id" value="" />
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. Green Park Society — 15 August"
              defaultValue={selected && mode === "template" ? selected.name : ""}
              key={`${mode}-${templateId}-name`}
              className="bg-background/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={mode === "template" && selected ? selected.type : "Custom"}
                key={`${mode}-${templateId}-type`}
                className="field-select"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-background text-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" className="bg-background/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                name="tone"
                defaultValue={
                  mode === "template" && selected?.type === "Independence Day" ? "patriotic" : "casual"
                }
                className="field-select"
              >
                {TONES.map((t) => (
                  <option key={t} value={t} className="bg-background text-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <select id="language" name="language" defaultValue="English" className="field-select">
                {LANGUAGES.map((t) => (
                  <option key={t} value={t} className="bg-background text-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expected_audience">Expected audience</Label>
              <Input
                id="expected_audience"
                name="expected_audience"
                type="number"
                min={1}
                placeholder="80"
                className="bg-background/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration_minutes">Spoken programme (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={10}
                placeholder="60"
                className="bg-background/50"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending} size="lg" className="w-full gap-2 sm:w-auto">
            {pending ? "Creating event…" : "Create event & get links"}
            {!pending ? <ArrowRight className="size-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
