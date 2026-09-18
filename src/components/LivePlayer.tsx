"use client";

import {
  getLiveCtaLabels,
  getYouTubeEmbedUrl,
  isHlsUrl,
} from "@/lib/live";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  url: string;
  fullBleed?: boolean;
};

export function LivePlayer({ url, fullBleed }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const ytEmbed = getYouTubeEmbedUrl(url);
  const isHls = !ytEmbed && isHlsUrl(url);

  useEffect(() => {
    if (ytEmbed) return;
    setError(null);
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;

    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setError("Nie udało się odtworzyć streamu HLS.");
        });
      } else {
        setError("Ta przeglądarka nie obsługuje HLS.");
      }
    } else {
      video.src = url;
    }

    return () => {
      hls?.destroy();
    };
  }, [url, isHls, ytEmbed]);

  if (ytEmbed) {
    return (
      <div
        className={
          fullBleed
            ? "flex h-full w-full flex-col bg-black"
            : "overflow-hidden rounded-xl border border-amber-900/50 bg-black shadow-lg shadow-amber-950/40"
        }
      >
        <iframe
          className={
            fullBleed
              ? "h-full w-full flex-1 border-0 bg-black"
              : "aspect-video w-full border-0 bg-black"
          }
          src={`${ytEmbed}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          title="Wojan live"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div
      className={
        fullBleed
          ? "flex h-full w-full flex-col bg-black"
          : "overflow-hidden rounded-xl border border-amber-900/50 bg-black shadow-lg shadow-amber-950/40"
      }
    >
      <video
        ref={videoRef}
        className={
          fullBleed
            ? "h-full w-full flex-1 bg-black object-contain"
            : "aspect-video w-full bg-black"
        }
        controls
        autoPlay
        playsInline
        onError={() =>
          setError("Błąd odtwarzania. Sprawdź URL streamu (OBS / laptop).")
        }
      />
      {error && (
        <p className="border-t border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {!fullBleed && (
        <p className="break-all border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
          Źródło: {isHls ? "HLS" : "wideo bezpośrednie"} · {url}
        </p>
      )}
    </div>
  );
}

export function LiveOfflinePlaceholder() {
  const { labelOff, offlineTagline } = getLiveCtaLabels();

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-amber-900/60 bg-zinc-900/80 px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden>
        🐺
      </span>
      <div>
        <h2 className="text-lg font-extrabold uppercase tracking-tight text-amber-400">
          Live teraz
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{labelOff}</p>
        <p className="mt-3 text-sm text-zinc-500">{offlineTagline}</p>
      </div>
    </div>
  );
}
