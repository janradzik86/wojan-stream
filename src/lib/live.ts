import catalogJson from "../../data/catalog.json";

export function getLiveStreamUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? "").trim();
}

export function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

/** youtube.com/watch, /live/, /embed/, youtu.be */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (u.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${u.pathname}`;
      }
      const live = u.pathname.match(/^\/live\/([^/?]+)/);
      if (live?.[1]) return `https://www.youtube.com/embed/${live[1]}`;
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return getYouTubeEmbedUrl(url) !== null;
}

/** Offline Social tagline (wilki) — user-facing only, no stream-tech jargon */
export const LIVE_OFFLINE_TAGLINE =
  "Wracaj na live — kiedy świat się pali, wilki wychodzą.";

export type LiveCtaLabels = {
  labelOn: string;
  labelOff: string;
  href: string;
  offlineTagline: string;
};

/**
 * Live CTA copy from catalog.json featured.live —
 * single source for home and /live primary CTA (Social voice).
 */
export function getLiveCtaLabels(): LiveCtaLabels {
  const live = catalogJson.featured.live;
  return {
    labelOn: live.label_on,
    labelOff: live.label_off,
    href: live.href,
    offlineTagline: LIVE_OFFLINE_TAGLINE,
  };
}

export function getLiveCtaLabel(streamOn: boolean): string {
  const { labelOn, labelOff } = getLiveCtaLabels();
  return streamOn ? labelOn : labelOff;
}
