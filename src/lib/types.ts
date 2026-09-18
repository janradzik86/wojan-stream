/** Hits UGC schema — aligned with data/tracks.fixture.json (v2) */
export type TrackStatus = "pending" | "live" | "coming_soon";

export type TrackSource =
  | "seed"
  | "ugc"
  | "catalog"
  | "placeholder"
  | "official";

export type Track = {
  id: string;
  title: string;
  status: TrackStatus;
  uploader_id: string;
  uploader_display?: string;
  source: TrackSource;
  artist_display?: string;
  /** Required when status === "live" — may be YouTube watch URL (player embeds) */
  audio_url?: string | null;
  video_url?: string | null;
  has_video?: boolean;
  cover_url?: string | null;
  description?: string;
  tags?: string[];
  sort_order: number;
  moderation_note?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  placeholder?: boolean;
};

export type TracksFixture = {
  version: number;
  catalog: string;
  statuses: TrackStatus[];
  rules: {
    live_requires_audio_url: boolean;
    video_optional: boolean;
    ugc_default_status: TrackStatus;
    seed_only_as_coming_soon_after_jan_ok: boolean;
    v1_official_source?: string;
    embed_note?: string;
  };
  tracks: Track[];
};

export type ArtistProfile = {
  name: string;
  project: string;
  bio: string;
  about: string;
  avatar_emoji: string;
};
