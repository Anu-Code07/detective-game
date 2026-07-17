import { NextRequest, NextResponse } from "next/server";
import { categorizeNotebookNote } from "@/lib/ai/interrogation";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Empty note" }, { status: 400 });
    }
    const category = await categorizeNotebookNote(content.trim());
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ category: "fact" });
  }
}
