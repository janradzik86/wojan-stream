import { LiveOfflinePlaceholder, LivePlayer } from "@/components/LivePlayer";
import { getLiveStreamUrl } from "@/lib/live";
import Link from "next/link";

export default function LivePage() {
  const url = getLiveStreamUrl();

  return (
    <div className="flex min-h-[calc(100dvh-3.25rem)] flex-col bg-black">
      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div>
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-amber-400">
            Live
          </h1>
          <p className="text-xs text-zinc-500">
            {url ? "Live teraz. Wejdź." : "Włącz stream — gramy na żywo."}
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-amber-400"
        >
          Start
        </Link>
      </div>

      <div className="relative flex-1 bg-black">
        {url ? (
          <div className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-contain">
            <LivePlayer url={url} fullBleed />
          </div>
        ) : (
          <div className="flex h-full min-h-[50dvh] items-center justify-center p-4">
            <LiveOfflinePlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}
