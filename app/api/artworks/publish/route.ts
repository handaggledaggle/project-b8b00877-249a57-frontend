import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PublishPayload = {
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
    const body = (await req.json()) as { draftId?: string | null; data?: PublishPayload };
    const data = body.data;

    if (!data) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Minimal checks to match UI expectations (server-side source of truth in real impl)
    if (!data.title?.trim() || !data.description?.trim()) {
      return NextResponse.json({ error: "Title/description required" }, { status: 400 });
    }
    if (!data.thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail required" }, { status: 400 });
    }
    if (!data.originalUrl) {
      return NextResponse.json({ error: "Original file required" }, { status: 400 });
    }
    if (!(data.license?.personal || data.license?.commercial)) {
      return NextResponse.json({ error: "License required" }, { status: 400 });
    }

    // In MVP stub, we just return a generated artworkId.
    return NextResponse.json(
      {
        artworkId: crypto.randomUUID(),
        status: "published",
        publishedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
