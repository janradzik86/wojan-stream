"use client";

import { useState } from "react";
import type { Track } from "@/lib/types";
import { TrackList } from "@/components/TrackList";
import { StickyPlayer } from "@/components/StickyPlayer";

type Props = {
  tracks: Track[];
  emptyText: string;
};

/**
 * Hits list + sticky: sticky stays hidden until user taps play on a live track
 * (avoids overlapping „Wrzuć swój track” on initial / scroll-to-top view).
 */
export function HomeHits({ tracks, emptyText }: Props) {
  const [current, setCurrent] = useState<Track | null>(null);

  return (
    <>
      <TrackList
        tracks={tracks}
        emptyText={emptyText}
        activeId={current?.id ?? null}
        onPlay={(t) => {
          if (t.status !== "live" || !t.audio_url) return;
          setCurrent(t);
        }}
      />
      {current?.status === "live" && current.audio_url && (
        <StickyPlayer
          trackId={current.id}
          src={current.audio_url}
          title={current.title}
          coverUrl={current.cover_url ?? null}
          canPlay
        />
      )}
    </>
  );
}
