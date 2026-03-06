import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ artworkId: string }> }) {
  const { artworkId } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const action = (body as { action?: unknown } | null)?.action;
  if (action !== "toggle_visibility") {
    return NextResponse.json(
      { error: "Unsupported action", allowed: ["toggle_visibility"] },
      { status: 400 }
    );
  }

  // MVP: 실제 DB 업데이트 대신 성공만 응답
  return NextResponse.json({ ok: true, artworkId, action });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ artworkId: string }> }) {
  const { artworkId } = await ctx.params;

  // MVP: 실제 DB 삭제/비활성화 대신 성공만 응답
  return NextResponse.json({ ok: true, artworkId });
}
