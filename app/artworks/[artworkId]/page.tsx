import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import ArtworkActions from "./_components/artwork-actions";
import PurchaseCard from "./_components/purchase-card";
import RelatedArtworkCard from "./_components/related-artwork-card";

type ArtworkDetail = {
  id: string;
  title: string;
  artistName: string;
  createdAt: string;
  priceKrw: number;
  vatNote: string;
  purchaseSummary: string;
  description: string;
  categoryLabel: string;
  licenseLabel: string;
  deliveryLabel: string;
  previewImages: { alt: string; src: string }[];
  related: { id: string; title: string; artistName: string; priceKrw: number; thumb: string }[];
};

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

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "";
  return `${proto}://${host}`;
}

async function getArtwork(artworkId: string): Promise<ArtworkDetail> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/artworks/${encodeURIComponent(artworkId)}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    // Fallback to deterministic mock to keep page rendering in dev.
    return {
      id: artworkId,
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
    };
  }

  return (await res.json()) as ArtworkDetail;
}

export default async function ArtworkDetailPage({
  params
}: {
  params: Promise<{ artworkId: string }>;
}) {
  const { artworkId } = await params;
  const artwork = await getArtwork(artworkId);

  return (
    <div className="mx-auto flex w-[1440px] flex-col">
      <nav
        className="flex h-16 items-center justify-between border-b border-[#DDD6FE] bg-white px-8 shadow-sm"
        data-section-type="navbar"
      >
        <span className="text-xl font-bold text-[#4C1D95]">printtie</span>

        <div className="flex gap-6">
          <Link className="text-[#6D28D9]" href="#">
            작품 탐색
          </Link>
          <Link className="text-[#6D28D9]" href="#">
            작품 등록
          </Link>
          <Link className="text-[#6D28D9]" href="#">
            마이페이지
          </Link>
          <Link className="text-[#6D28D9]" href="#">
            정책/문의
          </Link>
          <Link className="text-[#6D28D9]" href="#">
            관리자 콘솔
          </Link>
        </div>

        <Button className="rounded-lg bg-gray-100 px-4 py-2 text-[#6D28D9] hover:bg-gray-200">
          Sign Up
        </Button>
      </nav>

      <main className="flex flex-col gap-12 bg-gray-50 px-8 py-10">
        <section data-section-type="gallery" className="flex gap-8 bg-[#FFFFFF]">
          <div className="flex w-2/3 flex-col gap-4">
            <Card
              className="w-full rounded-lg border border-[#DDD6FE] bg-white p-6 shadow-lg"
              data-component="card"
            >
              <CardContent className="p-0">
                <div
                  className="flex h-[520px] w-full items-center justify-center rounded-lg bg-gray-200 text-[#6D28D9]"
                  data-query="main preview"
                >
                  작품 미리보기 (이미지 / 영상 / 3D) — 예시 썸네일
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-[#4C1D95]">
                      제목: {artwork.title}
                    </h1>
                    <p className="text-[#6D28D9]">
                      작가: {artwork.artistName} • 등록일: {artwork.createdAt} • ID: {artwork.id}
                    </p>
                  </div>

                  <ArtworkActions />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              {artwork.previewImages.slice(0, 3).map((img) => (
                <div key={img.alt} className="relative h-32 w-1/3 overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    alt={img.alt}
                    src={img.src}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1440px) 300px, 33vw"
                    priority={false}
                  />
                </div>
              ))}
            </div>

            <section
              data-section-type="features"
              className="flex flex-col gap-4 rounded-lg border border-[#DDD6FE] bg-white p-6 shadow-lg"
              aria-label="작품 정보"
            >
              <h2 className="text-2xl font-bold text-[#4C1D95]">작품 설명 및 세부 정보</h2>
              <p className="text-[#4C1D95]">{artwork.description}</p>

              <div className="flex gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#6D28D9]">카테고리</span>
                  <span className="text-[#4C1D95]">{artwork.categoryLabel}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#6D28D9]">사용 가능 라이선스</span>
                  <span className="text-[#4C1D95]">{artwork.licenseLabel}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-[#6D28D9]">파일 전달</span>
                  <span className="text-[#4C1D95]">{artwork.deliveryLabel}</span>
                </div>
              </div>
            </section>

            <section data-section-type="faq" className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-[#4C1D95]">자주 묻는 질문</h2>
              <div className="flex max-w-3xl flex-col gap-3">
                <Card className="rounded-lg border border-[#DDD6FE] bg-white shadow-lg" data-component="card">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <h3 className="text-lg font-semibold text-[#4C1D95]">
                      구매 후 파일을 바로 받을 수 있나요?
                    </h3>
                    <p className="text-[#6D28D9]">
                      네. 결제 승인 시 등록된 이메일과 계정의 다운로드 페이지에 즉시 링크가 생성됩니다.
                      결제 웹훅 실패 시 안내 이메일을 별도로 발송합니다.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-lg border border-[#DDD6FE] bg-white shadow-lg" data-component="card">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <h3 className="text-lg font-semibold text-[#4C1D95]">라이선스는 어떻게 확인하나요?</h3>
                    <p className="text-[#6D28D9]">
                      작품 상세의 ‘사용 가능 라이선스’에서 기본 제공 항목을 확인할 수 있으며, 상업적 확장
                      사용은 작가에게 별도 문의로 처리됩니다.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-lg border border-[#DDD6FE] bg-white shadow-lg" data-component="card">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <h3 className="text-lg font-semibold text-[#4C1D95]">환불 정책은 어떻게 되나요?</h3>
                    <p className="text-[#6D28D9]">
                      디지털 파일 특성상 다운로드 완료 후 환불은 제한됩니다. 기술적 문제(다운로드 실패 등)는
                      고객지원에서 검토 후 처리합니다.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          <aside className="flex w-1/3 flex-col gap-6">
            <PurchaseCard artworkId={artwork.id} priceKrw={artwork.priceKrw} vatNote={artwork.vatNote} summary={artwork.purchaseSummary} />

            <Card
              className={cn(
                "rounded-lg border border-[#DDD6FE] bg-white p-6 shadow-lg"
              )}
              data-component="card"
              data-section-type="features"
            >
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-[#4C1D95]">작가 정보</h3>
                <p className="mt-2 text-[#4C1D95]">
                  김아티스트 — 디지털 일러스트레이터. 활동 분야: 게임 아트, 커머셜 일러스트.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" className="rounded-lg px-3 py-2 text-[#4C1D95] hover:bg-gray-100">
                    작가 페이지
                  </Button>
                  <Button variant="ghost" className="rounded-lg px-3 py-2 text-[#4C1D95] hover:bg-gray-100">
                    다른 작품 보기
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "rounded-lg border border-[#DDD6FE] bg-white p-6 shadow-lg"
              )}
              data-component="card"
              data-section-type="features"
            >
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-[#4C1D95]">보증 & 지원</h3>
                <p className="mt-2 text-sm text-[#6D28D9]">
                  다운로드 실패 또는 결제 문제 발생 시 고객지원이 우선 처리합니다. 평균 CS 응답 시간: 24시간
                  이내.
                </p>
              </CardContent>
            </Card>
          </aside>
        </section>

        <section
          data-section-type="card-grid"
          className="flex flex-col rounded-lg border border-[#DDD6FE] bg-[#FAF5FF] p-6"
        >
          <h2 className="text-2xl font-bold text-[#4C1D95]">관련 작품 추천</h2>

          <div className="mt-4 flex gap-6">
            {artwork.related.slice(0, 3).map((it) => (
              <RelatedArtworkCard
                key={it.id}
                title={it.title}
                artistName={it.artistName}
                priceKrw={it.priceKrw}
                thumbSrc={it.thumb}
                className="w-1/3"
              />
            ))}
          </div>

          <div className="mt-6">
            {artwork.related[3] ? (
              <RelatedArtworkCard
                title={artwork.related[3].title}
                artistName={artwork.related[3].artistName}
                priceKrw={artwork.related[3].priceKrw}
                thumbSrc={artwork.related[3].thumb}
                className="w-full"
                wide
              />
            ) : null}
          </div>
        </section>
      </main>

      <footer data-section-type="footer" className="flex justify-between bg-[#FFFFFF] px-8 py-12">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-gray-900">printtie</span>
          <p className="text-sm text-[#6D28D9]">© 2026 printtie. All rights reserved.</p>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700">Company</p>
            <p className="text-sm text-[#6D28D9]">About</p>
            <p className="text-sm text-[#6D28D9]">Careers</p>
            <p className="text-sm text-[#6D28D9]">Contact</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700">지원</p>
            <p className="text-sm text-[#6D28D9]">이용약관</p>
            <p className="text-sm text-[#6D28D9]">개인정보처리방침</p>
            <p className="text-sm text-[#6D28D9]">환불정책</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700">작가용</p>
            <p className="text-sm text-[#6D28D9]">작품 등록 가이드</p>
            <p className="text-sm text-[#6D28D9]">정산 안내</p>
            <p className="text-sm text-[#6D28D9]">운영정책</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700">구매자</p>
            <p className="text-sm text-[#6D28D9]">구매 가이드</p>
            <p className="text-sm text-[#6D28D9]">다운로드 정책</p>
            <p className="text-sm text-[#6D28D9]">문의하기</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
