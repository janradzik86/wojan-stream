"use client";

import { useState } from "react";
import type { Track } from "@/lib/types";
import { addUgcTrack, fileToDataUrl } from "@/lib/ugc-storage";

type Props = {
  onUploaded?: (tracks: Track[]) => void;
};

export function TrackUpload({ onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!file) {
      setErr("Wybierz plik audio (mp3, wav, ogg, m4a).");
      return;
    }
    const finalTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
    setBusy(true);
    try {
      let audioUrl: string | undefined;

      const form = new FormData();
      form.append("file", file);
      form.append("title", finalTitle);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (res.ok) {
          const data = (await res.json()) as { url?: string };
          if (data.url) audioUrl = data.url;
        }
      } catch {
        /* Vercel FS often read-only — fall back */
      }

      if (!audioUrl) {
        if (file.size > 4 * 1024 * 1024) {
          setErr(
            "Plik >4 MB — na Vercel bez blob storage użyj mniejszego pliku do demo, albo uruchom lokalnie (public/uploads).",
          );
          setBusy(false);
          return;
        }
        audioUrl = await fileToDataUrl(file);
      }

      const now = new Date().toISOString();
      const track: Track = {
        id: `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: finalTitle,
        status: "pending",
        uploader_id: "community",
        uploader_display: "Społeczność",
        source: "ugc",
        artist_display: "Społeczność",
        audio_url: audioUrl,
        video_url: null,
        has_video: false,
        cover_url: null,
        sort_order: Date.now(),
        moderation_note: "awaiting review",
        created_at: now,
        updated_at: now,
        published_at: null,
        description: "UGC — czeka na moderację. Nie na liście publicznej.",
        tags: ["ugc"],
      };

      const next = addUgcTrack(track);
      onUploaded?.(next);
      setTitle("");
      setFile(null);
      setMsg(
        "Dzięki. Track czeka na review (status: pending). Nie pojawi się na publicznej liście, dopóki nie dostanie statusu live.",
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload się nie udał.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-amber-900/40 bg-zinc-900/60 p-4 sm:p-5"
    >
      <h2 className="text-base font-extrabold uppercase tracking-tight text-amber-400">
        Wrzuć swój track
      </h2>
      <p className="text-sm leading-relaxed text-zinc-400">
        Tytuł + audio. Upload startuje jako <strong className="text-zinc-200">pending</strong>{" "}
        — dopiero po moderacji wchodzi na listę live. Bez paywalla, bez logowania.
      </p>
      <label className="block text-sm">
        <span className="text-zinc-400">Tytuł</span>
        <input
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-zinc-100 outline-none focus:border-amber-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł tracka"
          maxLength={120}
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-400">Audio</span>
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
          className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-amber-700 file:px-3 file:py-2 file:text-sm file:font-bold file:uppercase file:text-white hover:file:bg-amber-600"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-amber-600 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-zinc-950 hover:bg-amber-500 disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Wrzucam…" : "Wrzuć swój track"}
      </button>
      {msg && (
        <p className="rounded-md border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm leading-relaxed text-emerald-300">
          {msg}
        </p>
      )}
      {err && <p className="text-sm text-red-400">{err}</p>}
    </form>
  );
}
