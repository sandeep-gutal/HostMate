import { Card, CardContent } from "@/components/ui/card";
import type { ParticipantRow } from "@/lib/types";

export function PeoplePanel({ people }: { people: ParticipantRow[] }) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nobody has RSVP&apos;d or submitted yet. Share the public guest link.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {people.map((person) => (
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
      ))}
    </div>
  );
}
