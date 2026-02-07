import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      <section className="flex flex-col gap-8 pt-4 text-center sm:pt-8 sm:gap-10">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
          Think clearly. Choose confidently.
        </p>
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
          Your operating system
          <br />
          <span className="text-[var(--accent)]">for decisions</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Capture what you&apos;re deciding, frame your options, and record how
          it went. Build a decision journal that makes you better at choosing.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/decisions/new"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-8 text-base font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
          >
            Create your first decision
          </Link>
          <Link
            href="/decisions"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            View decisions
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-3 text-2xl font-semibold text-[var(--foreground)]">
            Capture
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Write down the decision in your own words. Context matters — so does
            the moment you&apos;re in.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-3 text-2xl font-semibold text-[var(--foreground)]">
            Frame
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Add options and pros or cons. No framework imposed — structure it
            the way you think.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-3 text-2xl font-semibold text-[var(--foreground)]">
            Reflect
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Record what you chose and how it turned out. Your past decisions
            become your best teacher.
          </p>
        </div>
      </section>
    </div>
  );
}
