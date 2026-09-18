"use client";

import { useEffect, useState } from "react";
import type { Track } from "@/lib/types";
import { loadUgcTracks } from "@/lib/ugc-storage";

export function MyPendingPanel() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    setTracks(loadUgcTracks().filter((t) => t.status === "pending"));
  }, []);

  if (!tracks.length) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Twoje oczekujące (tylko u Ciebie)
      </h2>
      <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-yellow-900/40">
        {tracks.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 px-3 py-3">
            <span className="truncate text-sm text-zinc-200">{t.title}</span>
            <span className="shrink-0 rounded-full bg-yellow-900/50 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-300">
              pending
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-zinc-500">
        To nie jest lista publiczna — pending review, niewidoczne na /.
      </p>
    </section>
  );
}
