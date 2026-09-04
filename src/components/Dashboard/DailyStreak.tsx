import * as React from 'react';
import { useState } from 'react';
import { useLastVisitInfo } from '../../context/UserDataContext/properties/lastVisit';

// note: insights are unlocked in order

const ComeBackTimer = ({ tomorrowMilliseconds }) => {
  const [milliseconds, setMilliseconds] = React.useState(
    tomorrowMilliseconds - Date.now()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMilliseconds(Math.max(0, tomorrowMilliseconds - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const ms = Math.max(0, milliseconds); // Clamp to zero
  const days = Math.floor(ms / 1000 / 60 / 60 / 24);
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const seconds = Math.floor((ms / 1000) % 60);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div>
      <p
        className="font-mono text-xl tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {hours}:{pad(minutes)}:{pad(seconds)}
      </p>
      <p className="mt-2">
        {days
          ? `Unlocks in ${days + 1} days.`
          : 'Until the next insight unlocks.'}
      </p>
    </div>
  );
};

const PhotoCard = ({ text, day, tomorrowMilliseconds }) => {
  return (
    <div className="w-full">
      <div
        className="flex flex-col overflow-hidden rounded-xl border"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div
          className="border-b px-5 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3
            className="text-[0.8125rem] font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            Day {day}
          </h3>
        </div>
        <div className="relative overflow-hidden">
          {tomorrowMilliseconds >= 0 ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-5 text-center text-sm leading-6"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
            >
              <ComeBackTimer tomorrowMilliseconds={tomorrowMilliseconds} />
            </div>
          ) : null}
          {/* The blur here is content-hiding, not decoration: it keeps an
              unearned insight unreadable rather than making a panel look
              glassy. */}
          <div
            className="flex min-h-[132px] items-center justify-center px-6 py-8 text-center text-base leading-7 font-medium text-balance"
            style={
              tomorrowMilliseconds >= 0
                ? {
                    background: 'var(--bg-surface-alt)',
                    color: 'var(--text-primary)',
                    filter: 'blur(6px)',
                  }
                : {
                    background: 'var(--bg-surface-alt)',
                    color: 'var(--text-primary)',
                  }
            }
            aria-hidden={tomorrowMilliseconds >= 0 ? 'true' : undefined}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DailyStreak({ streak }) {
  const insights = React.useMemo(
    () => [
      'Look for symmetry first; it often halves your work.',
      'Try small cases to guess a pattern, then prove it.',
      'Write what you know, then simplify aggressively.',
      'Check equality cases to guide substitutions.',
      'Diagram everything in geometry, even if it feels obvious.',
      'Use invariants when a process repeats.',
      'If counting is messy, try the complement.',
      'Think about parity whenever integers appear.',
      'When stuck, reframe the problem with new variables.',
      'Clean write-ups win partial credit and full credit.',
    ],
    []
  );
  const { lastVisitDate } = useLastVisitInfo();

  // we don't want to render streaks during Server-Side Generation
  const [firstRender, setFirstRender] = useState(true);
  React.useEffect(() => {
    setFirstRender(false);
  }, []);
  if (firstRender) return null;

  const generatePrimes = (): number[] => {
    const primes: number[] = [];
    for (let i = 2; primes.length < insights.length; ++i) {
      let composite = false;
      for (let j = 2; j * j <= i; ++j) if (i % j == 0) composite = true;
      if (!composite) primes.push(i);
    }
    return primes;
  };
  const times = generatePrimes();

  let maxInd = 0;
  while (maxInd < times.length && times[maxInd] <= streak) maxInd++;
  const getComponent = (i): React.ReactElement => {
    if (times[i] <= streak) {
      return (
        <PhotoCard
          key={i}
          text={insights[i]}
          day={times[i]}
          tomorrowMilliseconds={-1}
        />
      );
    }
    if (i == times.length) {
      return (
        <div key={times.length}>
          <div
            className="flex flex-col overflow-hidden rounded-xl border"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="p-5">
              <h3
                className="text-[0.9375rem] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                You've unlocked every insight
              </h3>
              <p
                className="mt-1 text-sm leading-6"
                style={{ color: 'var(--text-muted)' }}
              >
                That's all of them for now. If you want to write more, the
                contact link at the bottom of the page reaches us.
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <PhotoCard
          key={i}
          text={insights[i]}
          day={times[i]}
          tomorrowMilliseconds={
            lastVisitDate +
            1000 * 60 * 60 * 20 +
            1000 * 60 * 60 * 24 * (times[i] - streak - 1)
          }
        />
      );
    }
  };
  /* Newest first. One flat list — the grid handles the columns, so each card
     is rendered once instead of twice with alternates hidden per breakpoint. */
  const insightCards = () => {
    const items: React.ReactElement[] = [];
    for (let i = maxInd; i >= 0; --i) items.push(getComponent(i));
    return items;
  };
  return (
    <>
      {/* Reported as a fact, not cheered at. A visit streak is a weak signal
          about studying, so it gets stated plainly and left alone — no flame,
          no exclamation, no "keep it up". */}
      <div
        className="rounded-xl border"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 p-5">
          <h3
            className="text-[0.9375rem] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Visit streak
          </h3>
          <p
            className="font-mono text-sm tabular-nums"
            style={{ color: 'var(--text-muted)' }}
          >
            <span style={{ color: 'var(--text-primary)' }}>{streak}</span>{' '}
            consecutive day{streak !== 1 && 's'}
          </p>
          <p
            className="w-full text-sm leading-6"
            style={{ color: 'var(--text-muted)' }}
          >
            A new insight unlocks on each prime-numbered day. Breaking the
            streak clears the ones you have.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">{insightCards()}</div>
    </>
  );
}
