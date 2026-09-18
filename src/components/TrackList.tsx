"use client";

import Link from "next/link";
import type { Track } from "@/lib/types";

type Props = {
  tracks: Track[];
  emptyText?: string;
  /** When set, shows compact play control (live only) to drive sticky player. */
  onPlay?: (track: Track) => void;
  activeId?: string | null;
};

export function TrackList({ tracks, emptyText, onPlay, activeId }: Props) {
  if (!tracks.length) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-center text-sm leading-relaxed text-zinc-500">
        {emptyText ??
          "Brak tracków ze statusem live. Coming soon i pending nie są na liście publicznej."}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
      {tracks.map((t) => {
        const playable = t.status === "live" && Boolean(t.audio_url);
        return (
          <li key={t.id}>
            <div className="flex items-center gap-2 px-3 py-3.5 sm:px-4">
              <Link
                href={`/track/${encodeURIComponent(t.id)}`}
                className="flex min-w-0 flex-1 items-center gap-3 active:opacity-80"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-lg"
                  aria-hidden
                >
                  {t.has_video ? "🎬" : "🎵"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {t.title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {t.artist_display ?? t.uploader_display ?? t.uploader_id}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    activeId === t.id
                      ? "bg-amber-900/60 text-amber-300"
                      : "bg-emerald-900/50 text-emerald-300"
                  }`}
                >
                  {activeId === t.id ? "teraz" : "live"}
                </span>
              </Link>
              {onPlay && playable && (
                <button
                  type="button"
                  aria-label={`Odtwórz: ${t.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-zinc-950 hover:bg-amber-500"
                  onClick={() => onPlay(t)}
                >
                  ▶
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
