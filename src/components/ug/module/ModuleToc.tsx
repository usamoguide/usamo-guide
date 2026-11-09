import * as React from 'react';

export type TocItem = { id: string; label: string; l2: boolean };

/**
 * Highlight the section being read (the last heading above 160px from the
 * top), and offer the back-to-top button once you're 700px down.
 */
export function useScrollSpy(ids: string[]): {
  cur: string | null;
  topOn: boolean;
} {
  const [state, setState] = React.useState<{
    cur: string | null;
    topOn: boolean;
  }>({
    cur: ids[0] ?? null,
    topOn: false,
  });
  const key = ids.join('|');
  React.useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      let cur = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 160) cur = id;
      }
      const topOn = (window.scrollY || 0) > 700;
      setState(s => (s.cur === cur && s.topOn === topOn ? s : { cur, topOn }));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export function TocLinks({
  items,
  cur,
  label,
}: {
  items: TocItem[];
  cur: string | null;
  label?: string;
}): JSX.Element {
  return (
    <nav className="toc" aria-label={label}>
      {items.map(t => (
        <a
          key={t.id}
          className={
            [t.l2 ? 'l2' : '', t.id === cur ? 'on' : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          href={`#${t.id}`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}

/** The contents folded into the article when there's no room for the right column. */
export function TocInline({
  items,
  cur,
}: {
  items: TocItem[];
  cur: string | null;
}): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <details className="toc-in">
      <summary>
        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
        </svg>
        <span>On this page</span>
        <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </summary>
      <TocLinks items={items} cur={cur} label="On this page" />
    </details>
  );
}

/** The right column: contents and the practice progress. */
export function TocColumn({
  items,
  cur,
  solved,
  total,
}: {
  items: TocItem[];
  cur: string | null;
  solved: number;
  total: number;
}): JSX.Element {
  // a long contents list scrolls inside the column: keep the current entry in view
  const ref = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const box = ref.current;
    const on = box?.querySelector<HTMLElement>('.toc a.on');
    if (!box || !on || box.scrollHeight <= box.clientHeight) return;
    const b = box.getBoundingClientRect();
    const r = on.getBoundingClientRect();
    if (r.top < b.top + 40 || r.bottom > b.bottom - 40) {
      box.scrollTop += r.top - b.top - box.clientHeight / 3;
    }
  }, [cur]);
  return (
    <aside className="md-toc" aria-label="On this page" ref={ref}>
      {items.length ? (
        <>
          <p className="toc-k">On this page</p>
          <TocLinks items={items} cur={cur} />
        </>
      ) : null}
      {total > 0 ? (
        <div className="toc-prog">
          <p className="toc-k">Practice</p>
          <div className="bar">
            <span style={{ width: `${Math.round((100 * solved) / total)}%` }} />
          </div>
          <p className="toc-prog-n">
            {solved} of {total} solved
          </p>
        </div>
      ) : null}
    </aside>
  );
}
