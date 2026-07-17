import { case01MeridianLedger } from "./case-01-meridian-ledger";
import { case02BloodTide } from "./case-02-blood-tide";
import { case03LilacRoom } from "./case-03-lilac-room";
import { case04AshAndEmbers } from "./case-04-ash-embers";
import { case05LastBroadcast } from "./case-05-last-broadcast";
import type { InvestigationCase } from "@/types/case";

/** All cases are self-contained. Add new cases here to extend the game. */
export const ALL_CASES: InvestigationCase[] = [
  case01MeridianLedger,
  case02BloodTide,
  case03LilacRoom,
  case04AshAndEmbers,
  case05LastBroadcast,
];

export function getAllCases(): InvestigationCase[] {
  return [...ALL_CASES].sort((a, b) => a.meta.order - b.meta.order);
}

export function getCaseById(id: string): InvestigationCase | undefined {
  return ALL_CASES.find((c) => c.meta.id === id);
}

export function getCaseListSummary() {
  return getAllCases().map((c) => ({
    id: c.meta.id,
    title: c.meta.title,
    crimeType: c.meta.crimeType,
    difficulty: c.meta.difficulty,
    synopsis: c.meta.synopsis,
    inspiredBy: c.meta.inspiredBy,
    estimatedMinutes: c.meta.estimatedMinutes,
    coverImage: c.meta.coverImage,
    order: c.meta.order,
    severity: c.meta.severity,
    location: c.meta.location,
    date: c.meta.date,
  }));
}
