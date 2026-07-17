import type { DashboardTab, InvestigationCase, InvestigationState } from "@/types/case";

export interface EvidenceUnlockLead {
  id: string;
  evidenceId: string;
  title: string;
  /** Detective briefing — what you know so far */
  context: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  /** Keywords that also count as correct in interrogation free-text */
  answerKeywords: string[];
  requiresEvidence?: string[];
  requiresTimeline?: string[];
  /** Ask the right person the right thing to unlock without MC */
  interrogationTriggers?: Array<{
    suspectId: string;
    keywords: string[];
    minMatches?: number;
  }>;
}

const LEADS_BY_CASE: Record<string, EvidenceUnlockLead[]> = {
  "case-01-meridian-ledger": [
    {
      id: "lead-01-cctv",
      evidenceId: "ev-cctv",
      title: "Camera Blind Spot",
      context:
        "Webb's badge places him in the garage during the murder window. Security logs show P3-B was manually overridden — but only certain credentials can do that.",
      question: "What type of access could disable the P3-B executive parking cameras?",
      options: ["Executive badge credential", "Visitor day pass", "Contractor temp PIN", "Fire safety override only"],
      correctIndex: 0,
      answerKeywords: ["executive", "exec-001", "ceo", "webb", "badge", "executive badge"],
      requiresEvidence: ["ev-badge"],
      interrogationTriggers: [
        { suspectId: "witness-guard", keywords: ["cctv", "camera", "override", "blind", "p3-b", "executive"], minMatches: 2 },
        { suspectId: "suspect-webb", keywords: ["camera", "override", "cctv", "garage"], minMatches: 2 },
      ],
    },
    {
      id: "lead-01-tireiron",
      evidenceId: "ev-tireiron",
      title: "Murder Weapon Trail",
      context:
        "The briefcase has a cylindrical dent and arterial blood. Pierce died from blunt force. Someone disposed of a weapon nearby.",
      question: "Where should detectives search for the likely murder weapon?",
      options: ["Alley behind Meridian Tower", "Webb's home safe", "Victim's vehicle trunk", "Corporate server room"],
      correctIndex: 0,
      answerKeywords: ["alley", "8th street", "dumpster", "tire iron", "lug wrench", "behind meridian"],
      requiresEvidence: ["ev-briefcase"],
      interrogationTriggers: [
        { suspectId: "witness-guard", keywords: ["alley", "dumpster", "weapon", "tire", "discarded"], minMatches: 2 },
      ],
    },
    {
      id: "lead-01-bank",
      evidenceId: "ev-bank",
      title: "Follow the Money",
      context:
        "The ledger shows $2.3M through Northline Consulting — a shell with no office. Pierce was going to the SEC Monday. Who benefited?",
      question: "Whose personal account received the Northline wire transfers?",
      options: ["Marcus Webb", "Daniel Pierce", "Elena Ortiz", "A shell with no owner"],
      correctIndex: 0,
      answerKeywords: ["webb", "marcus", "ceo", "northline", "7712", "shell account"],
      requiresEvidence: ["ev-ledger"],
      interrogationTriggers: [
        { suspectId: "suspect-klein", keywords: ["northline", "wire", "bank", "shell", "vendor", "transfer"], minMatches: 2 },
        { suspectId: "suspect-webb", keywords: ["northline", "consulting", "payment", "ledger"], minMatches: 2 },
      ],
    },
  ],
  "case-02-blood-tide": [
    {
      id: "lead-02-alibi",
      evidenceId: "ev2-alibi",
      title: "Union Call Alibi",
      context:
        "Calloway claims a union conference call covered the murder window. Tide tables show when Container RH-4481 was actually accessible.",
      question: "What disproves a supervisor alibi tied to the 01:15–01:45 AM tide window?",
      options: ["Tide log shows dock access during low tide only", "Victim was found in Break Room B", "Manifest was filed at noon", "Crane was under maintenance all night"],
      correctIndex: 0,
      answerKeywords: ["tide", "low tide", "01:15", "dock access", "berth 7", "water level"],
      requiresEvidence: ["ev2-tide"],
      interrogationTriggers: [
        { suspectId: "suspect-calloway", keywords: ["tide", "alibi", "union call", "01:", "dock"], minMatches: 2 },
      ],
    },
    {
      id: "lead-02-seal",
      evidenceId: "ev2-seal",
      title: "Container Seal Analysis",
      context: "RH-4481 was sealed from outside but opened from within. The killer knew smuggling protocol.",
      question: "How was the container opened without breaking the external seal?",
      options: ["Opened from inside by someone already in the container", "Seal was never applied", "Harbor crane lifted the roof", "Victim opened it himself"],
      correctIndex: 0,
      answerKeywords: ["inside", "interior", "from within", "sealed externally", "opened inside"],
      requiresEvidence: ["ev2-container"],
      interrogationTriggers: [
        { suspectId: "suspect-volkov", keywords: ["seal", "container", "inside", "opened"], minMatches: 2 },
      ],
    },
    {
      id: "lead-02-cutter",
      evidenceId: "ev2-cutter",
      title: "Bolt Cutter Toolmarks",
      context: "Forensics needs to match cutting tools used on container hardware. Supervisors have access to equipment lockers.",
      question: "Whose equipment should be compared to the container breach marks?",
      options: ["Harbor supervisor maintenance locker", "Victim's Army duffel", "Random dock visitor", "Coast Guard vessel"],
      correctIndex: 0,
      answerKeywords: ["bolt cutter", "cutter", "supervisor", "locker", "toolmark", "calloway"],
      requiresEvidence: ["ev2-container", "ev2-seal"],
      interrogationTriggers: [
        { suspectId: "suspect-huang", keywords: ["bolt", "cutter", "tool", "locker", "equipment"], minMatches: 2 },
      ],
    },
    {
      id: "lead-02-rope",
      evidenceId: "ev2-rope",
      title: "Hawser Fiber Match",
      context: "Ligature marks on Reyes match harbor rope. Berth 7 uses numbered hawsers for mooring.",
      question: "Which rope source matches fibers found on the victim's neck?",
      options: ["Berth 7 hawser #12", "Victim's boot laces", "Fishing net on Pier 3", "Crane cable grease rope"],
      correctIndex: 0,
      answerKeywords: ["hawser", "rope", "berth 7", "ligature", "fiber", "mooring"],
      requiresEvidence: ["ev2-container"],
      interrogationTriggers: [
        { suspectId: "witness-morales", keywords: ["rope", "hawser", "neck", "fiber", "berth"], minMatches: 2 },
      ],
    },
    {
      id: "lead-02-text",
      evidenceId: "ev2-text",
      title: "Threatening Text Thread",
      context: "Reyes was documenting irregular shipments. Someone warned him to stop before he died.",
      question: "What records are needed to recover deleted threats to the victim?",
      options: ["Phone warrant for supervisor's mobile", "Victim's grocery receipts", "Weather buoy data", "Union pension forms"],
      correctIndex: 0,
      answerKeywords: ["phone", "text", "warrant", "mobile", "threat", "message"],
      requiresEvidence: ["ev2-notebook"],
      interrogationTriggers: [
        { suspectId: "suspect-calloway", keywords: ["text", "message", "threat", "reyes", "stop"], minMatches: 2 },
      ],
    },
  ],
  "case-03-lilac-room": [
    {
      id: "lead-03-fingerprint",
      evidenceId: "ev3-fingerprint",
      title: "Decanter Prints",
      context: "Only Eleanor's glass had poison. The decanter was handled during dinner service — who had cellar access?",
      question: "Whose fingerprints on the decanter are most suspicious given server duties?",
      options: ["Clara Hughes — she retrieved wine alone", "Victor Whitmore — he left early", "The chef — kitchen only", "Eleanor — she was poisoned"],
      correctIndex: 0,
      answerKeywords: ["clara", "hughes", "caregiver", "decanter", "fingerprint", "server"],
      requiresEvidence: ["ev3-decanter", "ev3-glass"],
      interrogationTriggers: [
        { suspectId: "witness-chef", keywords: ["decanter", "wine", "clara", "cellar", "pour"], minMatches: 2 },
      ],
    },
    {
      id: "lead-03-medbox",
      evidenceId: "ev3-medbox",
      title: "Digoxin Source",
      context: "Toxicology shows fatal digoxin. Eleanor had no prescription. Someone with medication access could have taken it.",
      question: "Where would digoxin be hidden if the caregiver administered it?",
      options: ["Under the liner of Eleanor's medication lockbox", "In the kitchen spice rack", "Victor's suitcase", "Garden shed fertilizer"],
      correctIndex: 0,
      answerKeywords: ["medbox", "medication", "digoxin", "lockbox", "blister", "liner"],
      requiresEvidence: ["ev3-toxicology"],
      interrogationTriggers: [
        { suspectId: "suspect-victor", keywords: ["medication", "digoxin", "medbox", "clara", "pills"], minMatches: 2 },
      ],
    },
    {
      id: "lead-03-insurance",
      evidenceId: "ev3-insurance",
      title: "Secret Life Policy",
      context: "Eleanor revised her will days before death. Clara's bequest was cut. Who had financial motive beyond inheritance?",
      question: "What financial instrument would pay Clara if Eleanor died unexpectedly?",
      options: ["Life insurance policy with Clara as beneficiary", "Victor's trust fund", "Hospital foundation endowment", "Chef's catering bond"],
      correctIndex: 0,
      answerKeywords: ["insurance", "policy", "beneficiary", "clara", "50,000", "life insurance"],
      requiresEvidence: ["ev3-will"],
      interrogationTriggers: [
        { suspectId: "suspect-brennan", keywords: ["insurance", "policy", "will", "beneficiary", "clara"], minMatches: 2 },
      ],
    },
    {
      id: "lead-03-debt",
      evidenceId: "ev3-debt",
      title: "Clara's Loan Pressure",
      context: "Clara borrowed against an inheritance that never came. The new will left her almost nothing.",
      question: "What document shows Clara was financially desperate before the will change?",
      options: ["$90,000 loan collateralized against expected inheritance", "Victor's gambling debts", "Chef's tax lien", "Eleanor's charity receipts"],
      correctIndex: 0,
      answerKeywords: ["loan", "debt", "90,000", "inheritance", "collateral", "clara"],
      requiresEvidence: ["ev3-will", "ev3-insurance"],
      interrogationTriggers: [
        { suspectId: "suspect-victor", keywords: ["loan", "debt", "clara", "money", "inheritance"], minMatches: 2 },
      ],
    },
  ],
  "case-04-ash-embers": [
    {
      id: "lead-04-receipt",
      evidenceId: "ev4-receipt",
      title: "Hardware Store Trail",
      context: "Accelerant analysis matches premium unleaded with a specific additive. The office fire was deliberate.",
      question: "What purchase links a suspect to arson supplies on February 1st?",
      options: ["Gas can and zip ties on Grayson's credit card", "Holt's office stationery", "Fire extinguisher refill", "Soren's camera batteries"],
      correctIndex: 0,
      answerKeywords: ["receipt", "gas can", "zip tie", "hardware", "grayson", "february"],
      requiresEvidence: ["ev4-accelerant"],
      interrogationTriggers: [
        { suspectId: "suspect-grayson", keywords: ["gas", "receipt", "hardware", "can", "purchase"], minMatches: 2 },
      ],
    },
    {
      id: "lead-04-camera",
      evidenceId: "ev4-camera",
      title: "Camera Gap",
      context: "Sector 4 cameras went offline during the fire. Someone with system access created a blind spot.",
      question: "Whose credentials disabled factory cameras 1:25–2:20 AM?",
      options: ["Rita Soren — security contractor", "James Holt — victim", "Random burglar", "Fire department dispatch"],
      correctIndex: 0,
      answerKeywords: ["soren", "rita", "camera", "offline", "override", "security"],
      requiresEvidence: ["ev4-office"],
      interrogationTriggers: [
        { suspectId: "suspect-soren", keywords: ["camera", "offline", "override", "sector", "disabled"], minMatches: 2 },
      ],
    },
    {
      id: "lead-04-deposit",
      evidenceId: "ev4-deposit",
      title: "Cash Payment Link",
      context: "Soren's cameras went dark. The next day she deposited cash matching Grayson's withdrawal.",
      question: "What connects Soren's bank deposit to Grayson?",
      options: ["Serial numbers match Grayson's Feb 1 cash withdrawal", "Same offshore account", "Shared probation officer", "Identical handwriting on checks"],
      correctIndex: 0,
      answerKeywords: ["deposit", "cash", "serial", "2000", "grayson", "withdrawal"],
      requiresEvidence: ["ev4-camera"],
      interrogationTriggers: [
        { suspectId: "suspect-soren", keywords: ["deposit", "cash", "payment", "grayson", "money"], minMatches: 2 },
      ],
    },
    {
      id: "lead-04-monitor",
      evidenceId: "ev4-monitor",
      title: "Ankle Monitor Gap",
      context: "Grayson claims he was home on parole. GPS data may tell a different story near Industrial Way.",
      question: "What probation record proves Grayson left his residence during the fire?",
      options: ["Ankle monitor signal loss 1:28–2:05 AM near the factory", "Community service log", "Therapy attendance sheet", "Parole officer's vacation request"],
      correctIndex: 0,
      answerKeywords: ["ankle", "monitor", "gps", "probation", "signal loss", "industrial"],
      requiresEvidence: ["ev4-accelerant", "ev4-office"],
      interrogationTriggers: [
        { suspectId: "suspect-grayson", keywords: ["monitor", "ankle", "gps", "alibi", "home"], minMatches: 2 },
      ],
    },
  ],
  "case-05-last-broadcast": [
    {
      id: "lead-05-ballistics",
      evidenceId: "ev5-ballistics",
      title: "Lab Ballistics Match",
      context: "A .38 casing was found by the mixing board. State lab can compare it to registered weapons.",
      question: "What must be submitted to confirm the murder weapon model?",
      options: ["Shell casing to state ballistics lab", "Studio microphone", "Victim's notes only", "Parking receipt"],
      correctIndex: 0,
      answerKeywords: ["ballistics", "casing", "lab", "shell", ".38", "test fire"],
      requiresEvidence: ["ev5-shell"],
      interrogationTriggers: [
        { suspectId: "witness-patel", keywords: ["ballistics", "casing", "gun", "lab", "shell"], minMatches: 2 },
      ],
    },
    {
      id: "lead-05-audio",
      evidenceId: "ev5-audio",
      title: "Deleted Episode Audio",
      context: "Rachel's last words referenced '$400K collected.' Someone deleted the recording — but cloud sync may remain.",
      question: "Who can recover the auto-saved episode audio naming the killer?",
      options: ["Engineer Shaw — cloud backup access", "Councilman Hale only", "Studio janitor", "Food delivery driver"],
      correctIndex: 0,
      answerKeywords: ["audio", "cloud", "shaw", "recording", "episode", "backup", "deleted"],
      requiresEvidence: ["ev5-scene"],
      interrogationTriggers: [
        { suspectId: "suspect-shaw", keywords: ["audio", "recording", "cloud", "episode", "backup", "deleted"], minMatches: 2 },
        { suspectId: "witness-patel", keywords: ["audio", "recording", "episode", "shaw"], minMatches: 2 },
      ],
    },
    {
      id: "lead-05-keycard",
      evidenceId: "ev5-keycard",
      title: "Badge Reactivation",
      context: "Morrow's consultant badge was deactivated — yet it pinged entry at 10:52 PM. Someone with admin access reactivated it.",
      question: "Whose admin credentials reactivated Morrow's badge one minute before entry?",
      options: ["Derek Shaw — studio systems administrator", "Rachel Kane", "Councilman Hale", "Night security only"],
      correctIndex: 0,
      answerKeywords: ["keycard", "badge", "reactivat", "shaw", "admin", "10:51", "10:52"],
      requiresEvidence: ["ev5-scene"],
      interrogationTriggers: [
        { suspectId: "suspect-shaw", keywords: ["badge", "keycard", "reactivat", "access", "entry"], minMatches: 2 },
      ],
    },
    {
      id: "lead-05-payment",
      evidenceId: "ev5-payment",
      title: "Hush Money Transfer",
      context: "Rachel was about to expose a $400K payoff on air. Follow the money from the studio accounts.",
      question: "Whose financial records would show the $400K hush payment?",
      options: ["Derek Shaw — studio administrator wire trail", "Victim's personal checking", "Pizza vendor", "City parking meter revenue"],
      correctIndex: 0,
      answerKeywords: ["payment", "400", "wire", "shaw", "hush", "payoff", "financial"],
      requiresEvidence: ["ev5-audio"],
      interrogationTriggers: [
        { suspectId: "suspect-shaw", keywords: ["payment", "400", "money", "wire", "payoff"], minMatches: 2 },
      ],
    },
    {
      id: "lead-05-text",
      evidenceId: "ev5-text",
      title: "Threatening Messages",
      context: "Rachel received threats before the broadcast. A city official had motive to silence the story.",
      question: "Whose phone records should be subpoenaed for pre-murder threats?",
      options: ["Councilman Hale — political pressure on the story", "Studio intern", "Coffee shop owner", "Random listener"],
      correctIndex: 0,
      answerKeywords: ["hale", "councilman", "threat", "text", "phone", "warrant"],
      requiresEvidence: ["ev5-threat"],
      interrogationTriggers: [
        { suspectId: "suspect-hale", keywords: ["threat", "text", "message", "silence", "story"], minMatches: 2 },
      ],
    },
    {
      id: "lead-05-exit",
      evidenceId: "ev5-exit",
      title: "Alley Exit Wedge",
      context: "The booth door was locked inside — but the emergency alley exit was propped open. Killer needed a secondary escape.",
      question: "What physical evidence confirms the killer fled via the alley?",
      options: ["Wood wedge propping emergency exit — secondary sweep", "Roof helicopter landing", "Underground tunnel", "Victim's car keys"],
      correctIndex: 0,
      answerKeywords: ["exit", "alley", "wedge", "emergency", "propped", "sweep"],
      requiresEvidence: ["ev5-scene", "ev5-shell"],
      interrogationTriggers: [
        { suspectId: "witness-patel", keywords: ["exit", "alley", "wedge", "emergency", "door"], minMatches: 2 },
      ],
    },
  ],
};

export function getLeadsForCase(caseId: string): EvidenceUnlockLead[] {
  return LEADS_BY_CASE[caseId] ?? [];
}

function prerequisitesMet(lead: EvidenceUnlockLead, state: InvestigationState): boolean {
  const evidenceOk =
    !lead.requiresEvidence ||
    lead.requiresEvidence.every((id) => state.discoveredEvidence.includes(id));
  const timelineOk =
    !lead.requiresTimeline ||
    lead.requiresTimeline.every((id) => state.discoveredTimeline.includes(id));
  return evidenceOk && timelineOk;
}

export function getAvailableLeads(
  caseData: InvestigationCase,
  state: InvestigationState
): EvidenceUnlockLead[] {
  const leads = getLeadsForCase(caseData.meta.id);
  const solved = new Set(state.solvedLeads ?? []);
  const discovered = new Set(state.discoveredEvidence);

  return leads.filter(
    (lead) =>
      !discovered.has(lead.evidenceId) &&
      !solved.has(lead.id) &&
      prerequisitesMet(lead, state)
  );
}

export function getPendingLeads(
  caseData: InvestigationCase,
  state: InvestigationState
): EvidenceUnlockLead[] {
  const leads = getLeadsForCase(caseData.meta.id);
  const discovered = new Set(state.discoveredEvidence);

  return leads.filter(
    (lead) => !discovered.has(lead.evidenceId) && !prerequisitesMet(lead, state)
  );
}

export function validateLeadAnswer(lead: EvidenceUnlockLead, optionIndex: number): boolean {
  return optionIndex === lead.correctIndex;
}

export function matchInterrogationUnlock(
  caseData: InvestigationCase,
  state: InvestigationState,
  suspectId: string,
  question: string
): EvidenceUnlockLead | null {
  const available = getAvailableLeads(caseData, state);
  const q = question.toLowerCase();

  for (const lead of available) {
    if (lead.interrogationTriggers) {
      for (const trigger of lead.interrogationTriggers) {
        if (trigger.suspectId !== suspectId) continue;
        const min = trigger.minMatches ?? 2;
        const matches = trigger.keywords.filter((k) => q.includes(k.toLowerCase())).length;
        if (matches >= min) return lead;
      }
    }

    const answerMatches = lead.answerKeywords.filter((k) => q.includes(k.toLowerCase())).length;
    if (answerMatches >= 3) return lead;
  }

  return null;
}

export function getLeadForEvidence(caseId: string, evidenceId: string): EvidenceUnlockLead | undefined {
  return getLeadsForCase(caseId).find((l) => l.evidenceId === evidenceId);
}

export function getEvidenceTitle(caseData: InvestigationCase, evidenceId: string): string {
  return caseData.evidence.find((e) => e.id === evidenceId)?.title ?? "Unknown exhibit";
}

export interface UnlockDestination {
  tab: DashboardTab;
  leadId?: string;
  suspectId?: string;
  locationId?: string;
  evidenceId?: string;
  hint: string;
  actionLabel: string;
}

function getPersonName(caseData: InvestigationCase, personId?: string): string {
  if (!personId) return "witness";
  return (
    [...caseData.suspects, ...caseData.witnesses].find((p) => p.id === personId)?.name ?? "contact"
  );
}

function findPersonId(caseData: InvestigationCase, condition: string): string | undefined {
  const lower = condition.toLowerCase();
  const people = [...caseData.suspects, ...caseData.witnesses];

  for (const p of people) {
    const nameParts = p.name.toLowerCase().split(/\s+/);
    if (nameParts.some((part) => part.length > 3 && lower.includes(part))) return p.id;
    if (lower.includes(p.occupation.toLowerCase().slice(0, 8))) return p.id;
  }

  if (/security|guard|supervisor/.test(lower)) {
    return caseData.witnesses.find(
      (w) => w.id.includes("guard") || w.occupation.toLowerCase().includes("security")
    )?.id;
  }
  if (/producer|engineer|chef|contractor|operator/.test(lower)) {
    const roleMatch = people.find((p) =>
      lower.includes(p.occupation.toLowerCase().split(/[\s,]+/)[0] ?? "")
    );
    if (roleMatch) return roleMatch.id;
  }

  return people[0]?.id;
}

function findLocationId(caseData: InvestigationCase, evidenceId: string, condition: string): string | undefined {
  const byEvidence = caseData.locations.find((l) => l.evidenceIds.includes(evidenceId));
  if (byEvidence) return byEvidence.id;

  const lower = condition.toLowerCase();
  return caseData.locations.find(
    (l) =>
      lower.includes(l.name.toLowerCase()) ||
      lower.includes(l.address.toLowerCase()) ||
      l.description.toLowerCase().split(/\s+/).some((w) => w.length > 4 && lower.includes(w))
  )?.id;
}

function leadIsAvailable(lead: EvidenceUnlockLead, state: InvestigationState): boolean {
  const discovered = new Set(state.discoveredEvidence);
  const timeline = new Set(state.discoveredTimeline);
  const evidenceOk = !lead.requiresEvidence || lead.requiresEvidence.every((id) => discovered.has(id));
  const timelineOk = !lead.requiresTimeline || lead.requiresTimeline.every((id) => timeline.has(id));
  return evidenceOk && timelineOk;
}

/** Where the player should go to unlock a sealed exhibit */
export function getUnlockDestination(
  caseData: InvestigationCase,
  state: InvestigationState,
  evidenceId: string,
  depth = 0
): UnlockDestination {
  const stateNorm = { ...state, solvedLeads: state.solvedLeads ?? [] };
  const ev = caseData.evidence.find((e) => e.id === evidenceId);
  const lead = getLeadForEvidence(caseData.meta.id, evidenceId);
  const cond = ev?.unlockCondition ?? "";

  if (lead && depth < 4) {
    const missing = (lead.requiresEvidence ?? []).filter(
      (id) => !stateNorm.discoveredEvidence.includes(id)
    );
    if (missing.length > 0) {
      const prereq = getUnlockDestination(caseData, state, missing[0], depth + 1);
      const prereqTitle = getEvidenceTitle(caseData, missing[0]);
      return {
        ...prereq,
        evidenceId: missing[0],
        hint: `First recover "${prereqTitle}" — ${prereq.hint}`,
        actionLabel: `Step 1: ${prereq.actionLabel}`,
      };
    }

    if (leadIsAvailable(lead, stateNorm)) {
      const suspectId = lead.interrogationTriggers?.[0]?.suspectId;
      const personName = getPersonName(caseData, suspectId);
      const lower = cond.toLowerCase();

      if (/warrant|financial|subpoena/.test(lower) && stateNorm.warrantsRequested.length === 0) {
        return {
          tab: "documents",
          leadId: lead.id,
          hint: "Request a warrant in Documents, then return to solve the lead",
          actionLabel: "Documents → Request Warrant",
        };
      }

      if (/search|alley|sweep|scene/.test(lower)) {
        const locationId = findLocationId(caseData, evidenceId, cond);
        if (locationId) {
          return {
            tab: "map",
            leadId: lead.id,
            locationId,
            hint: cond || lead.title,
            actionLabel: `Map → Search location`,
          };
        }
      }

      if (suspectId && /interview|interrogate|press|ask/.test(lower)) {
        return {
          tab: "interrogate",
          leadId: lead.id,
          suspectId,
          hint: `Ask ${personName} about ${lead.title.toLowerCase()}`,
          actionLabel: `Interrogate ${personName}`,
        };
      }

      if (suspectId && lead.interrogationTriggers?.length) {
        return {
          tab: "interrogate",
          leadId: lead.id,
          suspectId,
          hint: `Or answer the deduction lead on Evidence tab`,
          actionLabel: `Interrogate ${personName}`,
        };
      }

      return {
        tab: "evidence",
        leadId: lead.id,
        hint: lead.context.slice(0, 120) + "...",
        actionLabel: `Solve lead: ${lead.title}`,
      };
    }
  }

  const lower = cond.toLowerCase();

  if (/interview|interrogate|press|ask/.test(lower)) {
    const suspectId = findPersonId(caseData, cond);
    return {
      tab: "interrogate",
      suspectId,
      hint: cond,
      actionLabel: suspectId ? `Interrogate ${getPersonName(caseData, suspectId)}` : "Go to Interrogate",
    };
  }

  if (/warrant|financial|subpoena|records|phone|probation/.test(lower)) {
    return {
      tab: "documents",
      hint: cond,
      actionLabel: "Documents → Request Warrant",
    };
  }

  if (/search|sweep|scene|alley|bedroom|location|map/.test(lower)) {
    const locationId = findLocationId(caseData, evidenceId, cond);
    return {
      tab: "map",
      locationId,
      hint: cond,
      actionLabel: "Map → Search location",
    };
  }

  if (/timeline|autopsy/.test(lower)) {
    return { tab: "timeline", hint: cond, actionLabel: "Open Timeline" };
  }

  if (/lab|forensic|ballistics|toxicology|submit|process/.test(lower)) {
    return { tab: "evidence", hint: cond, actionLabel: "Solve investigation lead" };
  }

  return {
    tab: "evidence",
    leadId: lead?.id,
    hint: cond || "Review investigation leads",
    actionLabel: lead ? `Solve lead: ${lead.title}` : "View investigation leads",
  };
}
