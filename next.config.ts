import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Live now (Jan / Szef) — YouTube Live embed
    NEXT_PUBLIC_LIVE_STREAM_URL:
      process.env.NEXT_PUBLIC_LIVE_STREAM_URL ??
      "https://www.youtube.com/embed/wsNaZ67Rito",
  },
};

export default nextConfig;
