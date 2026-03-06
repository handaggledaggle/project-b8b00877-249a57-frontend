import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PaymentStatus = "pending" | "paid" | "failed" | "delayed";

function pickStatus(): PaymentStatus {
  // 데모용: 호출될 때마다 확률적으로 상태가 바뀌는 것처럼 보이게 함
  const r = Math.random();
  if (r < 0.62) return "pending";
  if (r < 0.76) return "delayed";
  if (r < 0.9) return "paid";
  return "failed";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json(
      { error: "orderId query param is required" },
      { status: 400 }
    );
  }

  const status = pickStatus();
  const now = new Date();

  const res = {
    orderId,
    orderNumber: orderId,
    amountKRW: 18000,
    paymentMethodLabel: "신용카드 (VISA)",
    attemptedAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
    status,
    statusReason:
      status === "failed"
        ? "카드 승인 거절(한도/3DS 인증/네트워크)을 확인해 주세요."
        : status === "delayed"
          ? "결제사 응답 지연"
          : undefined,
    buyer: {
      name: "김아티스트",
      email: "buyer@example.com",
    },
    downloadUrl:
      status === "paid"
        ? `/api/downloads/mock?orderId=${encodeURIComponent(orderId)}`
        : undefined,
  };

  return NextResponse.json(res, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
