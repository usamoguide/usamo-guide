import { Link } from 'gatsby';
import * as React from 'react';

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

  React.useEffect(() => {
    const current = subtitles[subtitleIndex];

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
      <div
        className="pointer-events-none absolute inset-0 z-0 scale-105 blur-[10px]"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/b4/d7/31/b4d7313c871ef0e4b2a56b0bc1cd2c6c.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ── Top left info stack ── */}
      <div className="relative z-10 px-6 pt-6 md:px-10">
        <div className="inline-flex flex-col items-center gap-3">
          <a
            href="https://discord.gg/WZge4DWUuy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 font-mono text-[11px] font-bold tracking-[0.24em] text-[#F5F0FA] uppercase backdrop-blur-md transition-colors hover:bg-white/[0.12]"
          >
            <img
              src="/images/discord.svg"
              alt=""
              aria-hidden="true"
              className="h-4 w-4 flex-shrink-0"
            />
            <span>Discord</span>
          </a>

          <p className="max-w-xl font-mono text-[11px] leading-relaxed font-bold tracking-[0.24em] text-[#F5F0FA] uppercase opacity-90">
            Join our community!
          </p>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 inline-flex items-center rounded-full bg-white/[0.08] px-4 py-2 font-mono text-[11px] font-bold tracking-[0.28em] text-[#F5F0FA] uppercase backdrop-blur-md">
          {'Written by USA(J)MO Medalists'}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-end md:gap-6">
          <div className="relative inline-block">
            <h1 className="font-mono text-6xl font-extrabold tracking-tight text-[#F5F0FA] md:text-8xl lg:text-9xl">
              {'USAMO Guide'}
            </h1>
            <img
              src="/images/Titlemascot.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -top-6 -right-5 hidden w-16 rotate-[14deg] min-[770px]:block md:-top-8 md:-right-7 md:w-20 lg:-top-10 lg:-right-9 lg:w-24"
            />
          </div>
        </div>

        <p className="mt-5 min-h-[2.25rem] font-mono text-xl font-semibold text-[#F1EAF7] md:min-h-[2.5rem] md:text-2xl">
          {typedSubtitle}
          <span className="ml-1 inline-block h-[1.05em] w-[0.09em] animate-pulse bg-[#F1EAF7] align-[-0.15em]" />
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
            style={
              {
                border: '1px solid rgba(240, 194, 255, 0.34)',
                background: '#6D3B9F',
                boxShadow: 'none',
                '--pme-color': '#F4EDEA',
                '--pme-hover-color': '#201C36',
                '--pme-wipe-bg': '#F0C2FF',
              } as React.CSSProperties
            }
          >
            Start Learning &gt;
          </Link>
          <Link
            to="/foundations"
            className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
            style={
              {
                border: '1px solid rgba(240, 194, 255, 0.34)',
                background: '#EFE3FF',
                boxShadow: 'none',
                '--pme-color': '#2C1842',
                '--pme-hover-color': '#201C36',
                '--pme-wipe-bg': '#F0C2FF',
              } as React.CSSProperties
            }
          >
            Browse Topics
          </Link>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 ml-auto flex max-w-2xl flex-col items-center gap-3 px-12 pt-6 pb-12 text-right">
        {/* Bottom-right: Open source */}
        <a
          href="https://github.com/usamoguide/usamo-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 font-mono text-[11px] font-bold tracking-[0.24em] text-[#F5F0FA] uppercase backdrop-blur-md transition-colors hover:bg-white/[0.12]"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4 flex-shrink-0 fill-current"
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
          <span>Star us on Github</span>
        </a>

        <p className="max-w-xl font-mono text-[11px] leading-relaxed font-bold tracking-[0.24em] text-[#F5F0FA] uppercase opacity-90">
          We are fully{' '}
          <strong className="font-bold text-[#FBF7FF]">open source</strong>.
        </p>
      </div>
    </div>
  );
}
