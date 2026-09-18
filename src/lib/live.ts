export function getLiveStreamUrl(): string {
  return (process.env.NEXT_PUBLIC_LIVE_STREAM_URL ?? "").trim();
}

export function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}
