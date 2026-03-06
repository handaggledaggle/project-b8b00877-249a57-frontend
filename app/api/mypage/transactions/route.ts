import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "buy") as "buy" | "sell";

  if (type !== "buy" && type !== "sell") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const all = [
    {
      id: "ord_1001",
      type: "buy" as const,
      artworkTitle: "달의 정원",
      amountKrw: 5900,
      status: "paid" as const,
      createdAt: "2026-03-01T10:10:00.000Z",
    },
    {
      id: "ord_1002",
      type: "buy" as const,
      artworkTitle: "도심 스케치",
      amountKrw: 7900,
      status: "refunded" as const,
      createdAt: "2026-02-18T14:25:00.000Z",
    },
    {
      id: "ord_2001",
      type: "sell" as const,
      artworkTitle: "달의 정원",
      amountKrw: 5900,
      status: "paid" as const,
      createdAt: "2026-03-02T07:40:00.000Z",
    },
  ];

  const items = all.filter((x) => x.type === type);
  return NextResponse.json({ total: items.length, items });
}
