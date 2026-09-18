/** YouTube watch / shorts / youtu.be → embed id helpers */

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return YT_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return /youtu\.?be/i.test(url);
  }
}

/** Extract 11-char video id from common YouTube URL shapes. */
export function getYouTubeVideoId(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host === "youtu.be" || host === "www.youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (YT_HOSTS.has(host)) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const parts = u.pathname.split("/").filter(Boolean);
      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      if (
        parts.length >= 2 &&
        ["embed", "shorts", "live", "v"].includes(parts[0])
      ) {
        const id = parts[1];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    const m = url.match(
      /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/,
    );
    return m?.[1] ?? null;
  }
  return null;
}

export function getYouTubeEmbedUrl(
  url: string | null | undefined,
  opts?: { autoplay?: boolean },
): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  if (opts?.autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbUrl(
  url: string | null | undefined,
): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
