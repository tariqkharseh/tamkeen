import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const fontPath = join(process.cwd(), "app", "fonts", `QCF_P${page}.TTF`);

    const fontBuffer = await readFile(fontPath);

    return new NextResponse(fontBuffer, {
      headers: {
        "Content-Type": "font/ttf",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Font not found", { status: 404 });
  }
}

