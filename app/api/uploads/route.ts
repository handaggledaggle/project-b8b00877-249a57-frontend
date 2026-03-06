import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") ?? "file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // NOTE: This is a stub for serverless demo.
    // In production: upload to S3 (or compatible) and return a public/authorized URL.
    const key = `${kind}/${crypto.randomUUID()}-${file.name}`;

    return NextResponse.json(
      {
        url: `/uploads/${encodeURIComponent(key)}`,
        fileName: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
