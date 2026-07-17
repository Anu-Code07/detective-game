import type { InvestigationCase, InvestigationState } from "@/types/case";

export interface ContradictionMatch {
  timelineEventId: string;
  conflictingEventId?: string;
  title: string;
  message: string;
  personId: string;
}

const LIE_PATTERNS = [
  /i was (at home|asleep|in bed|nowhere near)/i,
  /i never (saw|met|spoke|left)/i,
  /i don't (know|remember|recall)/i,
  /that('s| is) not true/i,
  /i wasn't (there|involved)/i,
];

export function detectInterrogationContradiction(
  caseData: InvestigationCase,
  personId: string,
  reply: string,
  investigation: InvestigationState
): ContradictionMatch | null {
  const person =
    caseData.suspects.find((s) => s.id === personId) ??
    caseData.witnesses.find((w) => w.id === personId);
  if (!person) return null;

  const discovered = new Set(investigation.discoveredTimeline);
  const alreadyFlagged = new Set(investigation.contradictionsFound);
  const replyLower = reply.toLowerCase();
  const alibiLower = person.alibi.toLowerCase();

  // Timeline conflicts involving this person
  for (const event of caseData.timeline) {
    const known = event.known || discovered.has(event.id);
    if (!known || !event.people.includes(personId)) continue;
    if (alreadyFlagged.has(event.id)) continue;

    const eventKeywords = [
      ...event.title.toLowerCase().split(/\s+/),
      ...event.description.toLowerCase().split(/\s+/),
    ].filter((w) => w.length > 4);

    const mentionsEvent = eventKeywords.some((k) => replyLower.includes(k));
    const deniesPresence =
      LIE_PATTERNS.some((p) => p.test(reply)) ||
      (/wasn't|weren't|not there|nowhere near/i.test(reply) &&
        event.people.includes(personId));

    if (deniesPresence || (mentionsEvent && event.conflictWith?.length)) {
      const conflictId = event.conflictWith?.[0];
      const conflict = conflictId
        ? caseData.timeline.find((t) => t.id === conflictId)
        : undefined;

      if (conflict && (conflict.known || discovered.has(conflict.id))) {
        return {
          timelineEventId: event.id,
          conflictingEventId: conflict.id,
          title: `Contradiction: ${event.title}`,
          message: `${person.name}'s story conflicts with "${conflict.title}". The timeline doesn't match.`,
          personId,
        };
      }

      if (deniesPresence && event.description.length > 10) {
        return {
          timelineEventId: event.id,
          title: `Alibi conflict`,
          message: `${person.name} denies involvement, but records place them at "${event.title}".`,
          personId,
        };
      }
    }
  }

  // Alibi keyword mismatch — reply contradicts stated alibi
  const alibiPlaces = alibiLower.match(
    /\b(garage|office|home|call|union|conference|dock|warehouse|bar|restaurant|floor|parking)\b/g
  );
  if (alibiPlaces && LIE_PATTERNS.some((p) => p.test(reply))) {
    const replyPlaces = replyLower.match(
      /\b(garage|office|home|call|union|conference|dock|warehouse|bar|restaurant|floor|parking)\b/g
    );
    if (replyPlaces) {
      const mismatch = replyPlaces.some((p) => !alibiPlaces.includes(p));
      if (mismatch) {
        const event = caseData.timeline.find(
          (t) =>
            (t.known || discovered.has(t.id)) &&
            t.people.includes(personId) &&
            !alreadyFlagged.has(t.id)
        );
        if (event) {
          return {
            timelineEventId: event.id,
            title: "Story doesn't match dossier",
            message: `${person.name}'s answer contradicts their filed alibi. Flag this contradiction.`,
            personId,
          };
        }
      }
    }
  }

  return null;
}

export function getContradictionUnlockEvidence(
  caseData: InvestigationCase,
  timelineEventId: string
): string | null {
  const event = caseData.timeline.find((t) => t.id === timelineEventId);
  if (!event?.evidence.length) return null;
  return event.evidence.find((eid) => {
    const ev = caseData.evidence.find((e) => e.id === eid);
    return ev?.hidden;
  }) ?? event.evidence[0] ?? null;
}
