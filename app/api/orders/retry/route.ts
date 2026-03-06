import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  // 실제 구현에서는 Toss 결제 세션 재생성 후 결제창 URL을 반환
  const paymentUrl = `/payment-status?orderId=${encodeURIComponent(orderId)}`;

  return NextResponse.json(
    {
      orderId,
      status: "pending",
      paymentUrl,
    },
    { status: 200 }
  );
}
