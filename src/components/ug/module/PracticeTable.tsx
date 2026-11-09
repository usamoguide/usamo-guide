import { Link } from 'gatsby';
import * as React from 'react';
import { useMarkdownProblemLists } from '../../../context/MarkdownProblemListsContext';
import { useUserProgressOnProblems } from '../../../context/UserDataContext/properties/userProgress';
import {
  getProblemURL,
  ProblemInfo,
  probSources,
} from '../../../models/problem';
import { diffPill, diffRank } from '../../DifficultyBox';
import { useUGPrefs } from '../hooks';
import ProblemStatusMenu from '../ProblemStatusMenu';
import { useModulePage } from './ModulePageContext';

const IcoMore = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 12h.01M12 12h.01M18 12h.01" />
  </svg>
);
const IcoBulb = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.5 18h5M10.5 21h3" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v.2h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </svg>
);
const IcoLink = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </svg>
);
const IcoFlag = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 21V4M6 4.5c4-2 7 2 12 0v9c-5 2-8-2-12 0" />
  </svg>
);
const IcoStar = (): JSX.Element => (
  <svg className="ico pp-star" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
  </svg>
);

/** Where "View solution" goes: the external write-up, or the problem's own page. */
function solutionHref(p: ProblemInfo): { href: string; external: boolean } {
  if (p.solution?.kind === 'link' && p.solution.url) {
    return { href: p.solution.url, external: true };
  }
  if (p.solutionReveal?.mode === 'external' && p.solutionReveal.url) {
    return { href: p.solutionReveal.url, external: true };
  }
  return { href: getProblemURL(p), external: false };
}

/**
 * A module's practice set as the export's table (`.pp`): status ring, source,
 * name, difficulty and tags (both follow the display settings), and a menu
 * with the solution, a permalink and a report link. Ignored problems are
 * hidden unless "Show ignored problems" is on.
 */
export default function PracticeTable({
  problems: listId,
  intro = true,
}: {
  problems: string;
  /** the export's line about the order and the tags, above the table */
  intro?: boolean;
}): JSX.Element {
  const lists = useMarkdownProblemLists() ?? [];
  const list = lists.find(l => l.listId === listId);
  // easiest first, as the export lists them (stable, so equal difficulties keep the authored order)
  const problems = React.useMemo(
    () =>
      ((list?.problems ?? []) as ProblemInfo[])
        .map((p, i) => ({ p, i }))
        .sort(
          (a, b) =>
            diffRank(a.p.difficulty) - diffRank(b.p.difficulty) || a.i - b.i
        )
        .map(x => x.p),
    [list]
  );
  const progress = useUserProgressOnProblems() || {};
  const prefs = useUGPrefs();
  const page = useModulePage();
  const [onlyOpen, setOnlyOpen] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => () => clearTimeout(timer.current), []);

  if (!list) {
    // a module can reference a list that has no .problems.json yet
    return <></>;
  }

  const solvedN = problems.filter(
    p => progress[p.uniqueId] === 'Solved'
  ).length;
  let ignN = 0;
  const rows = problems.filter(p => {
    const st = progress[p.uniqueId] ?? 'Not Attempted';
    if (st === 'Ignored' && !prefs.ign) {
      ignN++;
      return false;
    }
    return !onlyOpen || st !== 'Solved';
  });

  const copy = (p: ProblemInfo) => {
    try {
      const url =
        String(window.location.href).split(/[?#]/)[0] +
        '#problem-' +
        p.uniqueId;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => undefined);
      }
    } catch (e) {
      // ignore
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
    setCopied(p.uniqueId);
  };

  // the export's source column fits "AMC 10"; longer sources get a wider, wrapping one
  const wideSrc = problems.some(p => (p.source || '').length > 9);
  const ppCls = [
    'pp',
    prefs.diff ? '' : 'no-diff',
    prefs.tags ? '' : 'no-tags',
    wideSrc ? 'wide-src' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {intro ? (
        <p>
          Sorted from easiest to hardest. Set a status on each one as you go,
          and open the tags only when you want a hint.
        </p>
      ) : null}
      <div className={ppCls} id={`problemlist-${listId}`}>
        <div className="pp-bar">
          <p className="pp-count">
            <b>{solvedN}</b> of {problems.length} solved
          </p>
          <div className="pp-tools" role="group" aria-label="Show">
            <button
              className="chip"
              type="button"
              aria-pressed={onlyOpen ? 'false' : 'true'}
              onClick={() => setOnlyOpen(false)}
            >
              All
            </button>
            <button
              className="chip"
              type="button"
              aria-pressed={onlyOpen ? 'true' : 'false'}
              onClick={() => setOnlyOpen(true)}
            >
              Unsolved
            </button>
          </div>
        </div>
        <div className="pp-head" aria-hidden="true">
          <span className="h-st">Status</span>
          <span className="h-src">Source</span>
          <span className="h-name">Problem</span>
          <span className="h-diff">Difficulty</span>
          <span className="h-tags">Tags</span>
        </div>
        <ol className="pp-list">
          {rows.map(p => {
            const st = progress[p.uniqueId] ?? 'Not Attempted';
            const pill = diffPill(p.difficulty);
            const sol = solutionHref(p);
            const srcTitle =
              p.sourceDescription ||
              (probSources[p.source as keyof typeof probSources]?.[1] ??
                undefined);
            const rowCls = [
              'pp-row',
              st === 'Solved' ? 'solved' : st === 'Ignored' ? 'ignored' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const reportHref = `/contact-us?location=${encodeURIComponent(
              `${page?.title ?? ''} - ${p.name}`.replace(/^ - /, '')
            )}`;
            return (
              <li
                className={rowCls}
                key={p.uniqueId}
                id={`problem-${p.uniqueId}`}
              >
                <ProblemStatusMenu uniqueId={p.uniqueId} name={p.name} />
                <a
                  className="pp-src"
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  title={srcTitle}
                >
                  {p.source}
                </a>
                <span className="pp-name">
                  {p.isStarred ? (
                    <span title="Recommended: we highly recommend doing starred problems">
                      <IcoStar />
                    </span>
                  ) : null}
                  <Link to={getProblemURL(p)}>{p.name}</Link>
                </span>
                <span className="pp-diff">
                  {pill ? (
                    <span className={`diff ${pill.cls}`}>{pill.label}</span>
                  ) : null}
                </span>
                {p.tags && p.tags.length ? (
                  <details className="pp-tagd">
                    <summary>Show tags</summary>
                    <span className="pp-tags">
                      {[...p.tags].sort().map(t => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </span>
                  </details>
                ) : (
                  <span className="pp-tagd" />
                )}
                <details className="rm" data-dismiss="">
                  <summary
                    className="rm-btn"
                    aria-label={`More options for ${p.name}`}
                  >
                    <IcoMore />
                  </summary>
                  <div className="rm-menu" role="menu">
                    {sol.external ? (
                      <a
                        href={sol.href}
                        target="_blank"
                        rel="noreferrer"
                        role="menuitem"
                      >
                        <IcoBulb />
                        View solution
                      </a>
                    ) : (
                      <Link to={sol.href} role="menuitem">
                        <IcoBulb />
                        View solution
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => copy(p)}
                    >
                      <IcoLink />
                      {copied === p.uniqueId ? 'Link copied' : 'Copy link'}
                    </button>
                    <Link to={reportHref} role="menuitem">
                      <IcoFlag />
                      Report an issue
                    </Link>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
        {rows.length === 0 && onlyOpen ? (
          <p className="pp-empty">Every problem here is solved. Nice work.</p>
        ) : null}
        {ignN > 0 ? (
          <p className="pp-ign">
            {ignN === 1
              ? '1 ignored problem is hidden.'
              : `${ignN} ignored problems are hidden.`}{' '}
            <button type="button" onClick={prefs.flipIgn}>
              Show ignored
            </button>
          </p>
        ) : null}
      </div>
    </>
  );
}
