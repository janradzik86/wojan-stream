import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** User channel: https://youtube.com/@czarnewilkiprawdy */
const CHANNEL_HANDLE = "@czarnewilkiprawdy";
const CHANNEL_ID = "UCkqXUdBeXbc52f__qDcNCaQ";
const VIDEO_ID_RE = /^[\w-]{11}$/;

function videoIdFromUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const v = u.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "live" && parts[1] && VIDEO_ID_RE.test(parts[1])) {
      return parts[1];
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

function channelLiveEmbed() {
  return {
    mode: "youtube-channel-live" as const,
    url: `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}`,
    key: `channel-live:${CHANNEL_ID}`,
    liveVideoId: null,
    channelId: CHANNEL_ID,
    channelHandle: CHANNEL_HANDLE,
    channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
  };
}

export async function GET() {
  const channelLiveUrl = `https://www.youtube.com/${CHANNEL_HANDLE}/live`;

  try {
    const liveResponse = await fetchText(channelLiveUrl);
    const liveHtml = await liveResponse.text();
    const liveVideoId = extractCurrentLiveVideoId(liveHtml, liveResponse.url);

    if (liveVideoId) {
      return NextResponse.json(
        {
          mode: "youtube-live-video",
          url: `https://www.youtube.com/watch?v=${liveVideoId}`,
          key: `live:${liveVideoId}`,
          liveVideoId,
          channelId: CHANNEL_ID,
          channelHandle: CHANNEL_HANDLE,
          channelUrl: `https://www.youtube.com/${CHANNEL_HANDLE}`,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    // No confirmed live video id — still bind the channel live embed so a
    // newly started stream appears without waiting for scrape to catch up.
    return NextResponse.json(channelLiveEmbed(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    // YouTube scrape blocked / network blip — channel embed still tracks live.
    return NextResponse.json(channelLiveEmbed(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
