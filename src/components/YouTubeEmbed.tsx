"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";

type Props = {
  src: string;
  title?: string;
  /** Start playback (use after a user gesture when possible). */
  autoplay?: boolean;
  className?: string;
};

/** Full 16:9 YouTube iframe — for hero on `/` and `/track/[id]` only. */
export function YouTubeEmbed({ src, title, autoplay, className }: Props) {
  const embed = getYouTubeEmbedUrl(src, { autoplay });
  if (!embed) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-zinc-500">
        Nie udało się zbudować embeda YouTube.
      </p>
    );
  }

  return (
    <div
      className={
        className ??
        "overflow-hidden rounded-xl border border-amber-900/40 bg-black shadow-lg shadow-amber-950/30"
      }
    >
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={embed}
          title={title ?? "YouTube"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
