import { navigate } from 'gatsby';
import * as React from 'react';
import {
  Configure,
  useInfiniteHits,
  useInstantSearch,
  useRefinementList,
  useSearchBox,
} from 'react-instantsearch';
import { SectionID } from '../../../content/ordering';
import { useUserProgressOnProblems } from '../../context/UserDataContext/properties/userProgress';
import {
  getProblemURL,
  PROBLEM_PROGRESS_OPTIONS,
  ProblemProgress,
} from '../../models/problem';
import { searchClient } from '../../utils/algoliaSearchClient';
import Btn from '../ug/Btn';
import { useUGPrefs } from '../ug/hooks';
import { IcoChev } from '../ug/icons';
import { UG_TRACKS } from '../ug/links';
import { DiffKey } from '../ug/problems/facets';
import {
  activeCount,
  buildFilters,
  buildIgnoredOnlyFilters,
  EMPTY_FILTERS,
  FilterContext,
  HITS_PER_PAGE,
  parseUrl,
  PbFilters,
  seededShuffle,
  sortFilters,
  tagFacetFilters,
  urlSearch,
} from '../ug/problems/search';
import { PROBLEM_STATUS_LABELS } from '../ug/ProblemStatusMenu';
import FilterSidebar from './FilterSidebar';
import ProblemCard, { ProblemHit } from './ProblemCard';

export type ModuleOption = { id: string; title: string };
export type ModuleGroup = {
  label: string;
  track: SectionID | '';
  modules: ModuleOption[];
};

export type ProblemStats = {
  /** distinct problems in the index */
  total: number;
  diffCounts: Record<string, number>;
  srcCounts: Record<string, number>;
  sourcesByFamily: Record<string, string[]>;
  modulesByTrack: Record<string, string[]>;
  moduleGroups: ModuleGroup[];
};

const fmt = (n: number) => n.toLocaleString('en-US');

const NO_PROGRESS: Record<string, ProblemProgress> = {};

const toggle = <T,>(list: T[], v: T): T[] =>
  list.includes(v) ? list.filter(x => x !== v) : [...list, v];

/** The Configure params InstantSearch should search with for these filters. */
export function configureFor(f: PbFilters, ctx: FilterContext) {
  return {
    filters: buildFilters(f, ctx),
    optionalFilters: sortFilters(f.sort),
  };
}

/** The topic refinements for a request made outside InstantSearch. */
function tagParams(tags: string[]): { facetFilters?: string[][] } {
  const ff = tagFacetFilters(tags);
  return ff ? { facetFilters: ff } : {};
}

/** Status now, as opposed to when the list was fetched: cards come and go as you mark them. */
function passesNow(
  id: string,
  f: PbFilters,
  progress: Record<string, ProblemProgress>,
  showIgnored: boolean
): boolean {
  const s = progress[id] ?? 'Not Attempted';
  if (f.status) return s === f.status;
  return showIgnored || s !== 'Ignored';
}

export default function ProblemSearch({
  indexName,
  stats,
}: {
  indexName: string;
  stats: ProblemStats;
}): JSX.Element {
  const prefs = useUGPrefs();
  const progress = useUserProgressOnProblems() ?? NO_PROGRESS;
  const {
    indexUiState,
    setIndexUiState,
    status: searchStatus,
  } = useInstantSearch();
  const { refine: refineQuery } = useSearchBox();
  const { items: tagItems, refine: refineTag } = useRefinementList({
    attribute: 'tags',
    operator: 'or',
    limit: 1000,
  });
  const {
    items,
    results: hitsResults,
    isLastPage,
    showMore,
  } = useInfiniteHits<ProblemHit>();

  const [filters, setFilters] = React.useState<PbFilters>(EMPTY_FILTERS);
  // the statuses the current request was built from; refreshed whenever the
  // list is re-queried, and while only the first page is loaded
  const [snap, setSnap] = React.useState(progress);
  const [input, setInput] = React.useState('');
  const [picking, setPicking] = React.useState(false);
  const [ignHiddenServer, setIgnHiddenServer] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const query = indexUiState.query ?? '';
  const tags = (indexUiState.refinementList?.tags ?? []) as string[];
  const tagsKey = tags.join('\u0000');

  const ctxFor = React.useCallback(
    (p: Record<string, ProblemProgress>): FilterContext => ({
      sourcesByFamily: stats.sourcesByFamily,
      modulesByTrack: stats.modulesByTrack,
      progress: p,
      showIgnored: prefs.ign,
    }),
    [stats, prefs.ign]
  );

  /* ---------- the URL: read it once on load, then keep it in step ---------- */
  const [urlRead, setUrlRead] = React.useState(false);
  React.useEffect(() => {
    const u = parseUrl(window.location.search);
    setFilters(u.filters);
    setInput(u.query);
    setSnap(progress);
    setIndexUiState(prev => ({
      ...prev,
      query: u.query,
      refinementList: { ...prev.refinementList, tags: u.tags },
      configure: {
        ...prev.configure,
        ...configureFor(u.filters, ctxFor(progress)),
      },
      page: undefined,
    }));
    setUrlRead(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!urlRead) return;
    const next =
      window.location.pathname +
      urlSearch({ query, tags, filters }) +
      window.location.hash;
    if (
      next !==
      window.location.pathname + window.location.search + window.location.hash
    ) {
      window.history.replaceState(window.history.state, '', next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRead, query, tagsKey, filters]);

  /* ---------- keep the request's filters in step with the page ---------- */
  const loadedMore = items.length > HITS_PER_PAGE;
  React.useEffect(() => {
    if (!loadedMore) setSnap(progress);
  }, [progress, loadedMore]);

  const ctx = ctxFor(snap);
  const conf = configureFor(filters, ctx);
  const confKey = conf.filters + '|' + conf.optionalFilters.join(',');
  React.useEffect(() => {
    if (!urlRead) return;
    const cur = indexUiState.configure as
      | { filters?: string; optionalFilters?: string[] }
      | undefined;
    const curKey =
      (cur?.filters ?? '') + '|' + (cur?.optionalFilters ?? []).join(',');
    if (curKey !== confKey) {
      setIndexUiState(prev => ({
        ...prev,
        configure: { ...prev.configure, ...conf },
        page: undefined,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRead, confKey]);

  /** Change the filters; the next request uses the latest statuses. */
  const update = (fn: (f: PbFilters) => PbFilters) => {
    setSnap(progress);
    setFilters(f => fn(f));
  };

  /* ---------- the search box: debounced, with "/" to jump to it ---------- */
  React.useEffect(() => {
    if (!urlRead || input === query) return;
    const t = setTimeout(() => refineQuery(input), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ---------- how many ignored problems the list leaves out ---------- */
  const ignoredOnly = buildIgnoredOnlyFilters(filters, ctx);
  React.useEffect(() => {
    if (!ignoredOnly) {
      setIgnHiddenServer(0);
      return;
    }
    let live = true;
    const t = setTimeout(() => {
      searchClient
        .search([
          {
            indexName,
            params: {
              query,
              ...tagParams(tags),
              filters: ignoredOnly,
              hitsPerPage: 0,
              analytics: false,
            },
          },
        ])
        .then(r => {
          if (live) {
            setIgnHiddenServer(
              (r.results[0] as { nbHits?: number }).nbHits ?? 0
            );
          }
        })
        .catch(() => undefined);
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ignoredOnly, query, tagsKey, indexName]);

  /* ---------- the list ---------- */
  const loaded =
    !!hitsResults &&
    !(hitsResults as { __isArtificial?: boolean }).__isArtificial;
  const nbHits = loaded && hitsResults ? hitsResults.nbHits : 0;
  let droppedNow = 0;
  let ignoredNow = 0;
  const visible = items.filter(h => {
    if (passesNow(h.objectID, filters, progress, prefs.ign)) return true;
    droppedNow++;
    if (
      !filters.status &&
      (progress[h.objectID] ?? 'Not Attempted') === 'Ignored'
    ) {
      ignoredNow++;
    }
    return false;
  });
  const probs = seededShuffle(visible, filters.seed);
  const shownN = Math.max(0, nbHits - droppedNow);
  const ignN = ignHiddenServer + ignoredNow;
  const none =
    loaded &&
    probs.length === 0 &&
    searchStatus !== 'loading' &&
    searchStatus !== 'stalled';
  const activeN = activeCount(tags, filters);

  // the lede's total: the build-time count, then the index's own once an
  // unfiltered search comes back (the two can differ by a stale record or two)
  const [indexTotal, setIndexTotal] = React.useState<number | null>(null);
  const sent = (
    hitsResults as unknown as
      | {
          _state?: {
            query?: string;
            filters?: string;
            disjunctiveFacetsRefinements?: Record<string, string[]>;
          };
        }
      | undefined
  )?._state;
  const unfiltered =
    loaded &&
    !sent?.query &&
    !sent?.filters &&
    !(sent?.disjunctiveFacetsRefinements?.tags ?? []).length;
  React.useEffect(() => {
    if (unfiltered) setIndexTotal(nbHits);
  }, [unfiltered, nbHits]);

  const clearAll = () => {
    const next = { ...EMPTY_FILTERS, sort: filters.sort };
    setInput('');
    setSnap(progress);
    setFilters(next);
    setIndexUiState(prev => ({
      ...prev,
      query: '',
      refinementList: { ...prev.refinementList, tags: [] },
      configure: { ...prev.configure, ...configureFor(next, ctxFor(progress)) },
      page: undefined,
    }));
  };

  const pickRandom = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const c = ctxFor(progress);
      const base = { query, ...tagParams(tags), analytics: false };
      // a problem you haven't started, unless you've picked a status
      const tries = filters.status
        ? [buildFilters(filters, c)]
        : [
            buildFilters({ ...filters, status: 'Not Attempted' }, c),
            buildFilters(filters, c),
          ];
      for (const f of tries) {
        const r1 = await searchClient.search([
          { indexName, params: { ...base, filters: f, hitsPerPage: 0 } },
        ]);
        const n = Math.min(
          (r1.results[0] as { nbHits?: number }).nbHits ?? 0,
          1000
        );
        if (!n) continue;
        const r2 = await searchClient.search<ProblemHit>([
          {
            indexName,
            params: {
              ...base,
              filters: f,
              hitsPerPage: 1,
              page: Math.floor(Math.random() * n),
              attributesToRetrieve: ['name', 'source'],
              attributesToHighlight: [],
            },
          },
        ]);
        const hit = (r2.results[0] as { hits?: ProblemHit[] }).hits?.[0];
        if (hit) {
          navigate(
            getProblemURL({
              source: hit.source,
              name: hit.name,
              uniqueId: hit.objectID,
            })
          );
          return;
        }
      }
    } catch (e) {
      // leave the list as it is
    } finally {
      setPicking(false);
    }
  };

  // a picked topic stays in the list (to untick it) even when nothing matches
  const topics = React.useMemo(() => {
    const have = new Set(tagItems.map(t => t.value));
    return [
      ...tagItems,
      ...tags
        .filter(t => !have.has(t))
        .map(t => ({ value: t, label: t, count: 0, isRefined: true })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagItems, tagsKey]);

  const track = filters.track;
  const moduleGroups = stats.moduleGroups
    .map(g => ({
      ...g,
      modules: g.modules.filter(
        m => !track || g.track === track || m.id === filters.module
      ),
    }))
    .filter(g => g.modules.length > 0);

  const sortLabel = filters.seed
    ? 'Shuffled'
    : filters.sort === 'easy'
      ? 'Easiest first'
      : 'Hardest first';

  const countN = loaded ? shownN : stats.total;

  return (
    <main className="pb-shell wrap-w">
      <Configure hitsPerPage={HITS_PER_PAGE} />
      <FilterSidebar
        topics={topics}
        onTopic={v => {
          setSnap(progress);
          refineTag(v);
        }}
        diffs={filters.diffs}
        diffCounts={stats.diffCounts}
        onDiff={(k: DiffKey) =>
          update(f => ({ ...f, diffs: toggle(f.diffs, k) }))
        }
        srcs={filters.srcs}
        srcCounts={stats.srcCounts}
        onSrc={k => update(f => ({ ...f, srcs: toggle(f.srcs, k) }))}
        tagsShown={prefs.tags}
        onFlipTags={prefs.flipTags}
        activeN={activeN}
        onClearAll={clearAll}
      />

      <div className="pb-main">
        <header className="pb-head">
          <div className="pb-intro">
            <h1 className="pb-h1">Problems</h1>
            <p className="pb-lede">
              {fmt(indexTotal ?? stats.total)} problems from the AMC, AIME,
              USAMO, HMMT and more, each tagged by topic and difficulty.
            </p>
          </div>
          <img
            className="pb-pose"
            src="/ug/img/panda-search.webp"
            alt=""
            width={440}
            height={395}
          />
        </header>
        <label className="pb-search">
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.2-4.2" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search by name, year or topic"
            aria-label="Search problems"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') refineQuery(input);
              if (e.key === 'Escape' && input) setInput('');
            }}
          />
          <kbd className="pb-kbd">/</kbd>
        </label>
        <div className="pb-filters" role="group" aria-label="Narrow the list">
          <label className="sel">
            <span className="sel-k">Module</span>
            <select
              value={filters.module}
              onChange={e => {
                const v = e.target.value;
                update(f => ({ ...f, module: v }));
              }}
            >
              <option value="">All modules</option>
              {moduleGroups.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.modules.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <IcoChev />
          </label>
          <label className="sel">
            <span className="sel-k">Track</span>
            <select
              value={filters.track}
              onChange={e => {
                const v = e.target.value as SectionID | '';
                // a module from another track would leave nothing to show
                update(f => ({
                  ...f,
                  track: v,
                  module:
                    v &&
                    f.module &&
                    !(stats.modulesByTrack[v] ?? []).includes(f.module)
                      ? ''
                      : f.module,
                }));
              }}
            >
              <option value="">All tracks</option>
              {UG_TRACKS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <IcoChev />
          </label>
          <label className="sel">
            <span className="sel-k">Status</span>
            <select
              value={filters.status}
              onChange={e => {
                const v = e.target.value as ProblemProgress | '';
                update(f => ({ ...f, status: v }));
              }}
            >
              <option value="">Any status</option>
              {PROBLEM_PROGRESS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {PROBLEM_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <IcoChev />
          </label>
          <div className="pb-acts">
            <button
              className="tbtn"
              type="button"
              onClick={() =>
                setFilters(f => ({ ...f, seed: (f.seed || 0) + 1 }))
              }
            >
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7h3c2.6 0 3.9 1.6 5 5s2.4 5 5 5h3" />
                <path d="M17.5 14.5L20 17l-2.5 2.5" />
                <path d="M4 17h3c1.3 0 2.2-.4 2.9-1.1M13.9 8.1C14.7 7.4 15.6 7 17 7h3" />
                <path d="M17.5 4.5L20 7l-2.5 2.5" />
              </svg>
              Shuffle
            </button>
            <Btn kind="p" size="sm" className="pb-rand" onClick={pickRandom}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="3.5" />
                <path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01" />
              </svg>
              Random problem
            </Btn>
          </div>
        </div>

        <div className="pb-bar">
          <p className="pb-count" aria-live="polite">
            <b>{fmt(countN)}</b> {countN === 1 ? 'problem' : 'problems'}
            <span className="pb-count-k">{sortLabel}</span>
          </p>
          <button
            className="tbtn"
            type="button"
            onClick={() =>
              update(f => ({
                ...f,
                sort: f.sort === 'easy' ? 'hard' : 'easy',
                seed: 0,
              }))
            }
          >
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3" />
            </svg>
            {filters.sort === 'easy' ? 'Hardest first' : 'Easiest first'}
          </button>
        </div>
        <div className="pb-cards">
          {probs.map(h => (
            <ProblemCard
              key={h.objectID}
              hit={h}
              showTags={prefs.tags}
              showDiff={prefs.diff}
            />
          ))}
        </div>
        {none ? (
          <div className="pb-empty">
            <p>No problems match these filters.</p>
            <button className="tbtn" type="button" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        ) : null}
        {ignN > 0 ? (
          <p className="pb-ign">
            {ignN === 1
              ? '1 problem you marked Ignored is hidden.'
              : `${fmt(ignN)} problems you marked Ignored are hidden.`}{' '}
            <button type="button" onClick={prefs.flipIgn}>
              Show ignored
            </button>
          </p>
        ) : null}
        {loaded && probs.length > 0 ? (
          <div className="pb-more">
            {!isLastPage ? (
              <Btn kind="s" onClick={() => showMore()}>
                Load more problems
              </Btn>
            ) : null}
            <p className="pb-more-n">
              Showing {fmt(probs.length)} of {fmt(shownN)}
              <span className="pb-algolia">
                {' · '}
                <a
                  href="https://www.algolia.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Search by Algolia
                </a>
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
