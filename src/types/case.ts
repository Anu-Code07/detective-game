export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type EvidenceType =
  | "physical"
  | "digital"
  | "document"
  | "forensic"
  | "testimony"
  | "media"
  | "financial";
export type PersonRole = "suspect" | "witness" | "victim" | "officer" | "expert";
export type DocumentType =
  | "fir"
  | "crime_scene_report"
  | "witness_statement"
  | "interrogation_transcript"
  | "medical_report"
  | "autopsy"
  | "lab_report"
  | "property_seizure"
  | "evidence_label"
  | "chain_of_custody"
  | "chargesheet"
  | "court_submission"
  | "police_diary"
  | "search_warrant"
  | "arrest_warrant"
  | "investigation_notes"
  | "phone_records"
  | "bank_transactions"
  | "cctv_log"
  | "weather_report"
  | "emergency_call"
  | "email"
  | "chat_history"
  | "receipt"
  | "map"
  | "blueprint"
  | "audio";

export type DashboardTab =
  | "overview"
  | "board"
  | "evidence"
  | "timeline"
  | "suspects"
  | "witnesses"
  | "documents"
  | "interrogate"
  | "notebook"
  | "map"
  | "chargesheet"
  | "verdict";

export interface CaseMeta {
  id: string;
  title: string;
  crimeType: string;
  severity: "low" | "medium" | "high" | "critical";
  date: string;
  time: string;
  location: string;
  difficulty: Difficulty;
  synopsis: string;
  briefing: string;
  order: number;
  /** Real-world inspiration note shown to player — fictionalized case */
  inspiredBy: string;
  estimatedMinutes: number;
  coverImage: string;
}

export interface VictimProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  background: string;
  lastSeen: string;
  causeOfDeath: string;
  injuries: string[];
}

export interface PersonProfile {
  id: string;
  name: string;
  age: number;
  role: PersonRole;
  occupation: string;
  personality: string;
  stressLevel: number;
  intelligence: number;
  secrets: string[];
  fear: string;
  relationships: Record<string, string>;
  financialSituation: string;
  dailyRoutine: string;
  motive: string;
  alibi: string;
  truthfulness: number;
  behavior: string;
  speechStyle: string;
  knowledge: string[];
  memory: Record<string, string>;
  isGuilty?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  locationFound: string;
  discoveredByDefault: boolean;
  hidden: boolean;
  unlockCondition?: string;
  relatedPeople: string[];
  relatedEvidence: string[];
  significance: "critical" | "important" | "supporting" | "red_herring";
  tags: string[];
  documentId?: string;
  image?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  known: boolean;
  people: string[];
  evidence: string[];
  conflictWith?: string[];
}

export interface CaseDocument {
  id: string;
  type: DocumentType;
  title: string;
  referenceNumber: string;
  date: string;
  author: string;
  content: string;
  classified: boolean;
  unlockCondition?: string;
  image?: string;
}

export interface LocationNode {
  id: string;
  name: string;
  address: string;
  description: string;
  searchable: boolean;
  unlocked: boolean;
  evidenceIds: string[];
  coordinates: { x: number; y: number };
}

export interface CaseSolution {
  guiltyPartyId: string;
  method: string;
  motive: string;
  opportunity: string;
  requiredEvidence: string[];
  criticalContradictions: string[];
  timelineKey: string[];
  charges: string[];
}

export interface InvestigationCase {
  meta: CaseMeta;
  victim: VictimProfile;
  suspects: PersonProfile[];
  witnesses: PersonProfile[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  locations: LocationNode[];
  policeNotes: string;
  redHerrings: string[];
  hiddenClues: string[];
  evidenceRelationships: Array<{
    from: string;
    to: string;
    label: string;
    suggested?: boolean;
  }>;
  solution: CaseSolution;
}

export interface NotebookEntry {
  id: string;
  content: string;
  category: "fact" | "question" | "contradiction" | "motive" | "unverified" | "missing";
  createdAt: string;
  linkedEvidence?: string[];
  linkedPeople?: string[];
}

export interface BoardConnection {
  id: string;
  source: string;
  target: string;
  label: string;
  createdAt: string;
}

export interface InterrogationMessage {
  id: string;
  role: "player" | "suspect";
  content: string;
  timestamp: string;
  presentedEvidence?: string;
  emotionalState?: string;
}

export interface InvestigationState {
  caseId: string;
  startedAt: string;
  discoveredEvidence: string[];
  unlockedDocuments: string[];
  unlockedLocations: string[];
  discoveredTimeline: string[];
  notebook: NotebookEntry[];
  boardConnections: BoardConnection[];
  interrogations: Record<string, InterrogationMessage[]>;
  questionsAsked: number;
  wrongAccusations: number;
  contradictionsFound: string[];
  warrantsRequested: string[];
  searchesCompleted: string[];
  solvedLeads: string[];
  theoryNotes: string;
  chargesheetSubmitted: boolean;
  completed: boolean;
  finalAccusation?: {
    accusedId: string;
    charges: string[];
    evidence: string[];
    motive?: string;
    opportunity?: string;
    method?: string;
    summary?: string;
    submittedAt: string;
    isQuickGuess?: boolean;
  };
  verdict?: VerdictResult;
}

export type VerdictTier =
  | "master_detective"
  | "solid_case"
  | "lucky_guess"
  | "failed_prosecution"
  | "wrong_accusation";

export interface VerdictResult {
  success: boolean;
  score: number;
  tier: VerdictTier;
  tierLabel: string;
  tierMessage: string;
  grades: {
    logic: number;
    evidenceQuality: number;
    efficiency: number;
    accuracy: number;
    courtSuccess: number;
  };
  categoryScores: {
    evidence: number;
    interrogation: number;
    theory: number;
  };
  feedback: string[];
  rejectedEvidence: string[];
  defenseChallenges: string[];
  recapStory?: string[];
  theoryChanged?: boolean;
}

export interface PlayerProgress {
  completedCases: string[];
  caseScores: Record<string, number>;
  investigations: Record<string, InvestigationState>;
  tutorialDismissed?: boolean;
  theorySuspects?: Record<string, string>;
  hintsUsed?: Record<string, number>;
  detectivePride?: number;
}
