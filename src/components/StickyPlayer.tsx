"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getYouTubeThumbUrl,
  isYouTubeUrl,
} from "@/lib/youtube";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

type Props = {
  trackId: string | null;
  src: string | null;
  title: string | null;
  coverUrl?: string | null;
  /** coming_soon / pending → no play controls */
  canPlay?: boolean;
};

/**
 * Mobile-first compact sticky bar: cover + title + play.
 * Never mounts a full 16:9 iframe in the bottom bar.
 * YouTube: play expands embed panel above the bar; title/cover → /track/[id].
 */
export function StickyPlayer({
  trackId,
  src,
  title,
  coverUrl,
  canPlay = true,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const youtube = isYouTubeUrl(src);
  const thumb = coverUrl || (src ? getYouTubeThumbUrl(src) : null);
  const href = trackId ? `/track/${encodeURIComponent(trackId)}` : null;

  useEffect(() => {
    setPlaying(false);
    setExpanded(false);
    const a = audioRef.current;
    if (!a || !src || youtube) return;
    a.src = src;
  }, [src, youtube]);

  if (!src || !canPlay) return null;

  const togglePlay = () => {
    if (youtube) {
      setExpanded((v) => !v);
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const isActive = youtube ? expanded : playing;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 safe-pb">
      {youtube && expanded && (
        <div className="border-t border-amber-900/40 bg-zinc-950/98 px-3 pt-3 backdrop-blur">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-amber-400">
                Odtwarzanie
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {href && (
                  <Link
                    href={href}
                    className="rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400 hover:text-amber-400"
                  >
                    Pełny widok
                  </Link>
                )}
                <button
                  type="button"
                  aria-label="Zwiń"
                  className="rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-200"
                  onClick={() => setExpanded(false)}
                >
                  Zwiń
                </button>
              </div>
            </div>
            <YouTubeEmbed src={src} title={title ?? undefined} autoplay />
          </div>
        </div>
      )}

      <div className="border-t border-amber-900/50 bg-zinc-950/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          {href ? (
            <Link
              href={href}
              className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
              aria-label={title ? `Otwórz: ${title}` : "Otwórz track"}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg">
                  🎵
                </span>
              )}
            </Link>
          ) : (
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-lg">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "🎵"
              )}
            </span>
          )}

          {href ? (
            <Link href={href} className="min-w-0 flex-1 active:opacity-80">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-amber-400">
                Teraz
              </p>
              <p className="truncate text-sm text-zinc-200">
                {title ?? "Track"}
              </p>
            </Link>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-amber-400">
                Teraz
              </p>
              <p className="truncate text-sm text-zinc-200">
                {title ?? "Track"}
              </p>
            </div>
          )}

          <button
            type="button"
            aria-label={
              youtube
                ? expanded
                  ? "Zwiń player"
                  : "Odtwórz"
                : playing
                  ? "Pauza"
                  : "Odtwórz"
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-zinc-950 hover:bg-amber-500"
            onClick={togglePlay}
          >
            {isActive ? "❚❚" : "▶"}
          </button>

          {!youtube && (
            <audio
              ref={audioRef}
              className="hidden"
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
