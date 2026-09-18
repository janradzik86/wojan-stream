"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string | null;
  title: string | null;
};

export function StickyPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) return;
    a.src = src;
  }, [src]);

  if (!src) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-900/50 bg-zinc-950/95 px-3 py-2 backdrop-blur safe-pb">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <button
          type="button"
          aria-label={playing ? "Pauza" : "Odtwórz"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-zinc-950 hover:bg-amber-500"
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            if (a.paused) {
              void a.play();
              setPlaying(true);
            } else {
              a.pause();
              setPlaying(false);
            }
          }}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-amber-400">
            Teraz
          </p>
          <p className="truncate text-sm text-zinc-200">{title ?? "Track"}</p>
        </div>
        <audio
          ref={audioRef}
          className="hidden"
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}
