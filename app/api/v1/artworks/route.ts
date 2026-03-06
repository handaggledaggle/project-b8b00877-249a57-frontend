import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Category = "일러스트" | "포토/사진" | "3D";

type Artwork = {
  id: string;
  title: string;
  price: number;
  artistName: string;
  formatLabel: string;
  deliveryLabel: string;
  views: number;
  likes: number;
  category: Category;
  tags: string[];
  createdAt: string; // ISO
};

const seed: Artwork[] = [
  {
    id: "a1",
    title: "별빛 속 드로잉",
    price: 25000,
    artistName: "moon_arts",
    formatLabel: "PNG",
    deliveryLabel: "즉시 다운로드",
    views: 1200,
    likes: 150,
    category: "일러스트",
    tags: ["PNG", "일러스트", "드로잉"],
    createdAt: "2026-03-06T09:00:00.000Z"
  },
  {
    id: "a2",
    title: "모던 포트레이트",
    price: 18000,
    artistName: "lino.studio",
    formatLabel: "JPG",
    deliveryLabel: "상업용 허용",
    views: 980,
    likes: 84,
    category: "포토/사진",
    tags: ["JPG", "포트레이트", "상업용"],
    createdAt: "2026-03-05T09:00:00.000Z"
  },
  {
    id: "a3",
    title: "도시의 밤",
    price: 12000,
    artistName: "urban_kim",
    formatLabel: "PNG",
    deliveryLabel: "고해상도",
    views: 2300,
    likes: 310,
    category: "일러스트",
    tags: ["PNG", "도시", "야경", "고해상도"],
    createdAt: "2026-03-04T09:00:00.000Z"
  },
  {
    id: "a4",
    title: "추상 컬러 스터디",
    price: 30000,
    artistName: "color_lab",
    formatLabel: "PSD",
    deliveryLabel: "레이어 포함",
    views: 430,
    likes: 40,
    category: "일러스트",
    tags: ["PSD", "추상", "컬러"],
    createdAt: "2026-03-03T09:00:00.000Z"
  },
  // extra items for pagination
  {
    id: "a5",
    title: "미니멀 그리드 포스터",
    price: 9000,
    artistName: "grid_work",
    formatLabel: "PNG",
    deliveryLabel: "즉시 다운로드",
    views: 640,
    likes: 56,
    category: "일러스트",
    tags: ["포스터", "미니멀", "PNG"],
    createdAt: "2026-03-02T09:00:00.000Z"
  },
  {
    id: "a6",
    title: "스튜디오 제품 사진 팩",
    price: 22000,
    artistName: "photo_mint",
    formatLabel: "JPG",
    deliveryLabel: "상업용 허용",
    views: 1500,
    likes: 120,
    category: "포토/사진",
    tags: ["사진", "제품", "JPG"],
    createdAt: "2026-03-01T09:00:00.000Z"
  },
  {
    id: "a7",
    title: "로우폴리 캐릭터",
    price: 45000,
    artistName: "poly_room",
    formatLabel: "OBJ",
    deliveryLabel: "상업용 허용",
    views: 810,
    likes: 63,
    category: "3D",
    tags: ["3D", "캐릭터", "로우폴리"],
    createdAt: "2026-02-28T09:00:00.000Z"
  },
  {
    id: "a8",
    title: "빛 번짐 텍스처 팩",
    price: 14000,
    artistName: "texture_hub",
    formatLabel: "PNG",
    deliveryLabel: "고해상도",
    views: 1100,
    likes: 92,
    category: "일러스트",
    tags: ["텍스처", "PNG", "고해상도"],
    createdAt: "2026-02-27T09:00:00.000Z"
  }
];

function parseNumber(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const category = (searchParams.get("category") ?? "all").trim();
  const sort = (searchParams.get("sort") ?? "latest").trim();

  const page = parseNumber(searchParams.get("page"), 1);
  const perPage = parseNumber(searchParams.get("per_page"), 4);

  const priceMin = parseNumber(searchParams.get("price_min"), Number.NEGATIVE_INFINITY);
  const priceMax = parseNumber(searchParams.get("price_max"), Number.POSITIVE_INFINITY);

  const tagsQuery = (searchParams.get("tags") ?? "").trim().toLowerCase();
  const tagTokens = tagsQuery
    ? tagsQuery
        .split(/[\s,]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (page < 1 || perPage < 1) {
    return NextResponse.json({ error: "Invalid pagination params" }, { status: 400 });
  }
  if (Number.isFinite(priceMin) && Number.isFinite(priceMax) && priceMin > priceMax) {
    return NextResponse.json({ error: "price_min must be <= price_max" }, { status: 400 });
  }

  let items = seed.slice();

  items = items.filter((a) => a.price >= priceMin && a.price <= priceMax);

  if (category !== "all") {
    items = items.filter((a) => a.category === category);
  }

  if (q) {
    items = items.filter((a) => {
      const hay = `${a.title} ${a.artistName} ${a.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (tagTokens.length) {
    items = items.filter((a) => {
      const t = a.tags.map((x) => x.toLowerCase());
      return tagTokens.every((tok) => t.some((x) => x.includes(tok)));
    });
  }

  if (sort === "popular") {
    items.sort((a, b) => b.views + b.likes - (a.views + a.likes));
  } else if (sort === "price_asc") {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    items.sort((a, b) => b.price - a.price);
  } else {
    // latest
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = items.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = items.slice(start, end).map((a) => ({
    id: a.id,
    title: a.title,
    price: a.price,
    artistName: a.artistName,
    formatLabel: a.formatLabel,
    deliveryLabel: a.deliveryLabel,
    views: a.views,
    likes: a.likes,
    category: a.category
  }));

  return NextResponse.json({
    total,
    page,
    per_page: perPage,
    items: pageItems
  });
}
