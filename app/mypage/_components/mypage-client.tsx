"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import {
  CalendarRange,
  Filter,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  EyeOff,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RangeKey = "7d" | "30d";

type KpisResponse = {
  range: RangeKey;
  growth_supply: {
    weekly_new_artists: number;
    weekly_new_artworks: number;
    artwork_publish_completion_rate: number; // 0~1
  };
  conversion_revenue: {
    purchase_conversion_rate: number; // 0~1
    gmv_krw: number;
  };
  ops_quality: {
    payment_webhook_success_rate: number; // 0~1
    refund_rate: number; // 0~1
    download_failure_rate: number; // 0~1
  };
  retention: {
    buyer_30d_repeat_rate: number; // 0~1
    artist_30d_reregister_rate: number; // 0~1
  };
};

type ArtworkStatus = "active" | "hidden";

type Artwork = {
  id: string;
  title: string;
  salesCount: number;
  downloadCount: number;
  status: ArtworkStatus;
  thumbnailDataUrl: string;
};

type ArtworksResponse = {
  items: Artwork[];
};

type TransactionsResponse = {
  total: number;
  items: Array<{
    id: string;
    type: "buy" | "sell";
    artworkTitle: string;
    amountKrw: number;
    status: "paid" | "pending" | "failed" | "refunded";
    createdAt: string;
  }>;
};

function formatPercent01(v: number) {
  const pct = Math.round(v * 1000) / 10;
  return `${pct}%`;
}

function formatKrwCompact(amount: number) {
  // very small, locale-safe formatter (no Intl compact for older env constraints)
  if (amount >= 1_000_000_000) return `₩${Math.round(amount / 100_000_000) / 10}B`;
  if (amount >= 1_000_000) return `₩${Math.round(amount / 100_000) / 10}M`;
  if (amount >= 1_000) return `₩${Math.round(amount / 100) / 10}K`;
  return `₩${amount}`;
}

function Navbar() {
  return (
    <nav className="h-16 bg-white border-b border-[#DDD6FE] shadow-sm flex items-center justify-between px-6 lg:px-8">
      <Link href="/" className="text-xl font-bold text-[#4C1D95]">
        printtie
      </Link>
      <div className="hidden lg:flex gap-6 text-sm">
        <Link className="text-[#6D28D9] hover:underline" href="/artworks">
          작품 탐색
        </Link>
        <Link className="text-[#6D28D9] hover:underline" href="/artworks/new">
          작품 등록
        </Link>
        <Link className="text-[#6D28D9] hover:underline" href="/mypage">
          마이페이지
        </Link>
        <Link className="text-[#6D28D9] hover:underline" href="/support">
          정책/문의
        </Link>
        <Link className="text-[#6D28D9] hover:underline" href="/admin">
          관리자 콘솔
        </Link>
      </div>
      <Button variant="secondary" className="bg-gray-100 text-[#6D28D9] hover:bg-gray-200">
        Sign Up
      </Button>
    </nav>
  );
}

function Hero() {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between py-8 px-6 lg:px-8 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white">마이페이지 — 구매/판매 이력</h1>
        <p className="text-white/70 mt-2 max-w-2xl">
          구매자는 주문·다운로드 기록을 확인하고, 아티스트는 판매 통계와 작품 관리를 할 수 있습니다. KPI와 운영 지표를
          한눈에 보고 빠르게 액션을 취하세요.
        </p>
      </div>
      <div className="flex gap-3 lg:gap-4">
        <Button asChild className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white/90">
          <Link href="/mypage/orders">
            전체 주문 내역
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white/90">
          <Link href="/artworks/new">
            작품 등록
            <Plus className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function KpiCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <Card className="shadow-lg rounded-xl border border-[#DDD6FE]">
      <CardContent className="flex flex-col items-center p-6 gap-2">
        <div className="text-3xl font-bold text-[#4C1D95]">{value}</div>
        <div className="text-[#6D28D9] text-sm text-center">{label}</div>
      </CardContent>
    </Card>
  );
}

function SubKpi({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="text-2xl font-bold text-[#4C1D95]">{value}</div>
      <div className="text-[#6D28D9] text-sm">{label}</div>
    </div>
  );
}

function SectionTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-start">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-[#4C1D95]">{title}</h2>
        {subtitle ? <p className="text-[#6D28D9]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}

function ArtworkCard({
  artwork,
  onToggleVisibility,
  onDelete,
  pending,
}: {
  artwork: Artwork;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  pending?: boolean;
}) {
  return (
    <Card className="bg-white shadow-lg rounded-xl border border-[#DDD6FE] overflow-hidden w-full sm:w-[18rem]">
      <div className="relative w-full h-40 bg-gray-200">
        <Image
          src={artwork.thumbnailDataUrl}
          alt={`${artwork.title} 썸네일`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 288px"
          priority={false}
        />
      </div>
      <CardContent className="flex flex-col p-4 gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#4C1D95] leading-tight">작품명: {artwork.title}</h3>
          <Badge
            variant={artwork.status === "active" ? "secondary" : "outline"}
            className={cn(
              "shrink-0",
              artwork.status === "active"
                ? "bg-[#FAF5FF] text-[#4C1D95] border-[#DDD6FE]"
                : "text-[#6D28D9] border-[#DDD6FE]"
            )}
          >
            {artwork.status === "active" ? "노출" : "숨김"}
          </Badge>
        </div>
        <p className="text-[#6D28D9] text-sm">판매: {artwork.salesCount}회 · 다운로드: {artwork.downloadCount}회</p>

        <div className="flex gap-2 mt-3">
          <Button asChild variant="secondary" className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF]">
            <Link href={`/artworks/${artwork.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              편집
            </Link>
          </Button>

          <Button
            variant="secondary"
            className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF]"
            onClick={() => onToggleVisibility(artwork.id)}
            disabled={pending}
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : artwork.status === "active" ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {artwork.status === "active" ? "숨기기" : "노출"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF]" disabled={pending}>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>작품을 삭제할까요?</DialogTitle>
                <DialogDescription>
                  삭제하면 작품이 비활성화되어 목록에서 숨겨지고 구매가 불가능해집니다. (기존 구매자의 다운로드 권한 정책은 별도)
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">취소</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={() => onDelete(artwork.id)}>
                    삭제
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF]" disabled>
            <Megaphone className="mr-2 h-4 w-4" />
            프로모션
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="bg-white rounded-xl w-full sm:w-80 border-0 shadow-none">
      <CardHeader className="p-6 pb-2">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <CardTitle className="text-lg font-semibold text-[#4C1D95] mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <CardDescription className="text-[#6D28D9] text-sm">{desc}</CardDescription>
      </CardContent>
    </Card>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <Card className="shadow-lg rounded-lg border border-[#DDD6FE]">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-[#4C1D95]">{q}</h3>
        <p className="text-[#6D28D9] mt-2">{a}</p>
      </CardContent>
    </Card>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-10 lg:flex-row lg:justify-between py-12 px-6 lg:px-8 bg-white">
      <div className="flex flex-col gap-2">
        <span className="text-lg font-bold text-gray-900">printtie</span>
        <p className="text-[#6D28D9] text-sm">© 2026 printtie. All rights reserved.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-[#6D28D9] font-semibold">Company</p>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/about">
            About
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/careers">
            Careers
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/contact">
            Contact
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[#6D28D9] font-semibold">지원</p>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/policies/terms">
            이용약관
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/policies/privacy">
            개인정보처리방침
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/policies/refund">
            환불정책
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[#6D28D9] font-semibold">작가용</p>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/guides/upload">
            작품 등록 가이드
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/guides/settlement">
            정산 안내
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/policies/ops">
            운영정책
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[#6D28D9] font-semibold">구매자</p>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/guides/buy">
            구매 가이드
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/policies/download">
            다운로드 정책
          </Link>
          <Link className="text-[#6D28D9] text-sm hover:underline" href="/support">
            문의하기
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function MypageClient() {
  const [range, setRange] = React.useState<RangeKey>("7d");
  const [kpis, setKpis] = React.useState<KpisResponse | null>(null);
  const [artworks, setArtworks] = React.useState<Artwork[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingArtworkId, setPendingArtworkId] = React.useState<string | null>(null);

  // lightweight filters UI state (Sheet)
  const [q, setQ] = React.useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [kRes, aRes] = await Promise.all([
        fetch(`/api/mypage/kpis?range=${encodeURIComponent(range)}`, { cache: "no-store" }),
        fetch(`/api/mypage/artworks?q=${encodeURIComponent(q)}`, { cache: "no-store" }),
      ]);
      if (!kRes.ok) throw new Error("KPI를 불러오지 못했습니다.");
      if (!aRes.ok) throw new Error("작품 목록을 불러오지 못했습니다.");
      const kJson = (await kRes.json()) as KpisResponse;
      const aJson = (await aRes.json()) as ArtworksResponse;
      setKpis(kJson);
      setArtworks(aJson.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function toggleVisibility(artworkId: string) {
    if (!artworks) return;
    setPendingArtworkId(artworkId);
    setError(null);

    // optimistic
    setArtworks((prev) =>
      prev
        ? prev.map((a) => (a.id === artworkId ? { ...a, status: a.status === "active" ? "hidden" : "active" } : a))
        : prev
    );

    try {
      const res = await fetch(`/api/mypage/artworks/${encodeURIComponent(artworkId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_visibility" }),
      });
      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
    } catch (e) {
      // rollback by refetch
      setError(e instanceof Error ? e.message : "상태 변경 중 오류가 발생했습니다.");
      void load();
    } finally {
      setPendingArtworkId(null);
    }
  }

  async function deleteArtwork(artworkId: string) {
    if (!artworks) return;
    setPendingArtworkId(artworkId);
    setError(null);

    // optimistic
    setArtworks((prev) => (prev ? prev.filter((a) => a.id !== artworkId) : prev));

    try {
      const res = await fetch(`/api/mypage/artworks/${encodeURIComponent(artworkId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
      void load();
    } finally {
      setPendingArtworkId(null);
    }
  }

  const rangeLabel = range === "7d" ? "지난 7일" : "지난 30일";

  return (
    <div className="min-h-dvh w-full flex flex-col bg-white">
      <Navbar />
      <Hero />

      <section className="flex flex-col py-8 px-6 lg:px-8 bg-white shadow-lg">
        <SectionTitle
          title="핵심 지표"
          subtitle="주간/월간 성장 · 전환 · 운영 · 리텐션 지표"
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-[#4C1D95]">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    기간: {rangeLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRange("7d")}>지난 7일</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("30d")}>지난 30일</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="bg-white text-[#4C1D95]">
                    <Filter className="mr-2 h-4 w-4" />
                    필터
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>필터</SheetTitle>
                    <SheetDescription>작품 관리 영역에 적용되는 간단 필터입니다.</SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor="q">작품명 검색</Label>
                    <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예: 달의 정원" />
                    <div className="pt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          void load();
                        }}
                        className="flex-1"
                      >
                        적용
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQ("");
                          setTimeout(() => void load(), 0);
                        }}
                      >
                        초기화
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          }
        />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <KpiCard
            value={loading || !kpis ? <Loader2 className="h-7 w-7 animate-spin" /> : kpis.growth_supply.weekly_new_artists}
            label="주간 신규 아티스트 가입 수"
          />
          <KpiCard
            value={loading || !kpis ? <Loader2 className="h-7 w-7 animate-spin" /> : kpis.growth_supply.weekly_new_artworks}
            label="주간 등록 작품 수"
          />
          <KpiCard
            value={loading || !kpis ? <Loader2 className="h-7 w-7 animate-spin" /> : formatPercent01(kpis.growth_supply.artwork_publish_completion_rate)}
            label="작품 등록 완료율"
          />
          <KpiCard
            value={loading || !kpis ? <Loader2 className="h-7 w-7 animate-spin" /> : formatPercent01(kpis.conversion_revenue.purchase_conversion_rate)}
            label="구매 전환율"
          />
          <KpiCard
            value={loading || !kpis ? <Loader2 className="h-7 w-7 animate-spin" /> : formatKrwCompact(kpis.conversion_revenue.gmv_krw)}
            label="GMV (총 거래액)"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          <Card className="shadow-lg rounded-xl border border-[#DDD6FE]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-[#4C1D95]">운영/품질</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <SubKpi
                  value={loading || !kpis ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPercent01(kpis.ops_quality.payment_webhook_success_rate)}
                  label="결제 웹훅 처리 성공률"
                />
                <SubKpi
                  value={loading || !kpis ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPercent01(kpis.ops_quality.refund_rate)}
                  label="환불률"
                />
                <SubKpi
                  value={loading || !kpis ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPercent01(kpis.ops_quality.download_failure_rate)}
                  label="다운로드 실패율"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border border-[#DDD6FE]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-[#4C1D95]">리텐션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SubKpi
                  value={loading || !kpis ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPercent01(kpis.retention.buyer_30d_repeat_rate)}
                  label="구매자 30일 재구매율"
                />
                <SubKpi
                  value={loading || !kpis ? <Loader2 className="h-5 w-5 animate-spin" /> : formatPercent01(kpis.retention.artist_30d_reregister_rate)}
                  label="아티스트 30일 재등록율"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mt-8" />

        <div className="mt-6 text-sm text-[#6D28D9]">
          참고: 이 페이지의 KPI/작품 데이터는 MVP용 샘플 API(/api/mypage/*)에서 제공됩니다. 실제 서비스에서는 로그인 세션/권한과 DB 기반으로 연결하세요.
        </div>
      </section>

      <section className="flex flex-col items-start py-10 px-6 lg:px-8 bg-[#FAF5FF]">
        <h2 className="text-2xl font-bold text-[#4C1D95]">작품 관리</h2>
        <p className="text-[#6D28D9] mt-2">아티스트는 여기서 각 작품의 상태를 변경하고 통계를 확인할 수 있습니다.</p>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild className="bg-[#6D28D9] hover:bg-[#5B21B6]">
            <Link href="/artworks/new">
              <Plus className="mr-2 h-4 w-4" />
              새 작품 등록
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-[#DDD6FE] text-[#4C1D95]">
            <Link href="/mypage/transactions">구매/판매 이력 보기</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 w-full">
          {loading && !artworks ? (
            <Card className="w-full border border-[#DDD6FE]">
              <CardContent className="p-6 flex items-center gap-2 text-[#6D28D9]">
                <Loader2 className="h-4 w-4 animate-spin" />
                작품을 불러오는 중…
              </CardContent>
            </Card>
          ) : artworks && artworks.length > 0 ? (
            artworks.map((a) => (
              <ArtworkCard
                key={a.id}
                artwork={a}
                onToggleVisibility={toggleVisibility}
                onDelete={deleteArtwork}
                pending={pendingArtworkId === a.id}
              />
            ))
          ) : (
            <Card className="w-full border border-[#DDD6FE]">
              <CardContent className="p-6 text-[#6D28D9]">표시할 작품이 없습니다. 검색어를 지우거나 새 작품을 등록해 주세요.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="flex flex-col items-start py-10 px-6 lg:px-8 bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-[#4C1D95]">주요 기능</h2>
        <p className="text-[#6D28D9] mt-2">구매자와 아티스트를 위한 빠른 액션과 리포트</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-6 w-full">
          <FeatureCard
            title="주문 및 다운로드 기록"
            desc="구매자는 주문 상태, 결제 영수증, 다운로드 기록을 조회하고 재다운로드 요청을 할 수 있습니다."
          />
          <FeatureCard
            title="판매·매출 리포트"
            desc="아티스트는 기간별 매출, 작품별 판매 수, 정산 예정 금액을 확인할 수 있습니다."
          />
          <FeatureCard
            title="작품 등록 워크플로우"
            desc="등록 폼 진입부터 승인/노출까지 상태 추적과 미완료 알림을 제공합니다."
          />
        </div>
      </section>

      <section className="flex flex-col items-start py-12 px-6 lg:px-8 bg-[#FAF5FF]">
        <h2 className="text-2xl font-bold text-[#4C1D95]">자주 묻는 질문</h2>
        <div className="flex flex-col gap-4 mt-6 max-w-3xl w-full">
          <FaqItem
            q="작품 다운로드가 실패했습니다. 어떻게 하나요?"
            a="다운로드 실패는 네트워크 또는 파일 처리 오류일 수 있습니다. 다운로드 실패율 모니터링 후 자동 재시도 또는 고객지원 티켓을 생성해 주세요."
          />
          <FaqItem
            q="정산은 언제 이루어지나요?"
            a="정산은 매월 말 정산 주기에 따라 처리됩니다. 상세 정산 내역과 예정금액은 판매·매출 리포트에서 확인할 수 있습니다."
          />
          <FaqItem
            q="작품 등록 도중 나갔는데 다시 이어서 등록할 수 있나요?"
            a="미완료 등록 건은 '작품 등록 워크플로우'에서 저장된 임시 데이터를 불러와 이어서 작성할 수 있습니다. 등록 완료율 개선을 위해 가이드와 자동저장 기능을 권장합니다."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
