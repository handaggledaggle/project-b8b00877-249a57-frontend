import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  // 데모용 간단 검증
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email, message are required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const inquiry_id = `INQ-${Date.now()}`;

  // 실제 구현에서는 DB 저장 + 운영자 알림(콘솔/이메일/슬랙 등) 연결
  return NextResponse.json(
    {
      inquiry_id,
      created_at: new Date().toISOString(),
      status: "received",
      echo: {
        name,
        email,
        subject: subject || "(no subject)",
        orderId: orderId || null,
      },
    },
    { status: 201 }
  );
}
