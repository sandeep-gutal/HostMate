"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listPeopleAction } from "@/lib/actions";
import type { ParticipantRow } from "@/lib/types";

export function PeoplePanel({
  token,
  people,
}: {
  token: string;
  people: ParticipantRow[];
}) {
  const [rows, setRows] = useState(people);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const next = await listPeopleAction(token);
      setRows(next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {rows.length === 0 ? "No RSVPs yet." : `${rows.length} guest${rows.length === 1 ? "" : "s"}`}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Share the public guest link, then tap Refresh. RSVPs and performance sign-ups show up here.
        </p>
      ) : (
        rows.map((person) => (
          <Card key={person.id}>
            <CardContent className="grid gap-1 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{person.name}</p>
                <span className="text-xs uppercase text-muted-foreground">RSVP {person.rsvp}</span>
              </div>
              {person.phone_or_email ? (
                <p className="text-sm text-muted-foreground">{person.phone_or_email}</p>
              ) : null}
              {person.fun_fact ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Fun fact: </span>
                  {person.fun_fact}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
