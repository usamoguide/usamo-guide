import type { UserData } from '../../../context/UserDataContext/UserDataContext';

/** Columns in the heatmap: six months of weeks, Sunday on top. */
export const HEAT_WEEKS = 26;

export type DayItem = { t: string };

export type HeatDay = {
  date: Date;
  /** days before today; negative for the rest of this week */
  back: number;
  solved: string[];
  modules: { id: string; status: 'Reading' | 'Practicing' | 'Complete' }[];
  views: number;
};

const midnight = (t: number): number => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const MODULE_ACTIVE = new Set(['Reading', 'Practicing', 'Complete']);

/**
 * Six months of days ending with this week, built from the progress history
 * (problems marked Solved; modules marked Reading, Practicing or Complete) and
 * the pages viewed each day. A problem or module counts once per day, with
 * the last status it was given that day.
 */
export function buildHeatDays(
  data: Pick<
    UserData,
    | 'userProgressOnModulesActivity'
    | 'userProgressOnProblemsActivity'
    | 'pageviewsPerDay'
  >,
  nowMs: number
): { days: HeatDay[]; todayIdx: number } {
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (HEAT_WEEKS - 1) * 7);
  const first = start.getTime();

  const probs = new Map<number, Map<string, string>>();
  for (const a of data.userProgressOnProblemsActivity || []) {
    if (!a || typeof a.timestamp !== 'number' || a.timestamp < first) continue;
    const k = midnight(a.timestamp);
    if (!probs.has(k)) probs.set(k, new Map());
    probs.get(k)!.set(a.problemID, a.problemProgress);
  }
  const mods = new Map<number, Map<string, string>>();
  for (const a of data.userProgressOnModulesActivity || []) {
    if (!a || typeof a.timestamp !== 'number' || a.timestamp < first) continue;
    const k = midnight(a.timestamp);
    if (!mods.has(k)) mods.set(k, new Map());
    mods.get(k)!.set(a.moduleID, a.moduleProgress);
  }
  const views = new Map<number, number>();
  Object.entries(data.pageviewsPerDay || {}).forEach(([key, n]) => {
    const t = Number(key);
    if (!isFinite(t) || t < first - 86400000) return;
    const k = midnight(t);
    views.set(k, (views.get(k) || 0) + (Number(n) || 0));
  });

  const days: HeatDay[] = [];
  let todayIdx = 0;
  for (let i = 0; i < HEAT_WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = d.getTime();
    const back = Math.round((today.getTime() - k) / 86400000);
    if (back === 0) todayIdx = i;
    const p = probs.get(k);
    const m = mods.get(k);
    days.push({
      date: d,
      back,
      solved: p
        ? Array.from(p.entries())
            .filter(([, s]) => s === 'Solved')
            .map(([id]) => id)
        : [],
      modules: m
        ? Array.from(m.entries())
            .filter(([, s]) => MODULE_ACTIVE.has(s))
            .map(([id, s]) => ({
              id,
              status: s as 'Reading' | 'Practicing' | 'Complete',
            }))
        : [],
      views: back < 0 ? 0 : views.get(k) || 0,
    });
  }
  return { days, todayIdx };
}

const plural = (n: number, w: string) => n + ' ' + w + (n === 1 ? '' : 's');

/**
 * 0: nothing; 1: opened the Guide; 2: one or two things done; 3: three or more.
 */
export function heatLevel(d: HeatDay): number {
  if (d.back < 0) return 0;
  const n = d.solved.length + d.modules.length;
  if (n === 0) return d.views > 0 ? 1 : 0;
  return n < 3 ? 2 : 3;
}

const MOD_VERB = { Reading: 'read', Practicing: 'practiced', Complete: 'completed' };
const MOD_ITEM = { Reading: 'Read', Practicing: 'Practiced', Complete: 'Completed' };

/** The line under the date: "2 problems solved, 1 module read". */
export function dayWhat(d: HeatDay): string {
  const parts: string[] = [];
  if (d.solved.length) parts.push(plural(d.solved.length, 'problem') + ' solved');
  (['Complete', 'Practicing', 'Reading'] as const).forEach(s => {
    const n = d.modules.filter(m => m.status === s).length;
    if (n) parts.push(plural(n, 'module') + ' ' + MOD_VERB[s]);
  });
  if (parts.length) return parts.join(', ');
  if (d.views > 0) return 'Opened the Guide, ' + plural(d.views, 'page') + ' viewed';
  return 'No activity';
}

/** The list under it: "Solved Problem 5 (2019 AMC 8)", "Read Kinematics and Rates". */
export function dayItems(
  d: HeatDay,
  problemName: (id: string) => string | null,
  moduleTitle: (id: string) => string | null,
  max = 4
): DayItem[] {
  const all: DayItem[] = [];
  d.solved.forEach(id => {
    const n = problemName(id);
    if (n) all.push({ t: 'Solved ' + n });
  });
  d.modules.forEach(m => {
    const n = moduleTitle(m.id);
    if (n) all.push({ t: MOD_ITEM[m.status] + ' ' + n });
  });
  if (all.length > max) {
    const rest = all.length - (max - 1);
    return [...all.slice(0, max - 1), { t: 'And ' + rest + ' more' }];
  }
  return all;
}

export const fmtDay = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

/** Month labels over the first week that starts in each month (as the export). */
export function monthLabels(days: HeatDay[]): { n: string; col: string }[] {
  const months: { n: string; col: string; w: number }[] = [];
  for (let w = 0; w < HEAT_WEEKS; w++) {
    const d = days[w * 7].date;
    const prev = w ? days[(w - 1) * 7].date : null;
    if (!prev || prev.getMonth() !== d.getMonth()) {
      if (w > HEAT_WEEKS - 3) break;
      months.push({
        n: d.toLocaleDateString('en-US', { month: 'short' }),
        col: w + 1 + ' / span 3',
        w,
      });
    }
  }
  if (months.length > 1 && months[1].w - months[0].w < 3) months.shift();
  return months.map(({ n, col }) => ({ n, col }));
}
