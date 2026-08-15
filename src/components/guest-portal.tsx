"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publicRsvpAction, publicSubmitAction } from "@/lib/actions";
import type { EventRow } from "@/lib/types";

export function GuestPortal({ event }: { event: EventRow }) {
  const [rsvpMsg, setRsvpMsg] = useState<string | null>(null);
  const [subMsg, setSubMsg] = useState<string | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <header className="grid gap-1">
        <p className="text-sm font-medium text-primary">You&apos;re invited</p>
        <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
        <p className="text-sm text-muted-foreground">
          {event.type}
          {event.date ? ` · ${event.date}` : ""} · {event.tone}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>RSVP</CardTitle>
          <CardDescription>
            No account needed. Add a short fun fact the host can use in intros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            action={async (formData) => {
              try {
                const result = await publicRsvpAction(formData);
                setRsvpMsg(result?.error || result?.message || "Saved.");
              } catch (err) {
                setRsvpMsg(err instanceof Error ? err.message : "Could not save RSVP.");
              }
            }}
          >
            <input type="hidden" name="event_id" value={event.id} />
            <div className="grid gap-1">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="phone_or_email">Phone or email</Label>
              <Input id="phone_or_email" name="phone_or_email" />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="rsvp">Coming?</Label>
              <select
                id="rsvp"
                name="rsvp"
                defaultValue="yes"
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="yes">Yes</option>
                <option value="maybe">Maybe</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="fun_fact">Fun fact (for intros)</Label>
              <Textarea id="fun_fact" name="fun_fact" rows={3} placeholder="I once…" />
            </div>
            {rsvpMsg ? <p className="text-sm text-primary">{rsvpMsg}</p> : null}
            <Button type="submit">Send RSVP</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Song or performance</CardTitle>
          <CardDescription>
            Request a song or sign up for a slot. The host will put you in the running order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            action={async (formData) => {
              try {
                const result = await publicSubmitAction(formData);
                setSubMsg(result?.error || result?.message || "Saved.");
              } catch (err) {
                setSubMsg(err instanceof Error ? err.message : "Could not save submission.");
              }
            }}
          >
            <input type="hidden" name="event_id" value={event.id} />
            <div className="grid gap-1">
              <Label>Your name</Label>
              <Input name="name" required />
            </div>
            <div className="grid gap-1">
              <Label>Phone or email</Label>
              <Input name="phone_or_email" />
            </div>
            <div className="grid gap-1">
              <Label>Type</Label>
              <select
                name="type"
                defaultValue="song"
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="song">Song request</option>
                <option value="performance">I want to perform</option>
                <option value="game">Game / activity idea</option>
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Title</Label>
              <Input name="title" required placeholder="Song or act title" />
            </div>
            <div className="grid gap-1">
              <Label>YouTube link</Label>
              <Input name="link" placeholder="https://…" />
            </div>
            <div className="grid gap-1">
              <Label>Duration (minutes)</Label>
              <Input name="duration" type="number" min={1} defaultValue={3} />
            </div>
            <div className="grid gap-1">
              <Label>Fun fact (optional)</Label>
              <Input name="fun_fact" />
            </div>
            {subMsg ? <p className="text-sm text-primary">{subMsg}</p> : null}
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
