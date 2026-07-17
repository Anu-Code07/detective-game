import type { CaseMeta, EvidenceItem } from "@/types/case";

/** Maps every evidence item to a display image — uses exhibit photo, linked scene, or case cover */
const EVIDENCE_IMAGE_MAP: Record<string, Record<string, string>> = {
  "case-01-meridian-ledger": {
    "ev-fir": "/images/case-01-meridian-ledger.png",
    "ev-briefcase": "/images/evidence-01-briefcase.png",
    "ev-ledger": "/images/evidence-01-briefcase.png",
    "ev-badge": "/images/case-01-meridian-ledger.png",
    "ev-cctv": "/images/case-01-meridian-ledger.png",
    "ev-tireiron": "/images/evidence-01-tireiron.png",
    "ev-bank": "/images/evidence-01-briefcase.png",
    "ev-call": "/images/case-01-meridian-ledger.png",
  },
  "case-02-blood-tide": {
    "ev2-fir": "/images/case-02-blood-tide.png",
    "ev2-container": "/images/evidence-02-container.png",
    "ev2-notebook": "/images/evidence-02-container.png",
    "ev2-tide": "/images/case-02-blood-tide.png",
    "ev2-alibi": "/images/case-02-blood-tide.png",
    "ev2-seal": "/images/evidence-02-container.png",
    "ev2-cutter": "/images/evidence-02-container.png",
    "ev2-manifest": "/images/case-02-blood-tide.png",
    "ev2-rope": "/images/evidence-02-container.png",
    "ev2-text": "/images/case-02-blood-tide.png",
  },
  "case-03-lilac-room": {
    "ev3-fir": "/images/case-03-lilac-room.png",
    "ev3-glass": "/images/evidence-03-wineglass.png",
    "ev3-toxicology": "/images/evidence-03-wineglass.png",
    "ev3-decanter": "/images/evidence-03-wineglass.png",
    "ev3-fingerprint": "/images/evidence-03-wineglass.png",
    "ev3-medbox": "/images/case-03-lilac-room.png",
    "ev3-will": "/images/case-03-lilac-room.png",
    "ev3-insurance": "/images/case-03-lilac-room.png",
    "ev3-debt": "/images/case-03-lilac-room.png",
    "ev3-cctv": "/images/case-03-lilac-room.png",
  },
  "case-04-ash-embers": {
    "ev4-fir": "/images/case-04-ash-embers.png",
    "ev4-office": "/images/evidence-04-accelerant.png",
    "ev4-accelerant": "/images/evidence-04-accelerant.png",
    "ev4-autopsy": "/images/evidence-04-accelerant.png",
    "ev4-insurance": "/images/case-04-ash-embers.png",
    "ev4-receipt": "/images/case-04-ash-embers.png",
    "ev4-camera": "/images/evidence-04-accelerant.png",
    "ev4-deposit": "/images/case-04-ash-embers.png",
    "ev4-email": "/images/case-04-ash-embers.png",
    "ev4-monitor": "/images/case-04-ash-embers.png",
  },
  "case-05-last-broadcast": {
    "ev5-fir": "/images/case-05-last-broadcast.png",
    "ev5-scene": "/images/evidence-05-studio.png",
    "ev5-shell": "/images/evidence-05-studio.png",
    "ev5-ballistics": "/images/evidence-05-studio.png",
    "ev5-audio": "/images/evidence-05-studio.png",
    "ev5-keycard": "/images/case-05-last-broadcast.png",
    "ev5-alibi": "/images/case-05-last-broadcast.png",
    "ev5-payment": "/images/case-05-last-broadcast.png",
    "ev5-text": "/images/case-05-last-broadcast.png",
    "ev5-exit": "/images/evidence-05-studio.png",
    "ev5-threat": "/images/case-05-last-broadcast.png",
  },
};

export function getEvidenceImage(item: EvidenceItem, caseMeta: CaseMeta): string {
  if (item.image) return item.image;
  return EVIDENCE_IMAGE_MAP[caseMeta.id]?.[item.id] ?? caseMeta.coverImage;
}
