import Link from "next/link";
import { artist, getLiveTracks } from "@/lib/catalog";
import { TrackList } from "@/components/TrackList";
import { StickyPlayer } from "@/components/StickyPlayer";
import { getLiveStreamUrl } from "@/lib/live";

export default function HomePage() {
  const liveTracks = getLiveTracks();
  const featured = liveTracks[0] ?? null;
  const streamOn = Boolean(getLiveStreamUrl());

  return (
    <>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-6 sm:max-w-5xl sm:pb-32 sm:pt-8">
        <section className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-700/60 bg-zinc-900 text-5xl shadow-lg shadow-amber-950/40 sm:h-28 sm:w-28"
            aria-hidden
          >
            {artist.avatar_emoji}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-3xl">
            {artist.name}
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
            {artist.project}
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <p className="text-base leading-relaxed text-zinc-300">{artist.bio}</p>
          <p className="text-sm leading-relaxed text-zinc-400">{artist.about}</p>
        </section>

        <section className="mt-8">
          <Link
            href="/live"
            className="flex w-full items-center justify-center rounded-xl bg-amber-600 px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-wide text-zinc-950 hover:bg-amber-500"
          >
            {streamOn ? "Live teraz. Wejdź." : "Włącz stream — gramy na żywo."}
          </Link>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Na żywo w playerze
          </h2>
          <TrackList
            tracks={liveTracks}
            emptyText="Brak tracków ze statusem live. Seed (Wilcza krew, Maska spada) to coming_soon — nie fake releases. Pending UGC nie jest na liście."
          />
        </section>

        <section className="mt-8">
          <Link
            href="/tracks"
            className="flex w-full items-center justify-center rounded-xl border-2 border-amber-700/70 px-5 py-3.5 text-center text-sm font-extrabold uppercase tracking-wide text-amber-400 hover:bg-amber-950/40"
          >
            Wrzuć swój track
          </Link>
        </section>
      </main>

      <StickyPlayer
        src={featured?.audio_url ?? null}
        title={featured?.title ?? null}
      />
    </>
  );
}
