import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_HANDLE = "@CzarneWilkiPrawdy";
const CHANNEL_ID_RE = /^UC[\w-]{22}$/;
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

function extractChannelId(html: string): string | null {
  const patterns = [
    /"channelId":"(UC[\w-]{22})"/,
    /"externalId":"(UC[\w-]{22})"/,
    /youtube\.com\/channel\/(UC[\w-]{22})/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function extractLiveVideoId(html: string, finalUrl: string): string | null {
  const fromFinal = videoIdFromUrl(finalUrl);
  if (fromFinal && /"isLiveNow":true|BADGE_STYLE_TYPE_LIVE_NOW|LIVE_NOW/i.test(html)) {
    return fromFinal;
  }

  const canonical = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})[^"']*["']/i,
  );
  if (canonical?.[1] && /"isLiveNow":true|BADGE_STYLE_TYPE_LIVE_NOW|LIVE_NOW/i.test(html)) {
    return canonical[1];
  }

  const liveNow = html.match(
    /"videoId":"([\w-]{11})"[\s\S]{0,1200}?"isLiveNow":true/,
  );
  if (liveNow?.[1]) return liveNow[1];

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

export async function GET() {
  const configuredChannelId = (process.env.YOUTUBE_CHANNEL_ID ?? "").trim();
  const handle = (process.env.YOUTUBE_CHANNEL_HANDLE ?? DEFAULT_HANDLE)
    .trim()
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, "")
    .replace(/^\//, "");

  let channelId = CHANNEL_ID_RE.test(configuredChannelId)
    ? configuredChannelId
    : null;
  let liveVideoId: string | null = null;

  try {
    const liveUrl = `https://www.youtube.com/${handle}/live`;
    const liveResponse = await fetchText(liveUrl);
    const html = await liveResponse.text();

    liveVideoId = extractLiveVideoId(html, liveResponse.url);
    channelId = channelId ?? extractChannelId(html);

    if (!channelId) {
      const channelResponse = await fetchText(`https://www.youtube.com/${handle}`);
      const channelHtml = await channelResponse.text();
      channelId = extractChannelId(channelHtml);
    }
  } catch {
    // A temporary YouTube/network failure must not pin the app to an old video.
  }

  if (liveVideoId) {
    return NextResponse.json(
      {
        mode: "youtube-live-video",
        url: `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
        key: `video:${liveVideoId}`,
        liveVideoId,
        channelId,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  if (channelId) {
    return NextResponse.json(
      {
        mode: "youtube-channel-live",
        url: `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&playsinline=1&rel=0&modestbranding=1`,
        key: `channel:${channelId}`,
        liveVideoId: null,
        channelId,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const fallback = (process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? "").trim();
  if (fallback) {
    return NextResponse.json(
      {
        mode: "fallback",
        url: fallback,
        key: `fallback:${fallback}`,
        liveVideoId: null,
        channelId: null,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return NextResponse.json(
    { mode: "offline", url: "", key: "offline", liveVideoId: null, channelId: null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
