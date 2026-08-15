"use client";

import { useState } from "react";
import { createEventAction } from "@/lib/actions";
import { EVENT_TYPES, LANGUAGES, TONES } from "@/lib/types";
import { EVENT_TEMPLATES } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function CreateEventForm() {
  const [mode, setMode] = useState<"blank" | "template">("template");
  const [templateId, setTemplateId] = useState(EVENT_TEMPLATES[0]?.id ?? "");
  const selected = EVENT_TEMPLATES.find((t) => t.id === templateId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an event</CardTitle>
        <CardDescription>
          You&apos;ll get a private host link (keep it secret) and a public link for guests. No
          login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "template" ? "default" : "outline"}
              onClick={() => setMode("template")}
            >
              Start from template
            </Button>
            <Button
              type="button"
              variant={mode === "blank" ? "default" : "outline"}
              onClick={() => {
                setMode("blank");
                setTemplateId("");
              }}
            >
              Start blank
            </Button>
          </div>

          {mode === "template" ? (
            <div className="grid gap-2">
              <Label htmlFor="template_id">Template</Label>
              <select
                id="template_id"
                name="template_id"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                {EVENT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-background text-foreground">
                    {t.name}
                  </option>
                ))}
              </select>
              {selected ? (
                <p className="text-sm text-muted-foreground">
                  Includes {selected.script_sections.length} script sections,{" "}
                  {selected.songs.length} suggested songs, and {selected.activities.length}{" "}
                  icebreakers/games — all editable after you create the event.
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
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={
                  mode === "template" && selected ? selected.type : "Custom"
                }
                key={`${mode}-${templateId}-type`}
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
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
              <Input id="date" name="date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                name="tone"
                defaultValue={mode === "template" && selected?.type === "Independence Day" ? "patriotic" : "casual"}
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
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
              <select
                id="language"
                name="language"
                defaultValue="English"
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
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
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Creating…" : "Create event & get links"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
