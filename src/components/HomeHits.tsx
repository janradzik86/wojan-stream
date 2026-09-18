"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { getLiveTracks } from "@/lib/catalog";
import { purgeStaleUgcCatalog } from "@/lib/ugc-storage";
import { TrackList } from "@/components/TrackList";
import { StickyPlayer } from "@/components/StickyPlayer";

type Props = {
  /** SSR Hits v2 live tracks from data/tracks.fixture.json */
  tracks: Track[];
  emptyText: string;
};

/**
 * Hits list + sticky. Public list is ALWAYS the SSR fixture (or the same
 * fixture module on client) — never localStorage / demo „Przykład UGC”.
 * Sticky mounts only after the user taps play (no CTA overlap on cold load).
 */
export function HomeHits({ tracks, emptyText }: Props) {
  // Prefer SSR props; same fixture module as server if props somehow empty
  const list = tracks.length > 0 ? tracks : getLiveTracks();
  const [current, setCurrent] = useState<Track | null>(null);

  useLayoutEffect(() => {
    purgeStaleUgcCatalog();
  }, []);

  const stickyOn =
    current?.status === "live" && Boolean(current.audio_url);

  return (
    <div className={stickyOn ? "pb-40 sm:pb-44" : undefined}>
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Hits · na żywo
        </h2>
        <TrackList
          tracks={list}
          emptyText={emptyText}
          activeId={current?.id ?? null}
          onPlay={(t) => {
            if (t.status !== "live" || !t.audio_url) return;
            // Never promote pending / demo titles into sticky
            if (/^Przykład UGC/i.test(t.title)) return;
            setCurrent(t);
          }}
        />
      </section>

      <section className="mt-8 mb-4">
        <Link
          href="/tracks"
          className="flex w-full items-center justify-center rounded-xl border-2 border-amber-700/70 px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-wide text-amber-400 hover:bg-amber-950/40"
        >
          Wrzuć swój track
        </Link>
      </section>

      {stickyOn && current?.audio_url && (
        <StickyPlayer
          trackId={current.id}
          src={current.audio_url}
          title={current.title}
          coverUrl={current.cover_url ?? null}
          canPlay
        />
      )}
    </div>
  );
}
