import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // MVP: 데모 데이터. 실제 구현에서는 ADMIN 인증/인가 후 DB 집계 결과를 반환하세요.
  const body = {
    operator: { name: "이지은" },
    nav: [
      { key: "dashboard", label: "대시보드", href: "/admin/console" },
      { key: "artworks", label: "작품", href: "/admin/console" },
      { key: "users", label: "사용자", href: "/admin/console" },
      { key: "orders", label: "주문", href: "/admin/console" },
      { key: "logs", label: "로그", href: "/admin/console" },
    ],
    hero: {
      title: "운영자 콘솔",
      subtitle:
        "작품·사용자·주문을 모니터링하고 신고·제재, 결제 및 웹훅 로그를 조회합니다. (권한 필요)",
    },
    cards: {
      primaryAreas: {
        title: "운영 주요 영역",
        items: [
          {
            title: "작품 관리",
            description:
              "신규 등록, 노출 상태, 신고된 작품 목록과 제재 이력 확인",
            icon: "artworks",
            actions: [
              { label: "신고 처리", href: "/admin/console" },
              { label: "등록 현황", href: "/admin/console" },
            ],
          },
          {
            title: "사용자 관리",
            description:
              "아티스트/구매자 계정 상태, 제재 로그, 재등록 요청 검토",
            icon: "users",
            actions: [
              { label: "계정 제재", href: "/admin/console" },
              { label: "활동 로그", href: "/admin/console" },
            ],
          },
          {
            title: "주문 & 결제",
            description:
              "결제 상태, 환불 처리, 결제 웹훅 처리 로그와 실패 원인 분석",
            icon: "payments",
            actions: [
              { label: "결제 로그", href: "/admin/console" },
              { label: "환불 관리", href: "/admin/console" },
            ],
          },
        ],
      },
      stats: [
        {
          title: "성장 / 공급",
          metrics: [
            { label: "주간 신규 아티스트 가입 수", value: "42" },
            { label: "주간 등록 작품 수", value: "128" },
            { label: "작품 등록 완료율", value: "73%" },
          ],
        },
        {
          title: "전환 / 매출",
          metrics: [
            { label: "구매 전환율", value: "4.2%" },
            { label: "GMV(주간)", value: "₩12.4M" },
            { label: "주문당 평균 결제금액(AOV)", value: "₩29,500" },
          ],
        },
        {
          title: "운영 / 품질",
          metrics: [
            { label: "웹훅 처리 성공률", value: "99.2%" },
            { label: "웹훅 평균 지연시간", value: "1.8s" },
            { label: "다운로드 실패율", value: "2.1%" },
          ],
        },
      ],
      workflow: {
        title: "운영 워크플로우",
        steps: [
          {
            step: 1,
            title: "신고 접수",
            description: "사용자 신고 접수 → 분류(저작권/품질/기타)",
          },
          {
            step: 2,
            title: "조사·검토",
            description: "작품/계정 로그 확인 및 증빙 자료 요청",
          },
          {
            step: 3,
            title: "조치 실행",
            description: "경고·임시 비노출·계정 제재 중 선택 실행",
          },
          {
            step: 4,
            title: "피드백·모니터링",
            description: "처리 결과 통보 및 재발 여부 모니터링",
          },
        ],
      },
      comparison: {
        title: "지표 비교 (주간 vs 전주)",
        rows: [
          {
            metric: "주간 신규 아티스트",
            thisWeek: "42",
            lastWeek: "35",
            delta: "+20%",
          },
          {
            metric: "GMV(주간)",
            thisWeek: "₩12.4M",
            lastWeek: "₩10.8M",
            delta: "+14.8%",
          },
          {
            metric: "결제 성공률",
            thisWeek: "95.6%",
            lastWeek: "96.1%",
            delta: "-0.5pp",
          },
          {
            metric: "웹훅 처리 성공률",
            thisWeek: "99.2%",
            lastWeek: "98.9%",
            delta: "+0.3pp",
          },
        ],
      },
    },
  };

  return NextResponse.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
