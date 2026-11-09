import {
  PROBLEM_PROGRESS_OPTIONS,
  ProblemProgress,
} from '../../../models/problem';

/**
 * Difficulty levels as the redesign shows them. The index stores the raw
 * difficulty from each problem file, which comes in a few spellings
 * ("Normal" and "Medium" are the same level); each level lists the raw values
 * it covers. Algolia matches facet values case-insensitively, so "hard" is
 * covered by "Hard".
 */
export type DiffKey =
  | 'very-easy'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'very-hard'
  | 'insane';

export type DiffDef = {
  key: DiffKey;
  label: string;
  /** `.diff` modifier from the design: d-easy ... d-insane */
  cls: string;
  values: string[];
};

export const DIFFS: DiffDef[] = [
  {
    key: 'very-easy',
    label: 'Very easy',
    cls: 'd-easy',
    values: ['Very Easy'],
  },
  { key: 'easy', label: 'Easy', cls: 'd-easy', values: ['Easy'] },
  {
    key: 'medium',
    label: 'Medium',
    cls: 'd-med',
    values: ['Normal', 'Medium', 'Medium-Easy'],
  },
  { key: 'hard', label: 'Hard', cls: 'd-hard', values: ['Hard'] },
  {
    key: 'very-hard',
    label: 'Very hard',
    cls: 'd-vhard',
    values: ['Very Hard'],
  },
  { key: 'insane', label: 'Insane', cls: 'd-insane', values: ['Insane'] },
];

const DIFF_BY_VALUE = new Map<string, DiffDef>();
DIFFS.forEach(d =>
  d.values.forEach(v => DIFF_BY_VALUE.set(v.toLowerCase(), d))
);

/** The level a raw difficulty belongs to, or null when it is unrated ('', 'N/A', 'Unknown'). */
export function diffOf(raw: string | null | undefined): DiffDef | null {
  if (!raw) return null;
  return DIFF_BY_VALUE.get(raw.trim().toLowerCase()) ?? null;
}

export function isDiffKey(k: string): k is DiffKey {
  return DIFFS.some(d => d.key === k);
}

/**
 * Sources, folded into contest families. Problems keep their raw source
 * ("AIME 1994", "HMMT February 2019", ...); the family filter matches every raw
 * source the family covers. First match wins, so the order matters.
 */
export type SourceFamily = { key: string; label: string; test: RegExp };

export const SOURCE_FAMILIES: SourceFamily[] = [
  // the AJHSME was the AMC 8 before 1999
  { key: 'amc8', label: 'AMC 8', test: /^(AMC 8|AJHSME)$/i },
  { key: 'amc10', label: 'AMC 10', test: /AMC 10/i },
  // the AHSME was the AMC 12 before 2000
  {
    key: 'amc12',
    label: 'AMC 12',
    test: /AMC 12|American Mathematics Competitions 12|AHSME/i,
  },
  { key: 'aime', label: 'AIME', test: /AIME/i },
  {
    key: 'usamo',
    label: 'USA(J)MO',
    test: /USAMO|USAJMO|USA Junior MO|Junior Mathematical Olympiad/i,
  },
  { key: 'hmmt', label: 'HMMT', test: /HMMT|Harvard-MIT|HMIC|HMMO/i },
  { key: 'bamo', label: 'BAMO', test: /BAMO|Bay Area Mathematical Olympiad/i },
  { key: 'bmc', label: 'Berkeley Math Circle', test: /Berkeley Math Circle/i },
  {
    key: 'imo',
    label: 'IMO and TST',
    test: /\bTST|Team Selection|\bIMO\b|International Mathematical Olympiad/i,
  },
  { key: 'custom', label: 'Custom', test: /^(Custom|Own)$/i },
  { key: 'other', label: 'Other', test: /[\s\S]*/ },
];

export function familyOf(rawSource: string): SourceFamily {
  return (
    SOURCE_FAMILIES.find(f => f.test.test(rawSource)) ??
    SOURCE_FAMILIES[SOURCE_FAMILIES.length - 1]
  );
}

/** "$10^{\text {th }}$ Annual Harvard-MIT ..." -> "10th Annual Harvard-MIT ..." */
export function cleanTex(s: string | null | undefined): string {
  return (s || '')
    .replace(
      /\$\s*(\d+)\s*\^\s*\{\s*\\text\s*\{\s*(\w+)\s*\}\s*\}\s*\$/g,
      '$1$2'
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Problem statuses, keyed for the URL. */
export const STATUS_KEYS: Record<ProblemProgress, string> = {
  'Not Attempted': 'not-attempted',
  Solving: 'solving',
  Solved: 'solved',
  Reviewing: 'reviewing',
  Skipped: 'skipped',
  Ignored: 'ignored',
};

export function statusFromKey(k: string | null): ProblemProgress | '' {
  if (!k) return '';
  return PROBLEM_PROGRESS_OPTIONS.find(s => STATUS_KEYS[s] === k) ?? '';
}
