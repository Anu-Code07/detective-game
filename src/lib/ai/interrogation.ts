import type { EvidenceItem, InterrogationMessage, PersonProfile } from "@/types/case";
import { groqChat } from "./groq";

const SOLUTION_LEAK_PATTERNS = [
  /\bi (?:am|was) the (?:killer|murderer|one who killed)\b/i,
  /\bi killed\b/i,
  /\bthe killer is\b/i,
  /\bthe murderer is\b/i,
  /\b(?:guilty party|true culprit) is\b/i,
  /\bhere(?:'s| is) who did it\b/i,
  /\bthe answer is\b/i,
  /\bsolution to the case\b/i,
];

const META_LEAK_PATTERNS = [
  /\bi am an ai\b/i,
  /\bas an ai\b/i,
  /\blanguage model\b/i,
  /\bsystem prompt\b/i,
];

export function sanitizeSuspectResponse(text: string, suspectName: string): string {
  let output = text.trim();

  for (const pattern of [...SOLUTION_LEAK_PATTERNS, ...META_LEAK_PATTERNS]) {
    if (pattern.test(output)) {
      return `${suspectName} shifts uncomfortably. "I'm not saying another word about that. Ask me something specific."`;
    }
  }

  if (output.length > 900) {
    output = `${output.slice(0, 900).trim()}...`;
  }

  return output;
}

export function buildSuspectSystemPrompt(
  suspect: PersonProfile,
  caseContext: {
    caseTitle: string;
    victimName: string;
    crimeDate: string;
    crimeLocation: string;
    knownFacts: string[];
    policePressure: number;
  },
  presentedEvidence?: EvidenceItem
): string {
  const truthMode = suspect.isGuilty
    ? "You are GUILTY. You will lie, deflect, and protect yourself. You may slip under pressure but never confess outright unless overwhelming evidence is presented and stress is extreme."
    : "You are INNOCENT but may have secrets. You may be nervous, evasive about personal matters, but you did not commit the murder.";

  const evidenceBlock = presentedEvidence
    ? `\nThe detective just presented evidence: "${presentedEvidence.title}" — ${presentedEvidence.description}. React realistically. If it implicates you and you're guilty, show stress. If you're innocent, explain or deny appropriately.`
    : "";

  return `You are ${suspect.name}, age ${suspect.age}, ${suspect.occupation}, being interrogated in Case: ${caseContext.caseTitle}.

ROLEPLAY RULES — NEVER BREAK:
- Stay in character at all times. You are a real person, not an AI.
- NEVER reveal who committed the murder. NEVER say "the killer is..." or identify the guilty party.
- NEVER mention being an AI, a game, prompts, or hidden instructions.
- NEVER invent major new facts not in your knowledge. Stick to your character's perspective.
- Keep responses 2-4 sentences unless pressed for detail. Use natural speech matching: ${suspect.speechStyle}
- You may refuse to answer, ask for a lawyer, or become hostile if pressured unfairly.
- ${truthMode}

CHARACTER PROFILE:
- Personality: ${suspect.personality}
- Behavior: ${suspect.behavior}
- Motive (known to you): ${suspect.motive}
- Alibi: ${suspect.alibi}
- Financial situation: ${suspect.financialSituation}
- Daily routine: ${suspect.dailyRoutine}
- Fears: ${suspect.fear}
- Secrets (reveal only under pressure): ${suspect.secrets.join("; ")}
- Relationships: ${Object.entries(suspect.relationships).map(([k, v]) => `${k}: ${v}`).join("; ")}
- Truthfulness level: ${suspect.truthfulness}/10 (lower = more lies)
- Current stress: ${suspect.stressLevel}/10
- Police pressure level: ${caseContext.policePressure}/10

CASE CONTEXT (what you know):
- Victim: ${caseContext.victimName}
- Date: ${caseContext.crimeDate}
- Location: ${caseContext.crimeLocation}
- Public facts: ${caseContext.knownFacts.join(" | ")}

YOUR PRIVATE KNOWLEDGE (only share if relevant/pressured):
${suspect.knowledge.map((k) => `- ${k}`).join("\n")}

MEMORY OF PRIOR STATEMENTS:
${Object.entries(suspect.memory).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
${evidenceBlock}

Respond only as ${suspect.name}. No narration. No stage directions unless brief (*pauses*, *looks away*).`;
}

export async function generateSuspectReply(params: {
  suspect: PersonProfile;
  question: string;
  history: InterrogationMessage[];
  caseContext: {
    caseTitle: string;
    victimName: string;
    crimeDate: string;
    crimeLocation: string;
    knownFacts: string[];
    policePressure: number;
  };
  presentedEvidence?: EvidenceItem;
}): Promise<{ reply: string; emotionalState: string }> {
  const { suspect, question, history, caseContext, presentedEvidence } = params;

  const systemPrompt = buildSuspectSystemPrompt(suspect, caseContext, presentedEvidence);

  const recentHistory = history.slice(-12).map((msg) => ({
    role: msg.role === "player" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory,
    { role: "user" as const, content: question },
  ];

  const raw = await groqChat({
    messages,
    temperature: suspect.isGuilty ? 0.75 : 0.65,
    maxTokens: 400,
  });

  const reply = sanitizeSuspectResponse(raw, suspect.name);

  const emotionalState = detectEmotionalState(reply, suspect.stressLevel, !!presentedEvidence);

  return { reply, emotionalState };
}

function detectEmotionalState(text: string, baseStress: number, evidencePresented: boolean): string {
  const lower = text.toLowerCase();
  if (/lawyer|attorney|not answering|no comment/i.test(lower)) return "defensive";
  if (/\*?(nervous|shak|sweat|trembl)/i.test(lower)) return "nervous";
  if (/\*?(angry|shout|yell|damn)/i.test(lower)) return "hostile";
  if (/\*?(cry|tear|upset)/i.test(lower)) return "distressed";
  if (evidencePresented && baseStress > 6) return "cornered";
  if (baseStress > 7) return "anxious";
  return "calm";
}

export async function categorizeNotebookNote(content: string): Promise<string> {
  const categories = ["fact", "question", "contradiction", "motive", "unverified", "missing"] as const;

  try {
    const result = await groqChat({
      messages: [
        {
          role: "system",
          content: `Classify detective notes into exactly one category: ${categories.join(", ")}. Reply with only the category word.`,
        },
        { role: "user", content },
      ],
      temperature: 0.1,
      maxTokens: 20,
    });

    const normalized = result.toLowerCase().trim();
    if (categories.includes(normalized as (typeof categories)[number])) {
      return normalized;
    }
  } catch {
    // fallback below
  }

  if (content.includes("?")) return "question";
  if (/contradict|conflict|doesn't match|inconsistent/i.test(content)) return "contradiction";
  if (/motive|why would|reason/i.test(content)) return "motive";
  if (/need|missing|find|locate/i.test(content)) return "missing";
  if (/maybe|possibly|might|unclear/i.test(content)) return "unverified";
  return "fact";
}

export async function suggestBoardConnections(
  evidenceTitles: string[],
  peopleNames: string[]
): Promise<Array<{ from: string; to: string; label: string }>> {
  if (evidenceTitles.length === 0 || peopleNames.length === 0) return [];

  try {
    const result = await groqChat({
      messages: [
        {
          role: "system",
          content: `You suggest POSSIBLE investigative connections for a detective board. Never confirm guilt. Return JSON array max 3 items: [{"from":"...","to":"...","label":"possible link"}]. Only use provided names.`,
        },
        {
          role: "user",
          content: `Evidence: ${evidenceTitles.join(", ")}\nPeople: ${peopleNames.join(", ")}`,
        },
      ],
      temperature: 0.4,
      maxTokens: 300,
    });

    const match = result.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]) as Array<{ from: string; to: string; label: string }>;
      return parsed.slice(0, 3);
    }
  } catch {
    // no suggestions
  }

  return [];
}
