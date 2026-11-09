import * as React from 'react';
import type { UserData } from '../../../context/UserDataContext/UserDataContext';
import {
  buildHeatDays,
  dayItems,
  dayWhat,
  fmtDay,
  heatLevel,
  monthLabels,
} from './activity';

/**
 * The Activity card: six months of days as a grid, with the picked day read
 * out beside it. Hover, focus or click a day to read it; the arrow keys move
 * between days (one roving tab stop, as in the export).
 */
export default function ActivityCard({
  data,
  problemName,
  moduleTitle,
}: {
  data: Pick<
    UserData,
    | 'userProgressOnModulesActivity'
    | 'userProgressOnProblemsActivity'
    | 'pageviewsPerDay'
  >;
  problemName: (id: string) => string | null;
  moduleTitle: (id: string) => string | null;
}): JSX.Element {
  // the day boundaries only need to follow the date, not the clock
  const [dayKey] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const { days, todayIdx } = React.useMemo(
    () => buildHeatDays(data, Date.now()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data.userProgressOnModulesActivity,
      data.userProgressOnProblemsActivity,
      data.pageviewsPerDay,
      dayKey,
    ]
  );
  const months = React.useMemo(() => monthLabels(days), [days]);
  const [sel, setSel] = React.useState(-1);
  const cur = sel < 0 ? todayIdx : sel;
  const heatRef = React.useRef<HTMLDivElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // on a narrow screen the grid scrolls; start at today
  React.useEffect(() => {
    const w = wrapRef.current;
    if (w) w.scrollLeft = w.scrollWidth;
  }, []);

  const pick = (i: number) => {
    if (i !== cur && days[i] && days[i].back >= 0) setSel(i);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = (
      { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 } as Record<
        string,
        number
      >
    )[e.key];
    if (!step) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(todayIdx, cur + step));
    setSel(next);
    requestAnimationFrame(() => {
      const b = heatRef.current?.querySelectorAll<HTMLButtonElement>('.hc')[next];
      if (b) b.focus();
    });
  };

  const D = days[cur];
  const items = dayItems(D, problemName, moduleTitle);

  return (
    <section className="db-card db-act" aria-labelledby="act-h">
      <div className="db-card-h">
        <h2 className="db-h2" id="act-h">
          Activity
        </h2>
        <p className="db-sub">Last 6 months</p>
      </div>
      <div className="act">
        <div className="heat-wrap" ref={wrapRef}>
          <div className="heat-m" aria-hidden="true">
            {months.map(m => (
              <span key={m.col} style={{ gridColumn: m.col }}>
                {m.n}
              </span>
            ))}
          </div>
          <div
            className="heat"
            role="group"
            aria-label="Daily activity. Use the arrow keys to move between days."
            onKeyDown={onKeyDown}
            ref={heatRef}
          >
            {days.map((d, i) => {
              const what = dayWhat(d);
              return (
                <button
                  key={d.date.getTime()}
                  className={'hc h' + heatLevel(d) + (d.back < 0 ? ' fut' : '')}
                  type="button"
                  tabIndex={i === cur ? 0 : -1}
                  aria-label={
                    fmtDay(d.date) +
                    ': ' +
                    what.charAt(0).toLowerCase() +
                    what.slice(1)
                  }
                  aria-pressed={i === cur ? 'true' : 'false'}
                  onClick={() => pick(i)}
                  onMouseEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                />
              );
            })}
          </div>
        </div>
        <div className="act-read" aria-live="polite">
          <p className="act-date">
            {fmtDay(D.date) + (D.back === 0 ? ' (today)' : '')}
          </p>
          <p className="act-what">{dayWhat(D)}</p>
          {items.length ? (
            <ul className="act-list">
              {items.map((it, i) => (
                <li key={i}>{it.t}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="heat-foot">
        <p className="db-sub">
          Activity tracking is still in beta, so these numbers may change.
        </p>
        <p className="heat-key" aria-hidden="true">
          Less
          <span className="h0" />
          <span className="h1" />
          <span className="h2" />
          <span className="h3" />
          More
        </p>
      </div>
    </section>
  );
}
