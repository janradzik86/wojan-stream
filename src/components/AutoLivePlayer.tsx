"use client";

import { LiveOfflinePlaceholder, LivePlayer } from "@/components/LivePlayer";
import { useCallback, useEffect, useRef, useState } from "react";

type LiveSource = {
  mode: "youtube-live-video" | "youtube-channel-live" | "fallback" | "offline";
  url: string;
  key: string;
  liveVideoId?: string | null;
  channelId?: string | null;
};

const POLL_MS = 20_000;

export function AutoLivePlayer() {
  const [source, setSource] = useState<LiveSource | null>(null);
  const [loading, setLoading] = useState(true);
  const lastKey = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/live-source?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const next = (await res.json()) as LiveSource;

      // Do not remount the player every 20 seconds. Only switch when the
      // actual live source changes, e.g. when a fresh YouTube live appears.
      if (lastKey.current !== next.key) {
        lastKey.current = next.key;
        setSource(next);
      } else if (!source) {
        setSource(next);
      }
    } catch {
      // Keep the last working source on temporary lookup failures.
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  if (loading && !source) {
    return (
      <div className="flex h-full min-h-[50dvh] items-center justify-center bg-black text-sm text-zinc-400">
        Szukam aktualnej transmisji…
      </div>
    );
  }

  if (!source?.url) {
    return (
      <div className="flex h-full min-h-[50dvh] items-center justify-center p-4">
        <LiveOfflinePlaceholder />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 min-h-[50dvh] [&_iframe]:h-full [&_iframe]:w-full [&_video]:h-full [&_video]:w-full [&_video]:object-contain">
      <LivePlayer key={source.key} url={source.url} fullBleed />
    </div>
  );
}
