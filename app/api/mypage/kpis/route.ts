import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clampRange(range: string | null): "7d" | "30d" {
  if (range === "30d") return "30d";
  return "7d";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = clampRange(searchParams.get("range"));

  // MVP: 샘플 데이터. (DB 연동 전)
  const data =
    range === "7d"
      ? {
          range,
          growth_supply: {
            weekly_new_artists: 23,
            weekly_new_artworks: 124,
            artwork_publish_completion_rate: 0.68,
          },
          conversion_revenue: {
            purchase_conversion_rate: 0.042,
            gmv_krw: 12_400_000,
          },
          ops_quality: {
            payment_webhook_success_rate: 0.992,
            refund_rate: 0.018,
            download_failure_rate: 0.006,
          },
          retention: {
            buyer_30d_repeat_rate: 0.18,
            artist_30d_reregister_rate: 0.12,
          },
        }
      : {
          range,
          growth_supply: {
            weekly_new_artists: 96,
            weekly_new_artworks: 510,
            artwork_publish_completion_rate: 0.71,
          },
          conversion_revenue: {
            purchase_conversion_rate: 0.046,
            gmv_krw: 47_800_000,
          },
          ops_quality: {
            payment_webhook_success_rate: 0.989,
            refund_rate: 0.021,
            download_failure_rate: 0.008,
          },
          retention: {
            buyer_30d_repeat_rate: 0.22,
            artist_30d_reregister_rate: 0.15,
          },
        };

  return NextResponse.json(data);
}
