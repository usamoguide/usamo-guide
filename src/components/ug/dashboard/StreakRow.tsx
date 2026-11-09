import { Link } from 'gatsby';
import * as React from 'react';
import { UG_LINKS } from '../links';
import { INSIGHT_DAYS, INSIGHTS } from './insights';

/** The streak only moves on once 20 hours have passed since it last did. */
const NEXT_DAY_AFTER = 1000 * 60 * 60 * 20;

const plural = (n: number, w: string) => n + ' ' + w + (n === 1 ? '' : 's');

/** "7 hours 21 minutes 2 seconds", ticking every second. */
function Countdown({ until }: { until: number }): JSX.Element {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  let s = Math.max(0, Math.floor((until - now) / 1000));
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  return (
    <p className="ins-cd" role="timer">
      {until - now <= 0
        ? 'a moment'
        : plural(h, 'hour') + ' ' + plural(m, 'minute') + ' ' + plural(s, 'second')}
    </p>
  );
}

const IcoFlame = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.3 2.3-5.4 3.6-7.6.5 1.6 1.4 2.6 2.5 3.1C11.4 7 12.6 4.6 15 3c.1 3 1.6 4.6 2.6 6.2 1 1.5 1.9 3 1.9 5.5 0 3.7-3.6 6.3-7.5 6.3z" />
  </svg>
);

const IcoLock = () => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

/**
 * The streak card, the latest unlocked insight (earlier ones fold away under
 * it) and the next locked one with its countdown.
 */
export default function StreakRow({
  streak,
  lastVisitDate,
}: {
  streak: number;
  /** when the streak last moved on (see useSetLastVisitDate) */
  lastVisitDate: number;
}): JSX.Element {
  const n = Math.max(1, streak || 1);
  const unlocked = INSIGHT_DAYS.filter(d => d <= n).length;
  const latest = unlocked - 1;
  const nextIdx = unlocked < INSIGHT_DAYS.length ? unlocked : -1;
  const nextDay = nextIdx >= 0 ? INSIGHT_DAYS[nextIdx] : 0;
  const unlockAt = lastVisitDate + NEXT_DAY_AFTER;

  const older: number[] = [];
  for (let i = latest - 1; i >= 0; i--) older.push(i);

  return (
    <div className={'db-row3' + (latest < 0 ? ' no-ins' : '')}>
      <section className="db-card streak" aria-labelledby="sk-h">
        <img
          className="streak-pose"
          src="/ug/img/panda-cheer.webp"
          alt=""
          width={300}
          height={245}
        />
        <p className="streak-n" id="sk-h">
          <IcoFlame />
          <span>{n}-day streak</span>
        </p>
        <p className="streak-k">{n === 1 ? 'Day one.' : 'Keep it up.'}</p>
        <p className="db-sub">
          {n === 1
            ? 'You opened the Guide today. Come back tomorrow to start a streak.'
            : `You've opened the Guide ${n} days in a row.`}{' '}
          Every prime-numbered day of a streak (2, 3, 5, 7, 11 and on) unlocks a
          new math insight. Break the streak and the insights disappear.
        </p>
      </section>

      {latest >= 0 ? (
        <section className="db-card ins" aria-labelledby="in-h">
          <p className="k-label" id="in-h">
            Day {INSIGHT_DAYS[latest]} insight
          </p>
          <p className="ins-t">{INSIGHTS[latest]}</p>
          {older.length === 1 ? (
            <details className="ins-old">
              <summary>Day {INSIGHT_DAYS[older[0]]} insight</summary>
              <p>{INSIGHTS[older[0]]}</p>
            </details>
          ) : older.length > 1 ? (
            <details className="ins-old">
              <summary>Earlier insights</summary>
              {older.map(i => (
                <p key={i}>
                  <b>Day {INSIGHT_DAYS[i]}.</b> {INSIGHTS[i]}
                </p>
              ))}
            </details>
          ) : null}
        </section>
      ) : null}

      {nextIdx >= 0 ? (
        <section className="db-card ins lock" aria-labelledby="lk-h">
          <p className="k-label" id="lk-h">
            <IcoLock />
            Day {nextDay} insight
          </p>
          <p className="ins-come">Come back in</p>
          <Countdown until={unlockAt} />
          <p className="db-sub">
            {nextDay === n + 1
              ? `to unlock it. Tomorrow is day ${nextDay} of your streak.`
              : `to make it day ${n + 1} of your streak. This one unlocks on day ${nextDay}.`}
          </p>
        </section>
      ) : (
        <section className="db-card ins lock" aria-labelledby="lk-h">
          <p className="k-label" id="lk-h">
            All insights unlocked
          </p>
          <p className="ins-come">You've read every insight we have.</p>
          <p className="db-sub">
            Know one that belongs here?{' '}
            <Link to={UG_LINKS.contact}>Send it to us</Link>.
          </p>
        </section>
      )}
    </div>
  );
}
