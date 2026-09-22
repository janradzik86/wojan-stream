import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHANNEL_HANDLE = "@czarnewilkiprawdy";
const VIDEO_ID_RE = /^[\w-]{11}$/;

function videoIdFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const v = u.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "live" && parts[1] && VIDEO_ID_RE.test(parts[1])) return parts[1];
  } catch {}
  return null;
}

async function fetchText(url: string) {
  return fetch(url, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; WojanLive/1.0; +https://wojan-stream.vercel.app)",
      "accept-language": "pl,en;q=0.8",
    },
  });
}

function extractCurrentLiveVideoId(html: string, finalUrl: string): string | null {
  const finalId = videoIdFromUrl(finalUrl);
  const liveMarker = /"isLiveNow":true|BADGE_STYLE_TYPE_LIVE_NOW|LIVE_NOW/i;

  if (finalId && liveMarker.test(html)) return finalId;

  const direct = html.match(
    /"videoId":"([\w-]{11})"[\s\S]{0,1400}?"isLiveNow":true/,
  );
  if (direct?.[1]) return direct[1];

  const reversed = html.match(
    /"isLiveNow":true[\s\S]{0,1400}?"videoId":"([\w-]{11})"/,
  );
  if (reversed?.[1]) return reversed[1];

  return null;
}

function extractNewestVideoId(html: string): string | null {
  const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  return ids[0] ?? null;
}

export async function GET() {
  const channelLiveUrl = `https://www.youtube.com/${CHANNEL_HANDLE}/live`;
  const channelVideosUrl = `https://www.youtube.com/${CHANNEL_HANDLE}/videos`;

  try {
    const liveResponse = await fetchText(channelLiveUrl);
    const liveHtml = await liveResponse.text();
    const liveVideoId = extractCurrentLiveVideoId(liveHtml, liveResponse.url);

    if (liveVideoId) {
      return NextResponse.json(
        {
          mode: "youtube-live-video",
          url: `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
          key: `live:${liveVideoId}`,
          liveVideoId,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    // No active live right now: keep the page useful by playing the newest
    // available channel video/archived stream. As soon as a fresh live appears,
    // the polling client will switch to it because the key changes to live:ID.
    const videosResponse = await fetchText(channelVideosUrl);
    const videosHtml = await videosResponse.text();
    const newestVideoId = extractNewestVideoId(videosHtml);

    if (newestVideoId) {
      return NextResponse.json(
        {
          mode: "youtube-latest-video",
          url: `https://www.youtube.com/embed/${newestVideoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
          key: `latest:${newestVideoId}`,
          liveVideoId: null,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }
  } catch {
    // Temporary lookup error. Fall through to configured fallback/offline.
  }

  const fallback = (process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? "").trim();
  if (fallback) {
    return NextResponse.json(
      {
        mode: "fallback",
        url: fallback,
        key: `fallback:${fallback}`,
        liveVideoId: null,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return NextResponse.json(
    { mode: "offline", url: "", key: "offline", liveVideoId: null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
