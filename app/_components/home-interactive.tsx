"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";
import { ArtworkCard } from "@/app/_components/artwork-card";

type SortKey = "latest" | "popular" | "price_asc" | "price_desc";

type ArtworkSummary = {
  id: string;
  title: string;
  price: number;
  artistName: string;
  formatLabel: string;
  deliveryLabel: string;
  views: number;
  likes: number;
  category: "일러스트" | "포토/사진" | "3D";
};

type ArtworksListResponse = {
  total: number;
  page: number;
  per_page: number;
  items: ArtworkSummary[];
};

function formatPriceKRW(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function formatCompact(n: number) {
  if (n >= 1000) return `${Math.round((n / 1000) * 10) / 10}k`;
  return `${n}`;
}

export function HomeInteractive() {
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("latest");
  const [category, setCategory] = React.useState<"all" | ArtworkSummary["category"]>("all");

  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(4);

  const [items, setItems] = React.useState<ArtworkSummary[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Detail filters (Dialog) - visual only for now
  const [priceMin, setPriceMin] = React.useState<string>("");
  const [priceMax, setPriceMax] = React.useState<string>("");
  const [tags, setTags] = React.useState<string>("");

  const canLoadMore = items.length < total;

  const fetchList = React.useCallback(
    async (nextPage: number, mode: "replace" | "append") => {
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (q.trim()) sp.set("q", q.trim());
        if (category !== "all") sp.set("category", category);
        sp.set("sort", sort);
        sp.set("page", String(nextPage));
        sp.set("per_page", String(perPage));
        if (priceMin.trim()) sp.set("price_min", priceMin.trim());
        if (priceMax.trim()) sp.set("price_max", priceMax.trim());
        if (tags.trim()) sp.set("tags", tags.trim());

        const res = await fetch(`/api/v1/artworks?${sp.toString()}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = (await res.json()) as ArtworksListResponse;

        setTotal(data.total);
        setPage(data.page);
        setItems((prev) => (mode === "replace" ? data.items : [...prev, ...data.items]));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [q, category, sort, perPage, priceMin, priceMax, tags]
  );

  // (Re)load when query changes
  React.useEffect(() => {
    void fetchList(1, "replace");
  }, [fetchList]);

  return (
    <>
      {/* Hero */}
      <section
        data-section-type="hero"
        className="flex flex-col items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] px-8 py-12"
      >
        <div className="flex w-full max-w-[1100px] flex-col items-center gap-6">
          <h1 className="text-center text-4xl font-bold text-white">
            디지털 작품을 빠르게 등록하고, 구매까지 원스톱으로
          </h1>
          <p className="text-center text-lg text-white/70">
            작가가 파일 업로드부터 결제·전달까지 한 번에 관리할 수 있도록 설계된 작품 마켓플레이스
          </p>

          <div className="w-full">
            <div className="flex w-full items-center gap-3">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="작품 제목, 작가명, 태그로 검색"
                  className={cn(
                    "h-12 w-full rounded-lg border border-white/30 bg-transparent pl-12 text-white/90",
                    "placeholder:text-white/70",
                    "focus-visible:ring-0 focus-visible:ring-offset-0"
                  )}
                  data-component="search"
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className={cn(
                      "h-12 rounded-lg border border-white/30 bg-transparent px-4 py-3 text-white/90",
                      "hover:bg-white/10"
                    )}
                    data-component="button"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    상세 필터
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>상세 필터</DialogTitle>
                    <DialogDescription>가격 범위나 태그로 작품을 더 정확히 찾을 수 있어요.</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="priceMin">최소 가격</Label>
                        <Input
                          id="priceMin"
                          inputMode="numeric"
                          placeholder="예: 10000"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priceMax">최대 가격</Label>
                        <Input
                          id="priceMax"
                          inputMode="numeric"
                          placeholder="예: 30000"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">태그</Label>
                      <Input
                        id="tags"
                        placeholder="예: PNG, 고해상도"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceMin("");
                        setPriceMax("");
                        setTags("");
                      }}
                    >
                      초기화
                    </Button>
                    <Button onClick={() => void fetchList(1, "replace")}>적용</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex w-full justify-center gap-4">
            <Button
              className={cn(
                "h-12 rounded-lg border border-white/30 bg-transparent px-6 py-3 text-white/90",
                "hover:bg-white/10"
              )}
              data-component="button"
            >
              작품 등록하기
            </Button>
            <Button
              className={cn(
                "h-12 rounded-lg border border-white/30 bg-transparent px-6 py-3 text-white/90",
                "hover:bg-white/10"
              )}
              data-component="button"
            >
              추천 작품 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Card grid */}
      <section data-section-type="card-grid" className="flex flex-col items-center bg-white px-8 py-12">
        <div className="flex w-full max-w-[1200px] flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#4C1D95]">작품 목록</h2>
          </div>

          {/* Segmented filters (to match screenshot layout) */}
          <div className="flex w-full gap-6">
            <div className="flex-1 rounded-lg border border-[#DDD6FE] bg-white p-2 shadow-lg">
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    sort === "latest" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setSort("latest")}
                >
                  최신순
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    sort === "popular" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setSort("popular")}
                >
                  인기순
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    sort === "price_asc" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setSort("price_asc")}
                >
                  가격 낮은순
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    sort === "price_desc" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setSort("price_desc")}
                >
                  가격 높은순
                </Button>
              </div>
            </div>

            <div className="flex-1 rounded-lg border border-[#DDD6FE] bg-white p-2 shadow-lg">
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    category === "all" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setCategory("all")}
                >
                  전체 카테고리
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    category === "일러스트" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setCategory("일러스트")}
                >
                  일러스트
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    category === "포토/사진" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setCategory("포토/사진")}
                >
                  포토/사진
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 justify-start text-[#4C1D95]",
                    category === "3D" && "bg-[#FAF5FF]"
                  )}
                  onClick={() => setCategory("3D")}
                >
                  3D
                </Button>
              </div>
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          {/* Cards - match screenshot: 3 small + 1 wide */}
          <div className="grid grid-cols-3 gap-6">
            {items.slice(0, 3).map((it) => (
              <ArtworkCard
                key={it.id}
                layout="compact"
                title={it.title}
                price={formatPriceKRW(it.price)}
                meta={`작가: ${it.artistName} · ${it.formatLabel} · ${it.deliveryLabel}`}
                stats={`조회 ${formatCompact(it.views)} · 좋아요 ${it.likes}`}
              />
            ))}

            {items[3] ? (
              <div className="col-span-3">
                <ArtworkCard
                  layout="wide"
                  title={items[3].title}
                  price={formatPriceKRW(items[3].price)}
                  meta={`작가: ${items[3].artistName} · ${items[3].formatLabel} · ${items[3].deliveryLabel}`}
                  stats={`조회 ${formatCompact(items[3].views)} · 좋아요 ${items[3].likes}`}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex w-full justify-center">
            <Button
              variant="outline"
              className="w-full rounded-lg border-[#DDD6FE] bg-white px-6 py-2 text-[#4C1D95] shadow-lg"
              disabled={loading || !canLoadMore}
              onClick={() => void fetchList(page + 1, "append")}
              data-component="button"
            >
              {loading ? "불러오는 중..." : "더 보기"}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
