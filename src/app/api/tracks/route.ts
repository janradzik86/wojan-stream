import { NextResponse } from "next/server";
import { getAllFixtureTracks, getLiveTracks } from "@/lib/catalog";
import { fixture } from "@/lib/catalog";

/** Public API: by default returns only status=live. ?all=1 returns full fixture (incl. pending/coming_soon). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  const tracks = all ? getAllFixtureTracks() : getLiveTracks();
  return NextResponse.json({
    version: fixture.version,
    catalog: fixture.catalog,
    rules: fixture.rules,
    tracks,
  });
}
