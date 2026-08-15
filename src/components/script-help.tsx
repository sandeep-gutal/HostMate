"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addSectionAction,
  deleteSectionAction,
  savePastedScriptAction,
  updateSectionAction,
} from "@/lib/actions";
import { buildScriptPrompt } from "@/lib/prompt";
import type { EventRow, ScriptSectionRow } from "@/lib/types";

export function ScriptHelp({
  event,
  sections,
}: {
  event: EventRow;
  sections: ScriptSectionRow[];
}) {
  const prompt = buildScriptPrompt(event);
  const [paste, setPaste] = useState("");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Get script help</CardTitle>
          <CardDescription>
            HostMate does not call any AI. Copy this prompt, paste it into ChatGPT, Claude, or
            Gemini, then paste the result back below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea value={prompt} readOnly rows={14} className="font-mono text-xs md:text-sm" />
          <CopyButton text={prompt} label="Copy prompt" className="w-full sm:w-auto" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paste your script here</CardTitle>
          <CardDescription>
            If the text has headings like Opening / Transitions / Closing, we&apos;ll split it into
            editable sections. Otherwise it stays one block.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={savePastedScriptAction} className="grid gap-3">
            <input type="hidden" name="token" value={event.host_token} />
            <Textarea
              name="script"
              rows={10}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste the script you got from ChatGPT, Claude, or Gemini…"
            />
            <Button type="submit" disabled={!paste.trim()}>
              Parse & save script
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Editable sections</h2>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No script yet. Start from a template, paste one above, or add a section.
          </p>
        ) : null}
        {sections.map((section) => (
          <Card key={section.id}>
            <CardContent className="grid gap-3 pt-4">
              <form action={updateSectionAction} className="grid gap-3">
                <input type="hidden" name="token" value={event.host_token} />
                <input type="hidden" name="id" value={section.id} />
                <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
                  <div className="grid gap-1">
                    <Label>Title</Label>
                    <Input name="title" defaultValue={section.title} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Minutes</Label>
                    <Input
                      name="duration_minutes"
                      type="number"
                      min={1}
                      defaultValue={section.duration_minutes ?? 5}
                    />
                  </div>
                </div>
                <Textarea name="content" rows={8} defaultValue={section.content} />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="secondary">
                    Save section
                  </Button>
                  <span className="self-center text-xs text-muted-foreground">
                    Source: {section.source}
                  </span>
                </div>
              </form>
              <form action={deleteSectionAction}>
                <input type="hidden" name="token" value={event.host_token} />
                <input type="hidden" name="id" value={section.id} />
                <Button type="submit" variant="ghost" className="text-destructive">
                  Remove
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Add a section</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addSectionAction} className="grid gap-3">
              <input type="hidden" name="token" value={event.host_token} />
              <Input name="title" placeholder="Title (e.g. Sponsor mention)" required />
              <Textarea name="content" rows={4} placeholder="Words you will say…" />
              <Button type="submit" variant="outline">
                Add section
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
