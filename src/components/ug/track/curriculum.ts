import MODULE_ORDERING, { SectionID } from '../../../../content/ordering';

/** What the track and start pages need from a module's MDX frontmatter. */
export type ModuleSource = {
  id: string;
  title: string;
  description: string | null;
  isIncomplete?: boolean | null;
  /** reading time, when the content pipeline provides one */
  minutes?: number | null;
};

export type TrackModule = {
  id: string;
  /** "<section>.<index>", e.g. "1.3" */
  num: string;
  title: string;
  description: string;
  url: string;
  isIncomplete: boolean;
  minutes: number | null;
  /** unique problem IDs in the module's practice set */
  problemIds: string[];
  /** size of the practice set (problemIds.length unless only a count is known) */
  problemCount: number;
};

export type TrackSection = {
  /** 1-based, after empty chapters are skipped */
  n: number;
  name: string;
  description: string;
  modules: TrackModule[];
  /** unique problem IDs across the section */
  problemIds: string[];
};

/**
 * The sections of a track in syllabus order (content/ordering.ts), with the
 * module titles and descriptions from the MDX frontmatter. Chapters whose
 * modules don't exist (yet) are skipped, and the numbering closes up behind
 * them. Modules that live in the track's folder but aren't in the ordering are
 * kept in a last section, as the old syllabus page did, so they stay reachable.
 */
export function buildTrack(
  division: SectionID,
  modules: { [id: string]: ModuleSource },
  problems: { [moduleId: string]: string[] } | ((moduleId: string) => string[] | number)
): TrackSection[] {
  const getProblems = (id: string): string[] | number =>
    typeof problems === 'function' ? problems(id) : problems[id] || [];
  const placed = new Set<string>();
  const chapters: { name: string; description: string; ids: string[] }[] =
    MODULE_ORDERING[division].map(ch => ({
      name: ch.name,
      description: ch.description || '',
      ids: ch.items.filter(id => {
        placed.add(id);
        return Boolean(modules[id]);
      }),
    }));
  const loose = Object.keys(modules).filter(id => !placed.has(id));
  if (loose.length) {
    chapters.push({
      name: 'More modules',
      description: "Modules that aren't in a section yet.",
      ids: loose.sort((a, b) => modules[a].title.localeCompare(modules[b].title)),
    });
  }

  const out: TrackSection[] = [];
  chapters.forEach(ch => {
    if (ch.ids.length === 0) return;
    const n = out.length + 1;
    const sectionProblems = new Set<string>();
    const mods = ch.ids.map((id, i) => {
      const m = modules[id];
      const p = getProblems(id);
      const ids = Array.isArray(p) ? Array.from(new Set(p)) : [];
      ids.forEach(x => sectionProblems.add(x));
      return {
        id,
        num: `${n}.${i + 1}`,
        title: m.title,
        description: m.description || '',
        url: `/${division}/${id}`,
        isIncomplete: Boolean(m.isIncomplete),
        minutes: m.minutes ?? null,
        problemIds: ids,
        problemCount: Array.isArray(p) ? ids.length : p,
      };
    });
    out.push({
      n,
      name: ch.name,
      description: ch.description,
      modules: mods,
      problemIds: Array.from(sectionProblems),
    });
  });
  return out;
}

/** "1 problem", "6 problems" */
export function plural(n: number, one: string, many = one + 's'): string {
  return `${n} ${n === 1 ? one : many}`;
}
