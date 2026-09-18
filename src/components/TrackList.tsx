import Link from "next/link";
import type { Track } from "@/lib/types";

type Props = {
  tracks: Track[];
  emptyText?: string;
};

export function TrackList({ tracks, emptyText }: Props) {
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
      {tracks.map((t) => (
        <li key={t.id}>
          <Link
            href={`/track/${encodeURIComponent(t.id)}`}
            className="flex items-center gap-3 px-3 py-3.5 active:bg-zinc-900 sm:px-4"
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
            <span className="shrink-0 rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
              live
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
