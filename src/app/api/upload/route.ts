import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

/**
 * MVP upload: writes under public/uploads when filesystem is writable (local / some hosts).
 * On Vercel the FS is read-only at runtime — client falls back to localStorage/base64.
 * Production: use Vercel Blob / S3. See README.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".mp3";
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 8) || ".mp3";
    const id = randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${id}${safeExt}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, filename), bytes);
    } catch {
      return NextResponse.json(
        {
          error: "Filesystem not writable (np. Vercel). Użyj blob storage lub client demo.",
          writable: false,
        },
        { status: 503 },
      );
    }

    const url = `/uploads/${filename}`;
    return NextResponse.json({
      id,
      url,
      title: String(form.get("title") ?? ""),
      status: "pending",
      writable: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 },
    );
  }
}
