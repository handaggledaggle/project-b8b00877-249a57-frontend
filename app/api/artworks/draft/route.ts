import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DraftPayload = {
  title: string;
  description: string;
  tags: string[];
  category: string;
  saleType: string;
  priceKRW: number | null;
  thumbnailUrl: string | null;
  originalUrl: string | null;
  license: { personal: boolean; commercial: boolean };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { draftId?: string | null; data?: DraftPayload };

    const draftId = body.draftId ?? crypto.randomUUID();
    const data = body.data;

    if (!data) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Minimal validation (MVP stub)
    if (typeof data.title !== "string" || typeof data.description !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json(
      {
        draftId,
        savedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
