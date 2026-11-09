import { SectionID, SECTIONS } from '../../../../content/ordering';
import { ProblemProgress } from '../../../models/problem';
import {
  DiffKey,
  DIFFS,
  isDiffKey,
  SOURCE_FAMILIES,
  STATUS_KEYS,
  statusFromKey,
} from './facets';

/**
 * Everything on the problems page that narrows the list, apart from the query
 * and the topic tags (those live in InstantSearch's own state, so the tag
 * counts stay disjunctive).
 */
export type PbFilters = {
  diffs: DiffKey[];
  /** source family keys (SOURCE_FAMILIES) */
  srcs: string[];
  /** module id */
  module: string;
  track: SectionID | '';
  status: ProblemProgress | '';
  sort: 'hard' | 'easy';
  /** 0 = in sort order; otherwise the seed of the client-side shuffle */
  seed: number;
};

export const EMPTY_FILTERS: PbFilters = {
  diffs: [],
  srcs: [],
  module: '',
  track: '',
  status: '',
  sort: 'hard',
  seed: 0,
};

export const HITS_PER_PAGE = 24;

/** Quote a facet value for Algolia's `filters` syntax. */
const q = (v: string) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** `(a:"x" OR a:"y")`, or a filter that matches nothing for an empty list. */
function anyOf(attribute: string, values: string[]): string {
  if (values.length === 0) return 'objectID:"__none__"';
  const parts = values.map(v => `${attribute}:${q(v)}`);
  return parts.length === 1 ? parts[0] : `(${parts.join(' OR ')})`;
}

export type FilterContext = {
  /** raw source values by family key (from the build-time problem data) */
  sourcesByFamily: Record<string, string[]>;
  /** module ids, with problems, in each track */
  modulesByTrack: Record<string, string[]>;
  /** the user's problem statuses (uniqueId -> status) when the query was made */
  progress: Record<string, ProblemProgress>;
  /** show problems marked Ignored (display setting) */
  showIgnored: boolean;
};

function idsWith(
  progress: Record<string, ProblemProgress>,
  test: (s: ProblemProgress) => boolean
): string[] {
  return Object.keys(progress).filter(id =>
    test(progress[id] ?? 'Not Attempted')
  );
}

/** True when ignored problems are taken out of the list. */
export function hidesIgnored(f: PbFilters, showIgnored: boolean): boolean {
  return !showIgnored && f.status !== 'Ignored';
}

/**
 * The Algolia `filters` string for everything except the query and the tags.
 * `withoutIgnored: false` leaves out the exclusion of ignored problems (used to
 * count how many the exclusion hides).
 */
export function buildFilters(
  f: PbFilters,
  ctx: FilterContext,
  { withoutIgnored = true }: { withoutIgnored?: boolean } = {}
): string {
  const parts: string[] = [];
  if (f.diffs.length) {
    parts.push(
      anyOf(
        'difficulty',
        DIFFS.filter(d => f.diffs.includes(d.key)).flatMap(d => d.values)
      )
    );
  }
  if (f.srcs.length) {
    parts.push(
      anyOf(
        'source',
        f.srcs.flatMap(k => ctx.sourcesByFamily[k] ?? [])
      )
    );
  }
  if (f.module) parts.push(`problemModules.id:${q(f.module)}`);
  if (f.track) {
    parts.push(anyOf('problemModules.id', ctx.modulesByTrack[f.track] ?? []));
  }
  if (f.status === 'Not Attempted') {
    idsWith(ctx.progress, s => s !== 'Not Attempted').forEach(id =>
      parts.push(`NOT objectID:${q(id)}`)
    );
  } else if (f.status) {
    parts.push(
      anyOf(
        'objectID',
        idsWith(ctx.progress, s => s === f.status)
      )
    );
  }
  // any status filter already decides whether ignored problems are in
  if (withoutIgnored && !f.status && hidesIgnored(f, ctx.showIgnored)) {
    idsWith(ctx.progress, s => s === 'Ignored').forEach(id =>
      parts.push(`NOT objectID:${q(id)}`)
    );
  }
  return parts.join(' AND ');
}

/** The ignored problems that the current filters would otherwise show. */
export function buildIgnoredOnlyFilters(
  f: PbFilters,
  ctx: FilterContext
): string | null {
  if (!hidesIgnored(f, ctx.showIgnored) || f.status) return null;
  const ignored = idsWith(ctx.progress, s => s === 'Ignored');
  if (ignored.length === 0) return null;
  const base = buildFilters(f, ctx, { withoutIgnored: false });
  return [base, anyOf('objectID', ignored)].filter(Boolean).join(' AND ');
}

/**
 * "Hardest first" / "Easiest first" without a sorted replica: optional filters
 * with scores. With an empty query every record ties on the textual criteria,
 * so the filter score decides the order; with a query it breaks ties.
 */
export function sortFilters(sort: PbFilters['sort']): string[] {
  const levels = sort === 'easy' ? [...DIFFS].reverse() : DIFFS;
  // facetFilters syntax: no quotes around the value
  return levels.flatMap((d, i) =>
    d.values.map(v => `difficulty:${v}<score=${i + 1}>`)
  );
}

/** Tag refinements as Algolia facetFilters (one OR group). */
export function tagFacetFilters(tags: string[]): string[][] | undefined {
  return tags.length ? [tags.map(t => `tags:${t}`)] : undefined;
}

/* ---------- the URL: /problems?q=...&topic=...&diff=hard&src=aime&track=usamo&status=solving&sort=easy ---------- */

export type UrlState = { query: string; tags: string[]; filters: PbFilters };

export function parseUrl(search: string): UrlState {
  const p = new URLSearchParams(search);
  const track = p.get('track') as SectionID | null;
  return {
    query: p.get('q') ?? '',
    tags: p.getAll('topic').filter(Boolean),
    filters: {
      ...EMPTY_FILTERS,
      diffs: p.getAll('diff').filter(isDiffKey),
      srcs: p.getAll('src').filter(k => SOURCE_FAMILIES.some(f => f.key === k)),
      module: p.get('module') ?? '',
      track: track && SECTIONS.includes(track) ? track : '',
      status: statusFromKey(p.get('status')),
      sort: p.get('sort') === 'easy' ? 'easy' : 'hard',
    },
  };
}

export function urlSearch({ query, tags, filters: f }: UrlState): string {
  const p = new URLSearchParams();
  if (query.trim()) p.set('q', query.trim());
  tags.forEach(t => p.append('topic', t));
  f.diffs.forEach(d => p.append('diff', d));
  f.srcs.forEach(s => p.append('src', s));
  if (f.module) p.set('module', f.module);
  if (f.track) p.set('track', f.track);
  if (f.status) p.set('status', STATUS_KEYS[f.status]);
  if (f.sort === 'easy') p.set('sort', 'easy');
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** How many filters are on (the phone panel's "3 on"). */
export function activeCount(tags: string[], f: PbFilters): number {
  return (
    tags.length +
    f.diffs.length +
    f.srcs.length +
    (f.module ? 1 : 0) +
    (f.track ? 1 : 0) +
    (f.status ? 1 : 0)
  );
}

/**
 * The design's seeded shuffle, so the same press gives the same order. Each
 * loaded page is shuffled on its own so "Load more" appends instead of
 * reshuffling what is already on screen.
 */
export function seededShuffle<T>(
  list: T[],
  seed: number,
  chunk = HITS_PER_PAGE
): T[] {
  if (!seed) return list;
  const out: T[] = [];
  for (let start = 0; start < list.length; start += chunk) {
    const part = list.slice(start, start + chunk);
    let x = (seed * 9301 + 49297 + start * 7) % 233280;
    for (let i = part.length - 1; i > 0; i--) {
      x = (x * 9301 + 49297) % 233280;
      const j = Math.floor((x / 233280) * (i + 1));
      const t = part[i];
      part[i] = part[j];
      part[j] = t;
    }
    out.push(...part);
  }
  return out;
}
