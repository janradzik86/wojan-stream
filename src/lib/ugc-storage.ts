import type { Track } from "./types";

const STORAGE_KEY = "wojan-ugc-tracks-v1";

export function loadUgcTracks(): Track[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Track[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUgcTracks(tracks: Track[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export function addUgcTrack(track: Track): Track[] {
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
