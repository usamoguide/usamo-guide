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

  return (
    <div>
      Come back in
      <p className="my-2 text-2xl">
        {hours} hours {minutes} minutes {seconds} seconds
      </p>
      to {days ? 'continue your streak' : 'unlock this math insight'}!
      {days ? ` Insight unlocks after ${days + 1} days.` : null}
    </div>
  );
};

const PhotoCard = ({ text, day, tomorrowMilliseconds, hiddenOnDesktop }) => {
  return (
    <div className={'mb-8 w-full' + (hiddenOnDesktop ? ' lg:hidden' : '')}>
      <div
        className="flex flex-col overflow-hidden sm:rounded-2xl"
        style={{
          background: 'rgba(43, 30, 57, 0.92)',
        }}
      >
        <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <h3
            className="text-lg leading-6 font-medium"
            style={{ color: '#F4EDEA' }}
          >
            Day {day} Insight
          </h3>
        </div>
        <div className="relative overflow-hidden">
          {tomorrowMilliseconds >= 0 ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-base font-medium"
              style={{ background: 'rgba(32, 28, 54, 0.24)', color: '#F4EDEA' }}
            >
              <ComeBackTimer tomorrowMilliseconds={tomorrowMilliseconds} />
            </div>
          ) : null}
          <div
            className="flex min-h-[220px] items-center justify-center px-6 py-10 text-center text-lg font-semibold"
            style={
              tomorrowMilliseconds >= 0
                ? {
                    background: 'rgba(244, 237, 234, 0.08)',
                    color: '#F0C2FF',
                    filter: 'blur(6px)',
                  }
                : { background: 'rgba(244, 237, 234, 0.08)', color: '#F0C2FF' }
            }
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
  const getComponent = (i, hideYesNo): React.ReactElement => {
    if (times[i] <= streak) {
      return (
        <PhotoCard
          key={i}
          text={insights[i]}
          day={times[i]}
          hiddenOnDesktop={hideYesNo}
          tomorrowMilliseconds={-1}
        />
      );
    }
    if (i == times.length) {
      return (
        <div className="mb-8" key={times.length}>
          <div
            className="flex flex-col overflow-hidden sm:rounded-2xl"
            style={{
              background: 'rgba(244, 237, 234, 0.08)',
            }}
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h3
                  className="text-lg leading-6 font-medium"
                  style={{ color: '#F4EDEA' }}
                >
                  You've ran out of cow photos!
                </h3>
                <div
                  className="mt-3 space-y-1 text-sm leading-5"
                  style={{ color: 'rgba(244, 237, 234, 0.72)' }}
                >
                  You've unlocked all current insights. If you want to help add
                  more, reach out via the Contact Us button.
                </div>
              </div>
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
          hiddenOnDesktop={hideYesNo}
          tomorrowMilliseconds={
            lastVisitDate +
            1000 * 60 * 60 * 20 +
            1000 * 60 * 60 * 24 * (times[i] - streak - 1)
          }
        />
      );
    }
  };
  const leftCows = () => {
    // 2-column format for desktop, so hide every other cow
    const items: React.ReactElement[] = [];
    for (let i = maxInd; i >= 0; --i) {
      items.push(getComponent(i, (maxInd - i) % 2 == 1));
    }
    return items;
  };
  const rightCows = () => {
    // desktop-only
    const items: React.ReactElement[] = [];
    for (let i = maxInd - 1; i >= 0; i -= 2) {
      items.push(getComponent(i, false));
    }
    return items;
  };
  return (
    <>
      <div
        className="overflow-hidden sm:rounded-2xl lg:col-span-2"
        style={{
          background: 'rgba(43, 30, 57, 0.92)',
        }}
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <h3
              className="text-lg leading-6 font-medium"
              style={{ color: '#F4EDEA' }}
            >
              🔥 {streak} Day Streak: Keep it up!
            </h3>
            <div
              className="mt-3 space-y-1 text-sm leading-5"
              style={{ color: 'rgba(244, 237, 234, 0.72)' }}
            >
              <p>
                You've visited this guide for {streak} consecutive day
                {streak !== 1 && 's'}.
              </p>
              <p>
                Each prime day you visit, you'll unlock a new math insight. If
                you break the streak, the insights will disappear.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>{leftCows()}</div>
      <div className="hidden lg:block">{rightCows()}</div>
    </>
  );
}
