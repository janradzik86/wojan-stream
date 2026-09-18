import type { Track } from "./types";

/** Current UGC-only bag (community uploads). Never store Hits fixture here. */
const STORAGE_KEY = "wojan-ugc-tracks-v2";

/** Legacy keys that may hold a full/demo catalog from early scaffolds. */
const LEGACY_KEYS = [
  "wojan-ugc-tracks-v1",
  "wojan-catalog",
  "wojan-tracks",
  "wojan-stream-catalog",
  "wojan-stream-tracks",
];

const DEMO_TITLE_RE = /^Przykład UGC/i;

function isDemoOrFixturePolluter(t: Track): boolean {
  if (!t || typeof t !== "object") return true;
  if (typeof t.id === "string") {
    if (t.id.startsWith("trk_ugc_example")) return true;
    if (t.id.startsWith("trk_yt_")) return true;
    if (t.id.startsWith("trk_seed_")) return true;
  }
  if (typeof t.title === "string" && DEMO_TITLE_RE.test(t.title)) return true;
  if (typeof t.audio_url === "string" && t.audio_url.includes("example.com")) {
    return true;
  }
  if (t.source === "official" || t.source === "seed" || t.source === "placeholder") {
    return true;
  }
  return false;
}

function looksLikeStaleFullCatalog(tracks: Track[]): boolean {
  if (!Array.isArray(tracks) || tracks.length === 0) return false;
  // Fixture dump leaked into LS — ignore entirely
  return tracks.some(
    (t) =>
      t?.id?.startsWith("trk_yt_") ||
      t?.id?.startsWith("trk_seed_") ||
      t?.id?.startsWith("trk_ugc_example") ||
      t?.source === "official" ||
      (typeof t?.title === "string" && DEMO_TITLE_RE.test(t.title)),
  );
}

function readRaw(key: string): Track[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Track[]) : null;
  } catch {
    return null;
  }
}

/**
 * On boot: drop legacy / conflicting catalogs so cold paint never flashes
 * „Przykład UGC” or other fixture demos from stale localStorage.
 * Keeps real community uploads (ugc-* ids) when they are not polluters.
 */
export function purgeStaleUgcCatalog(): void {
  if (typeof window === "undefined") return;

  for (const key of LEGACY_KEYS) {
    const tracks = readRaw(key);
    if (tracks === null) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      continue;
    }
    if (looksLikeStaleFullCatalog(tracks) || tracks.some(isDemoOrFixturePolluter)) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      continue;
    }
    // Migrate clean community-only uploads to v2
    const clean = tracks.filter((t) => !isDemoOrFixturePolluter(t));
    try {
      localStorage.removeItem(key);
      if (clean.length) {
        const existing = loadUgcTracksRaw();
        const byId = new Map<string, Track>();
        for (const t of [...existing, ...clean]) {
          if (t?.id) byId.set(t.id, t);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...byId.values()]));
      }
    } catch {
      /* ignore */
    }
  }

  // Scrub current key if it was polluted
  const current = loadUgcTracksRaw();
  if (looksLikeStaleFullCatalog(current) || current.some(isDemoOrFixturePolluter)) {
    const clean = current.filter((t) => !isDemoOrFixturePolluter(t));
    try {
      if (clean.length === 0) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {
      /* ignore */
    }
  }
}

function loadUgcTracksRaw(): Track[] {
  if (typeof window === "undefined") return [];
  const parsed = readRaw(STORAGE_KEY);
  return parsed ?? [];
}

export function loadUgcTracks(): Track[] {
  if (typeof window === "undefined") return [];
  purgeStaleUgcCatalog();
  return loadUgcTracksRaw().filter((t) => !isDemoOrFixturePolluter(t));
}

export function saveUgcTracks(tracks: Track[]): void {
  if (typeof window === "undefined") return;
  const clean = tracks.filter((t) => !isDemoOrFixturePolluter(t));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

export function addUgcTrack(track: Track): Track[] {
  if (isDemoOrFixturePolluter(track)) {
    return loadUgcTracks();
  }
  const next = [track, ...loadUgcTracks()];
  saveUgcTracks(next);
  return next;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
