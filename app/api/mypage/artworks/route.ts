import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function svgDataUrl(label: string) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7C3AED" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#A78BFA" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" rx="24" fill="url(#g)" />
  <rect x="40" y="40" width="720" height="370" rx="18" fill="#FFFFFF" fill-opacity="0.55" stroke="#DDD6FE" />
  <text x="70" y="120" font-family="ui-sans-serif, system-ui" font-size="36" fill="#4C1D95" font-weight="700">printtie</text>
  <text x="70" y="170" font-family="ui-sans-serif, system-ui" font-size="26" fill="#6D28D9">${label}</text>
  <text x="70" y="220" font-family="ui-sans-serif, system-ui" font-size="18" fill="#6D28D9" opacity="0.75">thumbnail placeholder</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const items = [
    {
      id: "art_001",
      title: "달의 정원",
      salesCount: 38,
      downloadCount: 120,
      status: "active" as const,
      thumbnailDataUrl: svgDataUrl("달의 정원"),
    },
    {
      id: "art_002",
      title: "도심 스케치",
      salesCount: 12,
      downloadCount: 45,
      status: "active" as const,
      thumbnailDataUrl: svgDataUrl("도심 스케치"),
    },
    {
      id: "art_003",
      title: "바다의 노래",
      salesCount: 5,
      downloadCount: 18,
      status: "hidden" as const,
      thumbnailDataUrl: svgDataUrl("바다의 노래"),
    },
  ].filter((it) => (q ? it.title.toLowerCase().includes(q) : true));

  return NextResponse.json({ items });
}
