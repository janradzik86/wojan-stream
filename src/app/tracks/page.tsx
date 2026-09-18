import { TrackUpload } from "@/components/TrackUpload";
import { MyPendingPanel } from "@/components/MyPendingPanel";
import { getComingSoonTracks } from "@/lib/catalog";
import Link from "next/link";

export default function TracksPage() {
  const coming = getComingSoonTracks();

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-2xl sm:py-8">
      <h1 className="text-xl font-extrabold uppercase tracking-tight text-amber-400">
        Wrzuć swój track
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Upload społecznościowy. Po wrzuceniu status ={" "}
        <strong className="text-zinc-200">pending</strong> — czeka na review.
        Pending <strong className="text-zinc-200">nie</strong> trafia na
        publiczną listę na stronie głównej.
      </p>

      <div className="mt-6">
        <TrackUpload />
      </div>

      <div className="mt-8">
        <MyPendingPanel />
      </div>

      {coming.length > 0 && (
        <section className="mt-10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Coming soon (seed Hits)
          </h2>
          <ul className="space-y-2">
            {coming.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-3"
              >
                <p className="text-sm font-medium text-zinc-200">{t.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  coming_soon · nie fake live · {t.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-center text-sm">
        <Link href="/" className="font-bold uppercase text-amber-500 hover:text-amber-400">
          ← Start
        </Link>
      </p>
    </main>
  );
}
