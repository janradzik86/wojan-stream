# wojan-stream

Live-first player + UGC tracks for **Wojan / Czarne Wilki Prawdy**.

Stack: Next.js App Router · TypeScript · Tailwind. No paywall, no auth, no custom domain.

## Routes

| Route | Role |
|---|---|
| `/` | Avatar + name → Social bio → CTA live → sticky player → list **only `status=live`** → CTA UGC |
| `/live` | Full-bleed stream from `NEXT_PUBLIC_LIVE_STREAM_URL` (HLS or direct video). Empty → offline PL placeholder. No catalog. |
| `/tracks` | UGC upload (title + audio). Starts as `pending` (not on public list). |
| `/track/[id]` | Track detail from Hits fixture |

## Live URL

Set env:

```bash
NEXT_PUBLIC_LIVE_STREAM_URL=https://your-cdn.example/stream.m3u8
# or direct: https://….mp4 / OBS restream URL
```

Empty string → clear offline placeholder (PL). Supports laptop/OBS via that URL.

## Hits UGC v1

Canonical fixture: `data/tracks.fixture.json`

- Statuses: `pending` | `live` | `coming_soon`
- Seeds **Wilcza krew**, **Maska spada** = `coming_soon` only (not fake live releases)
- UGC uploads default to `pending`; public home list shows **only** `live`

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
- No auth / paywall / custom domain required for MVP
