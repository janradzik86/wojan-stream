"use client";

type Props = {
  src: string;
  title?: string;
};

export function AudioPlayer({ src, title }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      {title && (
        <p className="mb-2 text-sm font-medium text-amber-300">{title}</p>
      )}
      <audio className="w-full" controls preload="metadata" src={src}>
        Twoja przeglądarka nie obsługuje odtwarzacza audio.
      </audio>
    </div>
  );
}
