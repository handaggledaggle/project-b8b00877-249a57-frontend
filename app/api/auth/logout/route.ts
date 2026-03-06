import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // MVP: 세션/토큰 시스템이 아직 없으므로 OK만 반환합니다.
  // 실제 구현에서는 HttpOnly 쿠키 삭제 또는 서버 세션 무효화를 수행하세요.
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
