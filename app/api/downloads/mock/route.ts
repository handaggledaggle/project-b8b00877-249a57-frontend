import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId") ?? "unknown";

  const content = `printtie download demo\n\norderId: ${orderId}\nissuedAt: ${new Date().toISOString()}\n\n(실제 서비스에서는 서명 URL 또는 권한 검증 후 파일을 제공합니다.)\n`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="printtie-${orderId}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
