import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as null | { artwork_id?: string };
  const artworkId = body?.artwork_id ?? "PT-20260218-001";

  // MVP: Toss Payments 연동 전, 결제 세션 생성 모의
  const orderId = `ORD-${crypto.randomUUID()}`;

  return NextResponse.json(
    {
      order_id: orderId,
      status: "pending",
      payment_url: `https://pay.example.com/checkout?orderId=${encodeURIComponent(orderId)}&artworkId=${encodeURIComponent(artworkId)}`
    },
    { status: 201 }
  );
}
