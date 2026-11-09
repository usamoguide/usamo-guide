import MODULE_ORDERING, { SectionID } from '../../../../content/ordering';
import { ModuleProgress } from '../../../models/module';

/** A module as the sidebar and the prev/next links need it. */
export type NavModule = {
  id: string;
  /** "<chapter>.<index>", e.g. "1.5" (same numbering as the track page) */
  num: string;
  title: string;
  url: string;
};

export type NavChapter = {
  /** 1-based, after empty chapters are skipped */
  n: number;
  name: string;
  modules: NavModule[];
};

/**
 * The chapters of a track in syllabus order (content/ordering.ts) with the
 * titles from the MDX frontmatter. Mirrors the track page's numbering
 * (src/components/ug/track/curriculum.ts): chapters without any existing
 * module are skipped and the numbers close up behind them, and modules that
 * live in the track but aren't in the ordering go in a last "More modules"
 * chapter so they stay reachable.
 */
export function buildNavTrack(
  division: SectionID,
  titles: { [id: string]: string }
): NavChapter[] {
  const placed = new Set<string>();
  const chapters = (MODULE_ORDERING[division] || []).map(ch => ({
    name: ch.name,
    ids: ch.items.filter(id => {
      placed.add(id);
      return id in titles;
    }),
  }));
  const loose = Object.keys(titles).filter(id => !placed.has(id));
  if (loose.length) {
    chapters.push({
      name: 'More modules',
      ids: loose.sort((a, b) => titles[a].localeCompare(titles[b])),
    });
  }
  const out: NavChapter[] = [];
  chapters.forEach(ch => {
    if (ch.ids.length === 0) return;
    const n = out.length + 1;
    out.push({
      n,
      name: ch.name,
      modules: ch.ids.map((id, i) => ({
        id,
        num: `${n}.${i + 1}`,
        title: titles[id],
        url: `/${division}/${id}`,
      })),
    });
  });
  return out;
}

/** The export's spelling of each module status, and its `.stm-dot` index. */
export const MODULE_STATUS: { value: ModuleProgress; label: string }[] = [
  { value: 'Not Started', label: 'Not started' },
  { value: 'Reading', label: 'Reading' },
  { value: 'Practicing', label: 'Practicing' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Skipped', label: 'Skipped' },
  { value: 'Ignored', label: 'Ignored' },
];

export function moduleStatusIndex(status: ModuleProgress | undefined): number {
  const i = MODULE_STATUS.findIndex(s => s.value === status);
  return i < 0 ? 0 : i;
}

/** `.sb-m` modifier for a module's status in the sidebar. */
export function sidebarStatusCls(status: ModuleProgress | undefined): string {
  switch (status) {
    case 'Complete':
      return 'done';
    case 'Reading':
    case 'Practicing':
      return 'doing';
    case 'Skipped':
      return 'skip';
    case 'Ignored':
      return 'ign';
    default:
      return '';
  }
}

/** "Macquel Ko, Siddhant Arora" -> "Macquel Ko and Siddhant Arora" */
export function joinNames(list: string | null | undefined): string {
  const names = (list || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "3 days ago", "2 months ago" for the last-updated note. */
export function timeAgo(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return null;
  const s = Math.max(0, (Date.now() - t) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24 * 7, 'week'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, name] of units) {
    const n = Math.floor(s / size);
    if (n >= 1) return `${n} ${name}${n === 1 ? '' : 's'} ago`;
  }
  return 'just now';
}
