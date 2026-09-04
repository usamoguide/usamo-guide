import { Link } from 'gatsby';
import * as React from 'react';
import ExtrudedWordmark from './ExtrudedWordmark';
import GeometryField from './GeometryField';

export default function AetherFlowHero(): JSX.Element {
  const subtitles = React.useMemo(
    () => [
      'A structured pathway for learning competition maths.',
      'Curated topics from AMC foundations to Olympiad depth.',
      'Learn faster with battle-tested problem-solving tracks.',
      'Train with purpose, not guesswork.',
    ],
    []
  );

  const [subtitleIndex, setSubtitleIndex] = React.useState(0);
  const [typedSubtitle, setTypedSubtitle] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const entranceClass = (direction: 'up' | 'down' = 'up') =>
    direction === 'up' ? 'hero-enter-up' : 'hero-enter-down';
  const entranceDelay = (delay: number): React.CSSProperties => ({
    animationDelay: `${delay}ms`,
  });

  React.useEffect(() => {
    const current = subtitles[subtitleIndex];

    // With reduced motion requested, the line is shown outright and never
    // cycles. A caret typing itself out is exactly the kind of continuous
    // movement the preference is asking us to stop.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (typedSubtitle !== current) setTypedSubtitle(current);
      return;
    }

    if (!isDeleting && typedSubtitle === current) {
      const holdTimer = window.setTimeout(() => setIsDeleting(true), 1300);
      return () => window.clearTimeout(holdTimer);
    }

    if (isDeleting && typedSubtitle.length === 0) {
      setIsDeleting(false);
      setSubtitleIndex(prev => (prev + 1) % subtitles.length);
      return;
    }

    const speed = isDeleting ? 36 : 64;
    const timer = window.setTimeout(() => {
      setTypedSubtitle(prev =>
        isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      );
    }, speed);

    return () => window.clearTimeout(timer);
  }, [isDeleting, subtitleIndex, subtitles, typedSubtitle]);

  return (
    <div
      data-page-tone="dark"
      className="relative flex min-h-screen w-full flex-col overflow-hidden pt-20"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Ambient light sits behind the constructions. */}
      <div className="hero-ambient" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <GeometryField />

      {/* The ambient glow and the geometry field are clipped by the hero's
          overflow, which cut a hard horizontal seam where the section ends.
          This scrim dissolves both into the flat page instead. It sits above
          the artwork and below the content (z-10), so nothing readable dims. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 md:h-64"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--bg-page) 55%, transparent) 45%, var(--bg-page) 100%)',
        }}
      />

      {/* ── Top left info stack ── */}
      <div className="relative z-10 px-6 pt-6 md:px-10">
        <div
          className={`inline-flex flex-col items-center gap-3 ${entranceClass('down')}`}
          style={entranceDelay(0)}
        >
          <a
            href="https://discord.gg/WZge4DWUuy"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-chip"
          >
            <svg
              viewBox="0 0 640 512"
              fill="currentColor"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91 337.461 337.461 0 0 0-14.9 30.6 447.848 447.848 0 0 0-134.426 0 309.541 309.541 0 0 0-15.135-30.6 1.89 1.89 0 0 0-1.924-.91A483.689 483.689 0 0 0 116.085 69.14a1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375 487.666 487.666 0 0 0 146.825 74.189 1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.12 430.4a1.86 1.86 0 0 0-1.019-2.588 321.173 321.173 0 0 1-45.868-21.853 1.885 1.885 0 0 1-.185-3.126 251.047 251.047 0 0 0 9.109-7.137 1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233 234.533 234.533 0 0 0 9.132 7.16 1.884 1.884 0 0 1-.162 3.126 301.407 301.407 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.055 391.055 0 0 0 30.014 48.815 1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352c12.264-126.783-20.532-236.912-86.934-334.541ZM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239 0 32.654-23.41 59.241-52.843 59.241Zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.82 52.844 59.239 0 32.654-23.177 59.241-52.844 59.241Z" />
            </svg>
            <span>Join the Discord</span>
          </a>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center md:pb-32">
        {/* Attribution, set as a plain sentence rather than a tracked-out
            uppercase chip. It is a claim about who wrote the material, so it
            should read as language, not as a badge. */}
        <p
          className={`mb-6 text-sm font-medium ${entranceClass('down')}`}
          style={{ ...entranceDelay(120), color: 'var(--text-secondary)' }}
        >
          Written by USA(J)MO medalists
        </p>

        <div className={entranceClass()} style={entranceDelay(240)}>
          <ExtrudedWordmark lead="USAMO" trail="Guide" />
        </div>

        <p
          className={`mt-5 min-h-[2rem] max-w-2xl text-lg font-medium md:min-h-[2.25rem] md:text-xl ${entranceClass()}`}
          style={{ ...entranceDelay(560), color: 'var(--text-secondary)' }}
        >
          {typedSubtitle}
          <span
            aria-hidden="true"
            className="hero-caret ml-1 inline-block h-[1.05em] w-[0.075em] align-[-0.15em]"
          />
        </p>

        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-3 ${entranceClass()}`}
          style={entranceDelay(680)}
        >
          <Link to="/dashboard" className="btn btn-lg btn-primary">
            Start learning
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 8h11M9.5 4l4 4-4 4" />
            </svg>
          </Link>
          <Link to="/foundations" className="btn btn-lg btn-secondary">
            Browse topics
          </Link>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`relative z-10 ml-auto flex max-w-2xl flex-col items-center gap-3 px-12 pt-6 pb-12 text-right ${entranceClass()}`}
        style={entranceDelay(800)}
      >
        {/* Bottom-right: Open source */}
        <a
          href="https://github.com/usamoguide/usamo-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-chip"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 shrink-0 fill-current"
            aria-hidden="true"
          >
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span>Star us on GitHub</span>
        </a>

        <p
          className="max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Every module, problem, and solution on this site is{' '}
          <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            open source
          </strong>
          .
        </p>
      </div>
    </div>
  );
}
