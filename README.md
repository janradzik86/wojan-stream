# wojan-stream

Live-first player + UGC tracks for **Wojan / Czarne Wilki Prawdy**.

Stack: Next.js App Router · TypeScript · Tailwind. No paywall, no auth, no custom domain.

## Routes

| Route | Role |
|---|---|
| `/` | Avatar + name → Social bio → CTA live → hero YT embed → list **only `status=live`** → compact sticky player → CTA UGC |
| `/live` | Full-bleed stream from `NEXT_PUBLIC_LIVE_STREAM_URL` (YouTube Live / embed, HLS, or direct video). Empty → offline PL placeholder. No catalog. |
| `/tracks` | UGC upload (title + audio). Starts as `pending` (not on public list). |
| `/track/[id]` | Track detail — full YT iframe or direct audio |

## Live URL

/live no longer pins the player to one old YouTube video ID.

The page polls /api/live-source and resolves the current YouTube Live for the configured channel. When a fresh live appears, the player switches only when the source key changes, so normal playback is not remounted every poll.

Configuration:

```bash
YOUTUBE_CHANNEL_HANDLE=@CzarneWilkiPrawdy
# Best option when known:
# YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx

# Optional non-YouTube/HLS fallback:
# NEXT_PUBLIC_LIVE_STREAM_URL=https://example.com/live.m3u8
```

Resolution order:
1. current live video discovered from the channel /live page,
2. channel-level YouTube live embed,
3. explicit fallback URL,
4. offline placeholder.

The endpoint is no-store, so a deleted previous recording is not treated as the live source.

## Hits UGC v2

Canonical fixture: `data/tracks.fixture.json` (+ `data/catalog.json`, `data/playlist-live.json` for live pin)

- Statuses: `pending` | `live` | `coming_soon`
- Official shortlist: **14 live** YouTube watch URLs (`@CzarneWilkiPrawdy`) + **2 coming_soon** seeds (Wilcza krew, Maska spada) + **1 pending** UGC example
- Seeds stay `coming_soon` only (not fake live releases)
- Public home list shows **only** `live`
- Player embeds YouTube watch URLs; sticky bar stays compact (cover/title/play) — full 16:9 iframe only in home hero or `/track/[id]`

## UGC upload (MVP)

1. `POST /api/upload` — multipart → writes `public/uploads/` when FS writable (local).
2. On Vercel (read-only FS) client falls back to base64 in `localStorage` (demo only).
3. **Production:** wire Vercel Blob / S3; do not rely on `public/uploads` or localStorage.

## Dev

```bash
cp .env.example .env.local
npm install
npm run dev
npm run build
```

## Deploy (Vercel)

- Import `janradzik86/wojan-stream`
- Set `NEXT_PUBLIC_LIVE_STREAM_URL` if streaming
- Preview: https://wojan-stream.vercel.app
- No auth / paywall / custom domain required for MVP
