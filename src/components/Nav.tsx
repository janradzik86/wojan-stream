import Link from "next/link";

const links = [
  { href: "/", label: "Start" },
  { href: "/live", label: "Live" },
  { href: "/tracks", label: "Wrzuć" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/40 bg-zinc-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden>
            🐺
          </span>
          <span className="text-sm font-extrabold uppercase tracking-tight text-amber-400 sm:text-base">
            Wojan
          </span>
        </Link>
        <ul className="flex items-center gap-0.5">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-md px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-300 hover:bg-zinc-800 hover:text-amber-300 sm:px-3 sm:text-sm"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
