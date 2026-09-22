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
    // No active live right now. Do NOT fall back to ordinary channel videos.
    // /live is strictly for live broadcasts; when there is no active stream,
    // return offline and wait for the next broadcast.
    return NextResponse.json(
      {
        mode: "offline",
        url: "",
        key: "offline",
        liveVideoId: null,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    // Temporary lookup error. Fall through to configured fallback/offline.
  }

  // Never fall back to an old manually configured video ID.
  // If YouTube lookup is temporarily unavailable, the client keeps the last
  // working source it already has. A fresh page shows the offline placeholder
  // instead of resurrecting a deleted recording.
  return NextResponse.json(
    { mode: "offline", url: "", key: "offline", liveVideoId: null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
