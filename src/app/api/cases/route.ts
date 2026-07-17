import { getCaseListSummary } from "@/lib/cases";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ cases: getCaseListSummary() });
}
