import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // MVP: 데모 데이터. 실제 구현에서는 (1) ADMIN 인증 (2) 이벤트/로그 테이블에서 최신 N개 조회.
  const now = Date.now();
  const items = [
    {
      id: "ntf_001",
      level: "warning",
      title: "웹훅 지연 증가",
      message: "최근 15분 평균 지연시간이 2.3s로 상승했습니다.",
      createdAt: new Date(now - 6 * 60 * 1000).toISOString(),
    },
    {
      id: "ntf_002",
      level: "info",
      title: "신규 신고 접수",
      message: "저작권 의심 신고가 3건 접수되었습니다.",
      createdAt: new Date(now - 22 * 60 * 1000).toISOString(),
    },
    {
      id: "ntf_003",
      level: "critical",
      title: "결제 승인 실패 급증",
      message: "결제 성공률이 95% 미만으로 하락했습니다. PG 상태를 확인하세요.",
      createdAt: new Date(now - 48 * 60 * 1000).toISOString(),
    },
  ] as const;

  return NextResponse.json(
    { items },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
