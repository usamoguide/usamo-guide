import { Link } from 'gatsby';
import * as React from 'react';
import {
  SECTION_SEO_DESCRIPTION,
  SECTION_SEO_TITLES,
  SectionID,
} from '../../../../content/ordering';
import { useLastViewedModule } from '../../../context/UserDataContext/properties/simpleProperties';
import {
  useUserProgressOnModules,
  useUserProgressOnProblems,
} from '../../../context/UserDataContext/properties/userProgress';
import Layout from '../../layout';
import SEO from '../../seo';
import TopNavigationBar from '../../TopNavigationBar/TopNavigationBar';
import Btn from '../Btn';
import { IcoArrow, IcoCheck, IcoChev, IcoChevRight } from '../icons';
import { UG_LINKS, UG_TRACKS } from '../links';
import { buildTrack, ModuleSource, plural, TrackModule } from './curriculum';
import ModuleDesc from './ModuleDesc';

/** The lede under each track's title. */
export const TRACK_LEDE: { [key in SectionID]: string } = {
  foundations:
    'Build your core toolbox first: algebra, geometry, counting and number theory that show up across the AMC and on early AIME problems. Focus on understanding patterns and writing clean solutions before you move on.',
  intermediate:
    'Go deeper with multi-step, AIME-style techniques: functional equations, inequalities, advanced counting and richer geometry. This stage is about speed and rigor, solving accurately under time pressure.',
  advanced:
    'Take on olympiad-level ideas and the topics where the AIME meets the USAMO: advanced number theory, geometric transformations and deeper algebraic methods. Expect longer chains of reasoning and more proof-like structure.',
  usamo:
    'Prepare for proof-based olympiad rounds with guided practice in constructions, invariants and building elegant arguments. The focus is on clear, correct, complete write-ups.',
};

/** Tracks whose content is still being written. */
const IN_PROGRESS: SectionID[] = ['advanced', 'usamo'];

type ModuleState = 'done' | 'doing' | 'skip' | 'ign' | '';

const FINISHED = new Set(['Complete', 'Skipped', 'Ignored']);

function stateOf(progress: string | undefined): ModuleState {
  switch (progress) {
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

const STATE_LABEL: { [k in ModuleState]: string } = {
  done: 'Done',
  doing: 'In progress',
  skip: 'Skipped',
  ign: 'Ignored',
  '': 'Not started',
};

function metaOf(m: TrackModule, st: ModuleState): string {
  if (st) return STATE_LABEL[st];
  const problems = m.problemCount > 0 ? plural(m.problemCount, 'problem') : 'Lesson only';
  return m.minutes ? `${m.minutes} min · ${problems}` : problems;
}

export type TrackPageData = {
  modules: {
    nodes: ReadonlyArray<{
      isIncomplete: boolean | null;
      readingMinutes?: number | null;
      frontmatter: { id: string | null; title: string; description: string | null };
    }>;
  };
  problems: {
    nodes: ReadonlyArray<{
      uniqueId: string;
      module: { frontmatter: { id: string | null } } | null;
    }>;
  };
};

export default function TrackPage({
  data,
  division,
  path,
}: {
  data: TrackPageData;
  division: SectionID;
  path: string;
}): JSX.Element {
  const track = UG_TRACKS.find(t => t.id === division) || UG_TRACKS[0];

  const sections = React.useMemo(() => {
    const modules: { [id: string]: ModuleSource } = {};
    data.modules.nodes.forEach(n => {
      if (!n.frontmatter.id) return;
      modules[n.frontmatter.id] = {
        id: n.frontmatter.id,
        title: n.frontmatter.title,
        description: n.frontmatter.description,
        isIncomplete: n.isIncomplete,
        minutes: n.readingMinutes ?? null,
      };
    });
    const problems: { [id: string]: string[] } = {};
    data.problems.nodes.forEach(p => {
      const id = p.module?.frontmatter.id;
      if (!id) return;
      (problems[id] = problems[id] || []).push(p.uniqueId);
    });
    return buildTrack(division, modules, problems);
  }, [data, division]);

  const allModules = React.useMemo(() => sections.flatMap(s => s.modules), [sections]);
  const totalProblems = React.useMemo(
    () => new Set(sections.flatMap(s => s.problemIds)).size,
    [sections]
  );
  const totalMinutes = allModules.reduce((t, m) => t + (m.minutes || 0), 0);

  const moduleProgress = useUserProgressOnModules();
  const problemProgress = useUserProgressOnProblems();
  const lastViewed = useLastViewedModule();

  const st = (m: TrackModule) => stateOf(moduleProgress[m.id]);
  const lastInTrack = allModules.find(m => m.id === lastViewed) || null;
  // a returning reader has touched a module in this track, or opened one
  const back =
    Boolean(lastInTrack) ||
    allModules.some(m => moduleProgress[m.id] && moduleProgress[m.id] !== 'Not Started');

  // the module the card and the main button point to: the one you were last
  // reading here, else one you're partway through, else the first one left
  const open = (m: TrackModule) => !FINISHED.has(moduleProgress[m.id] as string);
  const next: TrackModule | null =
    (lastInTrack && open(lastInTrack) ? lastInTrack : null) ||
    allModules.find(m => st(m) === 'doing') ||
    allModules.find(open) ||
    lastInTrack ||
    allModules[0] ||
    null;
  const allDone = back && allModules.length > 0 && !allModules.some(open);
  const firstOpen = allModules.find(m => moduleProgress[m.id] !== 'Ignored') || allModules[0];
  const badgeFor = (m: TrackModule): string =>
    back ? (!allDone && next && m.id === next.id ? 'Continue' : '') : firstOpen && m.id === firstOpen.id ? 'Start here' : '';

  const doneN = allModules.filter(m => st(m) === 'done').length;
  const pct = (a: number, b: number) => `${Math.round((100 * a) / Math.max(1, b))}%`;

  // on a phone every section but one starts folded (the one with the module to
  // do next); wider screens always show them all
  const nextSection = next ? sections.findIndex(s => s.modules.includes(next)) : 0;
  const [folds, setFolds] = React.useState<{ [n: number]: boolean }>({});
  const isOpen = (i: number) => (i in folds ? folds[i] : i === Math.max(0, nextSection));
  const toggle = (i: number) => setFolds(f => ({ ...f, [i]: !isOpen(i) }));

  const cardK = allDone
    ? "You've finished this track"
    : back
      ? 'Continue where you left off'
      : 'Start here';
  const ctaLabel = allDone ? 'Review the track' : back ? 'Continue the track' : 'Start the track';
  const nextUrl = next ? next.url : `/${division}`;

  return (
    <Layout view="track">
      <SEO
        title={SECTION_SEO_TITLES[division]}
        description={SECTION_SEO_DESCRIPTION[division]}
        image={null}
        pathname={path}
      />
      <TopNavigationBar current="tracks" />
      <main>
        <section className="tr-head" aria-labelledby="tr-h">
          <div className="wrap">
            <nav className="tr-tabs" aria-label="Tracks">
              {UG_TRACKS.map(t => (
                <Link
                  key={t.id}
                  className={t.id === division ? 'on' : undefined}
                  to={`/${t.id}`}
                  aria-current={t.id === division ? 'page' : undefined}
                >
                  {t.name}
                  <span>{t.exam}</span>
                </Link>
              ))}
            </nav>
            <div className="tr-grid">
              <div className="tr-intro">
                <h1 className="tr-h1" id="tr-h">
                  {track.name} <span>({track.exam})</span>
                </h1>
                <p className="tr-lede">{TRACK_LEDE[division]}</p>
                {IN_PROGRESS.includes(division) ? (
                  <p className="tr-wip">
                    This track is still being written. Some of what you see here is
                    placeholder content for now.
                  </p>
                ) : null}
                <p className="tr-facts">
                  <span>
                    <b>{sections.length}</b> {sections.length === 1 ? 'section' : 'sections'}
                  </span>
                  <span>
                    <b>{allModules.length}</b> {allModules.length === 1 ? 'module' : 'modules'}
                  </span>
                  <span>
                    <b>{totalProblems}</b> practice {totalProblems === 1 ? 'problem' : 'problems'}
                  </span>
                  {totalMinutes > 0 ? (
                    totalMinutes < 90 ? (
                      <span>
                        about <b>{Math.max(5, Math.round(totalMinutes / 5) * 5)}</b> minutes of
                        reading
                      </span>
                    ) : (
                      <span>
                        about <b>{Math.round(totalMinutes / 60)}</b> hours of reading
                      </span>
                    )
                  ) : null}
                </p>
                <div className="cta-row">
                  <Btn kind="p" size="lg" to={nextUrl} arrow="plain">
                    {ctaLabel}
                  </Btn>
                  <Btn kind="s" size="lg" href={UG_LINKS.discord} target="_blank">
                    Join the Discord
                  </Btn>
                </div>
              </div>
              <aside className="tr-card" aria-label="Where you are in this track">
                <img className="tr-fox" src="/ug/img/panda-read.webp" alt="" width={450} height={464} />
                <p className="k-label">{cardK}</p>
                {next ? (
                  <Link className="tr-next" to={next.url}>
                    <span className="tr-next-n">{next.num}</span>
                    <span className="tr-next-t">{next.title}</span>
                    <IcoArrow />
                  </Link>
                ) : null}
                <div className="tr-prog">
                  <div className="bar">
                    <span style={{ width: pct(doneN, allModules.length) }} />
                  </div>
                  <p>
                    {doneN} of {allModules.length} modules done
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="tr-body" aria-label="Sections">
          <div className="wrap">
            {sections.map((sec, si) => {
              const done = sec.modules.filter(m => st(m) === 'done').length;
              const pdone = sec.problemIds.filter(id => problemProgress[id] === 'Solved').length;
              const exp = isOpen(si);
              return (
                <article className="tr-sec" key={sec.name}>
                  <header className="tr-sec-h">
                    <p className="k-label">Section {sec.n}</p>
                    <h2 className="tr-sec-t">{sec.name}</h2>
                    {sec.description ? <p className="tr-sec-d">{sec.description}</p> : null}
                    <div className="tr-sec-p">
                      <div className="bar">
                        <span style={{ width: pct(done, sec.modules.length) }} />
                      </div>
                      <span>
                        {done}/{sec.modules.length} modules
                        <span className="dot" aria-hidden="true">
                          ·
                        </span>
                        {pdone}/{sec.problemIds.length} problems
                      </span>
                    </div>
                  </header>
                  <div className={`tr-fold ${exp ? 'open' : ''}`}>
                    <button
                      className="tr-fold-s"
                      type="button"
                      aria-expanded={exp}
                      aria-controls={`sec-${sec.n}-mods`}
                      onClick={() => toggle(si)}
                    >
                      <span>{plural(sec.modules.length, 'module')}</span>
                      <span className="cnt">{done} done</span>
                      <IcoChev />
                    </button>
                    <ol className="tr-mods" id={`sec-${sec.n}-mods`}>
                      {sec.modules.map(m => {
                        const s = st(m);
                        const badge = badgeFor(m);
                        return (
                          <li key={m.id}>
                            <Link className={`tr-mod ${s}`} to={m.url}>
                              <span
                                className="st-dot"
                                role="img"
                                aria-label={
                                  s === 'doing' ? moduleProgress[m.id] : STATE_LABEL[s]
                                }
                              >
                                <IcoCheck />
                              </span>
                              <span className="tr-mod-n">{m.num}</span>
                              <span className="tr-mod-main">
                                <span className="tr-mod-t">
                                  {m.title}
                                  {badge ? <span className="tr-badge">{badge}</span> : null}
                                  {m.isIncomplete ? (
                                    <span
                                      className="tr-badge tr-badge-inc"
                                      title="This module has sections that are still being written."
                                    >
                                      Incomplete
                                    </span>
                                  ) : null}
                                </span>
                                {m.description ? (
                                  <span className="tr-mod-d">
                                    <ModuleDesc text={m.description} />
                                  </span>
                                ) : null}
                              </span>
                              <span className="tr-mod-meta">{metaOf(m, s)}</span>
                              <IcoChevRight />
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
}
