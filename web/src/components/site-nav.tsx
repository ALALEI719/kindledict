import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-bold text-[var(--text)]">
          Kindle<span className="text-[var(--accent)]">Dict</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/#how-it-works"
            className="hidden text-[var(--muted)] hover:text-[var(--text)] sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/app"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            Build dictionary
          </Link>
        </div>
      </div>
    </nav>
  );
}
