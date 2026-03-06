import { NextResponse } from "next/server";

function svgDataUrl(width: number, height: number, label: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E5E7EB" />
        <stop offset="1" stop-color="#D1D5DB" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="14" fill="#6D28D9">${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  const { artworkId } = await params;

  // MVP: DB 연동 전, 화면 구성을 위한 mock 데이터
  return NextResponse.json({
    id: artworkId || "PT-20260218-001",
    title: "밤의 도시 풍경",
    artistName: "김아티스트",
    createdAt: "2026-02-18",
    priceKrw: 45000,
    vatNote: "(+ VAT별도)",
    purchaseSummary: "상업적 사용(기본) — 단일 프로젝트 사용권. 확장 라이선스는 별도 문의.",
    description:
      "고해상도 디지털 일러스트레이션. 사이즈: 4000×3000px(300dpi). 파일 형식: PNG, 원본 PSD 포함.",
    categoryLabel: "일러스트 / 도시풍경",
    licenseLabel: "개인/상업(간단 라이선스), 확장 라이선스 별도 문의",
    deliveryLabel: "결제 후 즉시 다운로드 링크 제공(웹훅 기반 전달 보장)",
    previewImages: [
      { alt: "gallery image 1", src: svgDataUrl(480, 192, "gallery image 1") },
      { alt: "gallery image 2", src: svgDataUrl(480, 192, "gallery image 2") },
      { alt: "gallery image 3", src: svgDataUrl(480, 192, "gallery image 3") }
    ],
    related: [
      {
        id: "rel-1",
        title: "도시의 새벽",
        artistName: "이아티스트",
        priceKrw: 25000,
        thumb: svgDataUrl(800, 400, "thumb")
      },
      {
        id: "rel-2",
        title: "네온 네거리",
        artistName: "박아티스트",
        priceKrw: 30000,
        thumb: svgDataUrl(800, 400, "thumb")
      },
      {
        id: "rel-3",
        title: "정상의 야경",
        artistName: "홍아티스트",
        priceKrw: 55000,
        thumb: svgDataUrl(800, 400, "thumb")
      },
      {
        id: "rel-4",
        title: "차가운 가로등",
        artistName: "오아티스트",
        priceKrw: 18000,
        thumb: svgDataUrl(1200, 220, "thumb")
      }
    ]
  });
}
