import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackById } from "@/lib/catalog";
import { AudioPlayer } from "@/components/AudioPlayer";
import { isYouTubeUrl } from "@/lib/youtube";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TrackPage({ params }: Props) {
  const { id } = await params;
  const track = getTrackById(decodeURIComponent(id));
  if (!track) notFound();

  const canPlay = track.status === "live" && Boolean(track.audio_url);
  const yt =
    canPlay && track.audio_url ? isYouTubeUrl(track.audio_url) : false;

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-2xl sm:py-8">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {track.status}
        {track.source ? ` · ${track.source}` : ""}
      </p>
      <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-amber-400">
        {track.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {track.artist_display ?? track.uploader_display ?? track.uploader_id}
      </p>
      {track.description && (
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          {track.description}
        </p>
      )}

      <div className="mt-6">
        {canPlay && track.audio_url ? (
          <AudioPlayer src={track.audio_url} title={track.title} />
        ) : track.status === "coming_soon" ? (
          <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-zinc-500">
            Coming soon — brak mastera. To seed Hits, nie fake live release.
          </p>
        ) : track.status === "pending" ? (
          <p className="rounded-xl border border-dashed border-yellow-900/50 px-4 py-6 text-sm text-yellow-200/80">
            Pending review — nie odtwarzamy publicznie, dopóki nie dostanie
            statusu live.
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-zinc-500">
            Brak audio_url dla statusu live.
          </p>
        )}
      </div>

      {/* Non-YouTube video_url only — YT already shown via AudioPlayer embed */}
      {track.video_url &&
        track.status === "live" &&
        !isYouTubeUrl(track.video_url) &&
        !yt && (
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
            <video
              className="aspect-video w-full bg-black"
              controls
              src={track.video_url}
              playsInline
            />
          </div>
        )}

      <p className="mt-10 text-center text-sm">
        <Link
          href="/"
          className="font-bold uppercase text-amber-500 hover:text-amber-400"
        >
          ← Start
        </Link>
      </p>
    </main>
  );
}
