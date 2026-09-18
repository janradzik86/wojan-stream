import catalogJson from "../../data/catalog.json";
import fixtureJson from "../../data/tracks.fixture.json";
import type { ArtistProfile, Track, TracksFixture } from "./types";

export const fixture = fixtureJson as TracksFixture;

export const artist: ArtistProfile = {
  name: catalogJson.artist.name,
  project: catalogJson.artist.project,
  bio: catalogJson.artist.bio,
  about: catalogJson.artist.about,
  avatar_emoji: catalogJson.artist.avatar_emoji,
};

export function getAllFixtureTracks(): Track[] {
  return [...fixture.tracks].sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Public home list: ONLY status=live with audio_url
 * (YouTube watch URLs allowed — player embeds).
 * pending / coming_soon stay off the public list.
 */
export function getLiveTracks(): Track[] {
  return getAllFixtureTracks().filter(
    (t) => t.status === "live" && Boolean(t.audio_url),
  );
}

export function getTrackById(id: string): Track | undefined {
  return fixture.tracks.find((t) => t.id === id);
}

export function getComingSoonTracks(): Track[] {
  return getAllFixtureTracks().filter((t) => t.status === "coming_soon");
}
