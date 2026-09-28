import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHANNEL_HANDLE = (process.env.YOUTUBE_CHANNEL_HANDLE || "@czarnewilkiprawdy").trim();
const CONFIG_CHANNEL_ID = (process.env.YOUTUBE_CHANNEL_ID || "").trim();
const FALLBACK_STREAM_URL = (process.env.NEXT_PUBLIC_LIVE_STREAM_URL || "").trim();
const VIDEO_ID_RE = /^[\w-]{11}$/;
const CHANNEL_ID_RE = /^UC[\w-]{22}$/;

function videoIdFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const v = u.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "live" && parts[1] && VIDEO_ID_RE.test(parts[1])) return parts[1];
    if (parts[0] === "watch") {
      const watchId = u.searchParams.get("v");
      if (watchId && VIDEO_ID_RE.test(watchId)) return watchId;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchText(url: string) {
  return fetch(url, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Safari/537.36 WojanLive/2.0",
      "accept-language": "pl-PL,pl;q=0.9,en;q=0.7",
    },
  });
}

function extractCurrentLiveVideoId(html: string, finalUrl: string): string | null {
  const finalId = videoIdFromUrl(finalUrl);
  const liveMarker =
    /"isLiveNow":true|BADGE_STYLE_TYPE_LIVE_NOW|"style":"LIVE"|"label":"LIVE"|LIVE_NOW/i;

  if (finalId && liveMarker.test(html)) return finalId;

  const patterns = [
    /"videoId":"([\w-]{11})"[\s\S]{0,4000}?"isLiveNow":true/,
    /"isLiveNow":true[\s\S]{0,4000}?"videoId":"([\w-]{11})"/,
    /"videoId":"([\w-]{11})"[\s\S]{0,4000}?BADGE_STYLE_TYPE_LIVE_NOW/,
    /BADGE_STYLE_TYPE_LIVE_NOW[\s\S]{0,4000}?"videoId":"([\w-]{11})"/,
    /"canonicalBaseUrl":"\/live\/([\w-]{11})"/,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && VIDEO_ID_RE.test(m[1])) return m[1];
  }

  return null;
}

function extractChannelId(html: string): string | null {
  const patterns = [
    /"channelId":"(UC[\w-]{22})"/,
    /"externalId":"(UC[\w-]{22})"/,
    /"browseId":"(UC[\w-]{22})"/,
    /itemprop="channelId"\s+content="(UC[\w-]{22})"/,
    /youtube\.com\/channel\/(UC[\w-]{22})/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && CHANNEL_ID_RE.test(m[1])) return m[1];
  }
  return null;
}

function response(body: Record<string, unknown>) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

function channelEmbed(channelId: string, resolvedFrom: string) {
  return response({
    mode: "youtube-channel-live",
    url: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
    key: `channel-live:${channelId}`,
    liveVideoId: null,
    channelId,
    channelHandle: CHANNEL_HANDLE,
    channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
    resolvedFrom,
  });
}

export async function GET() {
  const channelUrl = `https://www.youtube.com/${CHANNEL_HANDLE}`;
  const channelLiveUrl = `${channelUrl}/live`;

  let liveHtml = "";
  let finalLiveUrl = channelLiveUrl;

  try {
    const liveResponse = await fetchText(channelLiveUrl);
    finalLiveUrl = liveResponse.url || channelLiveUrl;
    liveHtml = await liveResponse.text();

    const liveVideoId = extractCurrentLiveVideoId(liveHtml, finalLiveUrl);
    if (liveVideoId) {
      return response({
        mode: "youtube-live-video",
        url: `https://www.youtube.com/watch?v=${liveVideoId}`,
        key: `live:${liveVideoId}`,
        liveVideoId,
        channelId: CONFIG_CHANNEL_ID || extractChannelId(liveHtml),
        channelHandle: CHANNEL_HANDLE,
        channelUrl,
        resolvedFrom: "live-page",
      });
    }
  } catch {
    // Continue with channel-id resolution and explicit fallback.
  }

  if (CONFIG_CHANNEL_ID && CHANNEL_ID_RE.test(CONFIG_CHANNEL_ID)) {
    return channelEmbed(CONFIG_CHANNEL_ID, "env");
  }

  const idFromLivePage = extractChannelId(liveHtml);
  if (idFromLivePage) return channelEmbed(idFromLivePage, "live-page-html");

  try {
    const channelResponse = await fetchText(channelUrl);
    const channelHtml = await channelResponse.text();
    const resolvedChannelId = extractChannelId(channelHtml);
    if (resolvedChannelId) return channelEmbed(resolvedChannelId, "channel-page-html");
  } catch {
    // Continue to explicit fallback / offline state.
  }

  if (FALLBACK_STREAM_URL) {
    return response({
      mode: "fallback",
      url: FALLBACK_STREAM_URL,
      key: `fallback:${FALLBACK_STREAM_URL}`,
      liveVideoId: null,
      channelId: null,
      channelHandle: CHANNEL_HANDLE,
      channelUrl,
      resolvedFrom: "env-fallback",
    });
  }

  return response({
    mode: "offline",
    url: "",
    key: "offline",
    liveVideoId: null,
    channelId: null,
    channelHandle: CHANNEL_HANDLE,
    channelUrl,
    resolvedFrom: "none",
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
