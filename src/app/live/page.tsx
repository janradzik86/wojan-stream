import { AutoLivePlayer } from "@/components/AutoLivePlayer";
import { PageMark } from "@/components/PageMark";
import Link from "next/link";

export default function LivePage() {
  return (
    <div className="flex min-h-[calc(100dvh-3.25rem)] flex-col">
      <PageMark page="live" />
      <header className="space-y-3 border-b border-amber-900/40 px-3 py-4 sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-extrabold uppercase tracking-tight text-amber-400 sm:text-lg">
              Live — Wojan / Czarne Wilki Prawdy
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              Gramy teraz. Bez paywalla, bez filtrów.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-amber-400"
          >
            Start
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="#stream"
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-zinc-950 hover:bg-amber-500"
          >
            Oglądaj stream
          </a>
          <Link
            href="/tracks"
            className="inline-flex items-center justify-center rounded-xl border-2 border-amber-700/70 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-amber-400 hover:bg-amber-950/40"
          >
            Wrzuć swój track
          </Link>
        </div>
      </header>

      <div
        id="stream"
        className="live-stream-glow relative flex-1 scroll-mt-4 bg-black"
      >
        <AutoLivePlayer />
      </div>

      <footer className="border-t border-zinc-800 px-3 py-3 text-center sm:px-4">
        <p className="break-all text-xs text-zinc-500">
          Auto-live z{" "}
          <a
            className="text-amber-400/90 hover:text-amber-300"
            href="https://www.youtube.com/@czarnewilkiprawdy"
            target="_blank"
            rel="noreferrer"
          >
            youtube.com/@czarnewilkiprawdy
          </a>
          {" · "}
          <a
            className="text-amber-400/90 hover:text-amber-300"
            href="https://wojan-stream.vercel.app/live"
          >
            wojan-stream.vercel.app/live
          </a>
        </p>
      </footer>
    </div>
  );
}
