"use client";

import { isYouTubeUrl } from "@/lib/youtube";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

type Props = {
  src: string;
  title?: string;
};

/** Direct audio/mp4 OR YouTube watch URL (full embed — track page / hero). */
export function AudioPlayer({ src, title }: Props) {
  if (isYouTubeUrl(src)) {
    return <YouTubeEmbed src={src} title={title} />;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      {title && (
        <p className="mb-2 text-sm font-medium text-amber-300">{title}</p>
      )}
      <audio className="w-full" controls preload="metadata" src={src}>
        Twoja przeglądarka nie obsługuje odtwarzacza audio.
      </audio>
    </div>
  );
}
