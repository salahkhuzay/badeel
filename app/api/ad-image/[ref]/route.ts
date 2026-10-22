import { NextResponse } from "next/server";
import { sbGetAdByRef } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 86400; // cache for 1 day

export async function GET(
  req: Request,
  { params }: { params: { ref: string } }
) {
  const ref = params.ref;
  if (!ref) {
    return NextResponse.redirect(new URL("/og-cover.png", req.url), 302);
  }

  const ad = await sbGetAdByRef(ref);
  const img = (ad?.images ?? [])[0];

  if (!img) {
    return NextResponse.redirect(new URL("/og-cover.png", req.url), 302);
  }

  // Handle base64 data URLs
  if (img.startsWith("data:")) {
    const match = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/.exec(img);
    if (match) {
      const mime = match[1];
      const buffer = Buffer.from(match[2], "base64");
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Content-Length": String(buffer.length),
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  // Handle direct HTTP/HTTPS URLs
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return NextResponse.redirect(img, 302);
  }

  return NextResponse.redirect(new URL("/og-cover.png", req.url), 302);
}
