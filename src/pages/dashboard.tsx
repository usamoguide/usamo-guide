import { graphql, Link, PageProps } from 'gatsby';
import * as React from 'react';
import { SectionID, SECTIONS } from '../../content/ordering';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import Btn from '../components/ug/Btn';
import ActivityCard from '../components/ug/dashboard/ActivityCard';
import StreakRow from '../components/ug/dashboard/StreakRow';
import { IcoArrow, IcoChev } from '../components/ug/icons';
import { UG_TRACKS } from '../components/ug/links';
import { buildTrack, ModuleSource } from '../components/ug/track/curriculum';
import { useSignIn } from '../context/SignInContext';
import { useLastViewedModule } from '../context/UserDataContext/properties/simpleProperties';
import {
  useCurrentUser,
  useIsUserDataLoaded,
  useUserData,
} from '../context/UserDataContext/UserDataContext';
import { getProblemURL } from '../models/problem';

type DashboardData = {
  modules: {
    nodes: {
      frontmatter: { id: string; title: string };
      fields: { division: string | null } | null;
    }[];
  };
  problemLists: {
    nodes: {
      moduleId: string;
      problemLists: {
        problems: { uniqueId: string; name: string; source: string }[];
      }[];
    }[];
  };
};

type DbModule = {
  id: string;
  title: string;
  chapter: string;
  /** "1.5", numbered as the track page numbers them */
  num: string;
  url: string;
  problemIds: string[];
};

type ProblemRef = { uniqueId: string; name: string; source: string };

const plural = (n: number, w: string) => n + ' ' + w + (n === 1 ? '' : 's');
const pctOf = (n: number, of: number) => (of ? Math.round((100 * n) / of) : 0);

const MODULE_STATUS_LABEL: Record<string, string> = {
  'Not Started': 'Not started',
  Reading: 'Reading',
  Practicing: 'Practicing',
  Complete: 'Complete',
  Skipped: 'Skipped',
  Ignored: 'Ignored',
};
const PILL: Record<string, string> = {
  Reading: 'read',
  Practicing: 'prac',
  Solving: 'solv',
  Reviewing: 'rev',
};
const SOLVED = new Set(['Solved', 'Reviewing']);
/** how many open items show before "Show all" */
const ACTIVE_SHOWN = 8;

/**
 * The curriculum and problem lists, shaped for the dashboard. Tracks are built
 * with the track page's buildTrack, so module numbers and totals match it.
 */
function useCurriculum(data: DashboardData) {
  return React.useMemo(() => {
    const titles: Record<string, string> = {};
    const moduleTrack: Record<string, SectionID> = {};
    const sources = {} as Record<SectionID, Record<string, ModuleSource>>;
    SECTIONS.forEach(sec => (sources[sec] = {}));
    data.modules.nodes.forEach(n => {
      const id = n.frontmatter?.id;
      const div = n.fields?.division as SectionID | undefined;
      if (!id || !div || !sources[div]) return;
      titles[id] = n.frontmatter.title;
      moduleTrack[id] = div;
      sources[div][id] = { id, title: n.frontmatter.title, description: null };
    });

    const moduleProblems: Record<string, string[]> = {};
    const problems: Record<string, ProblemRef> = {};
    data.problemLists.nodes.forEach(node => {
      const ids = new Set<string>();
      node.problemLists.forEach(l =>
        l.problems.forEach(p => {
          if (!p?.uniqueId) return;
          ids.add(p.uniqueId);
          if (!problems[p.uniqueId]) problems[p.uniqueId] = p;
        })
      );
      moduleProblems[node.moduleId] = Array.from(ids);
    });

    const trackModules = {} as Record<SectionID, DbModule[]>;
    const trackProblems = {} as Record<SectionID, Set<string>>;
    const problemTracks: Record<string, Set<SectionID>> = {};
    SECTIONS.forEach(sec => {
      const mods: DbModule[] = [];
      const probs = new Set<string>();
      buildTrack(sec, sources[sec], moduleProblems).forEach(ch =>
        ch.modules.forEach(m => {
          mods.push({
            id: m.id,
            title: m.title,
            chapter: ch.name,
            num: m.num,
            url: m.url,
            problemIds: m.problemIds,
          });
          m.problemIds.forEach(id => {
            probs.add(id);
            if (!problemTracks[id]) problemTracks[id] = new Set();
            problemTracks[id].add(sec);
          });
        })
      );
      trackModules[sec] = mods;
      trackProblems[sec] = probs;
    });

    return {
      titles,
      moduleTrack,
      trackModules,
      problems,
      problemTracks,
      trackProblems,
    };
  }, [data]);
}

/** First name for the greeting. */
function firstName(name: string | null | undefined, email?: string | null) {
  const n = (name || '').trim();
  if (n && !n.includes('@')) return n.split(/\s+/)[0];
  const local = (email || n || '').split('@')[0];
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : '';
}

/**
 * User data arrives from localStorage a moment after the first render (and
 * from the server after that when signed in). Every page load counts a page
 * view, so a non-zero count means the saved data is in.
 */
function useDataReady(numPageviews: number): boolean {
  const loaded = useIsUserDataLoaded();
  const [mounted, setMounted] = React.useState(false);
  const [waited, setWaited] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setWaited(true), 1200);
    return () => clearTimeout(t);
  }, []);
  const now = mounted && ((loaded && numPageviews > 0) || waited);
  // once shown, stay shown: signing in reloads the data from the server, and
  // the page updates in place rather than blanking while it does
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (now) setShown(true);
  }, [now]);
  return shown || now;
}

export default function DashboardPage(props: PageProps): JSX.Element {
  const cur = useCurriculum(props.data as DashboardData);
  const userData = useUserData();
  const user = useCurrentUser();
  const { signIn } = useSignIn();
  const lastViewed = useLastViewedModule();
  const ready = useDataReady(userData.numPageviews);

  const modProgress = userData.userProgressOnModules || {};
  const probProgress = userData.userProgressOnProblems || {};

  // when each module / problem was last given a status, for ordering open items
  const touched = React.useMemo(() => {
    const m: Record<string, number> = {};
    const p: Record<string, number> = {};
    (userData.userProgressOnModulesActivity || []).forEach(a => {
      if (a && a.timestamp > (m[a.moduleID] || 0)) m[a.moduleID] = a.timestamp;
    });
    (userData.userProgressOnProblemsActivity || []).forEach(a => {
      if (a && a.timestamp > (p[a.problemID] || 0)) p[a.problemID] = a.timestamp;
    });
    return { m, p };
  }, [
    userData.userProgressOnModulesActivity,
    userData.userProgressOnProblemsActivity,
  ]);

  const trackHasProgress = (sec: SectionID) =>
    cur.trackModules[sec].some(
      m => modProgress[m.id] && modProgress[m.id] !== 'Not Started'
    ) ||
    Object.keys(probProgress).some(
      id =>
        probProgress[id] !== 'Not Attempted' &&
        cur.problemTracks[id]?.has(sec)
    );

  const lastTrack: SectionID | undefined =
    lastViewed ? cur.moduleTrack[lastViewed] : undefined;
  const [picked, setPicked] = React.useState<SectionID | null>(null);
  const track: SectionID =
    picked ||
    lastTrack ||
    SECTIONS.find(s => trackHasProgress(s)) ||
    'foundations';
  const trackLabel = UG_TRACKS.find(t => t.id === track)?.label || track;
  const mods = cur.trackModules[track];

  // ---------- continue card ----------
  const cont = (() => {
    const done = (id: string) =>
      ['Complete', 'Skipped', 'Ignored'].includes(modProgress[id]);
    let m: DbModule | undefined;
    let k: string;
    let go: string;
    const last = lastTrack === track ? mods.find(x => x.id === lastViewed) : undefined;
    if (last) {
      m = last;
      k = 'Continue where you left off';
      go = 'Continue';
    } else {
      const open = mods.find(x =>
        ['Reading', 'Practicing'].includes(modProgress[x.id])
      );
      const next = open || mods.find(x => !done(x.id));
      if (!next) {
        m = mods[mods.length - 1];
        k = 'You finished this track';
        go = 'Review';
      } else if (trackHasProgress(track)) {
        m = next;
        k = 'Up next in this track';
        go = 'Continue';
      } else {
        m = mods[0];
        k = 'Start this track';
        go = 'Start';
      }
    }
    if (!m) return null;
    const status = modProgress[m.id] || 'Not Started';
    const probs = m.problemIds;
    const solved = probs.filter(id => SOLVED.has(probProgress[id])).length;
    const meta =
      status === 'Not Started' && solved === 0
        ? probs.length
          ? plural(probs.length, 'practice problem')
          : 'Not started'
        : MODULE_STATUS_LABEL[status] +
          (probs.length
            ? ' · ' + solved + ' of ' + probs.length + ' problems solved'
            : '');
    const pct = probs.length
      ? pctOf(solved, probs.length)
      : status === 'Complete'
        ? 100
        : 0;
    return {
      k,
      go,
      path: m.chapter + ' · Module ' + m.num,
      name: m.title,
      pct: pct + '%',
      meta,
      href: m.url,
    };
  })();

  // ---------- active items ----------
  const active = React.useMemo(() => {
    const ms = Object.keys(modProgress)
      .filter(
        id =>
          (modProgress[id] === 'Reading' || modProgress[id] === 'Practicing') &&
          cur.moduleTrack[id] === track
      )
      .sort((a, b) => (touched.m[b] || 0) - (touched.m[a] || 0))
      .map(id => ({
        key: 'm:' + id,
        kind: 'Module',
        name: cur.titles[id],
        st: modProgress[id],
        href: `/${track}/${id}`,
      }));
    const ps = Object.keys(probProgress)
      .filter(
        id =>
          (probProgress[id] === 'Solving' || probProgress[id] === 'Reviewing') &&
          cur.problems[id] &&
          cur.problemTracks[id]?.has(track)
      )
      .sort((a, b) => (touched.p[b] || 0) - (touched.p[a] || 0))
      .map(id => ({
        key: 'p:' + id,
        kind: 'Problem',
        name: cur.problems[id].name,
        st: probProgress[id],
        href: getProblemURL(cur.problems[id]),
      }));
    return [...ms, ...ps];
  }, [modProgress, probProgress, track, cur, touched]);
  const [showAll, setShowAll] = React.useState(false);
  const shownActive = showAll ? active : active.slice(0, ACTIVE_SHOWN);

  // ---------- statistics ----------
  const stat = (
    title: string,
    ids: string[],
    status: Record<string, string>,
    c: string[],
    i: string[],
    ignored: string
  ) => {
    // what you marked Ignored doesn't count toward the track
    const counted = ids.filter(id => status[id] !== ignored);
    const n = (vals: string[]) =>
      counted.filter(id => vals.includes(status[id])).length;
    const done = n(c);
    const prog = n(i);
    const skip = n(['Skipped']);
    const rows = [
      { name: 'Completed', n: done, cls: 'c' },
      { name: 'In progress', n: prog, cls: 'i' },
      { name: 'Skipped', n: skip, cls: 's' },
      { name: 'Not started', n: counted.length - done - prog - skip, cls: 'n' },
    ];
    return {
      title,
      total: counted.length,
      pct: pctOf(done, counted.length) + '%',
      rows,
      aria: rows.map(r => r.n + ' ' + r.name.toLowerCase()).join(', '),
    };
  };
  const stats = [
    stat(
      'Modules',
      mods.map(m => m.id),
      modProgress,
      ['Complete'],
      ['Reading', 'Practicing'],
      'Ignored'
    ),
    stat(
      'Problems',
      Array.from(cur.trackProblems[track]),
      probProgress,
      ['Solved', 'Reviewing'],
      ['Solving'],
      'Ignored'
    ),
  ];

  // ---------- header ----------
  const streak = Math.max(1, userData.consecutiveVisits || 1);
  const anyProgress =
    Object.values(modProgress).some(s => s && s !== 'Not Started') ||
    Object.values(probProgress).some(s => s && s !== 'Not Attempted');
  const returning = anyProgress || !!lastTrack || userData.numPageviews > 3;
  const first = user ? firstName(user.displayName, user.email) : '';
  const h1 = user
    ? (returning ? 'Welcome back' : 'Welcome') + (first ? ', ' + first : '')
    : returning
      ? 'Welcome back'
      : 'Your dashboard';
  const lede =
    streak > 1
      ? `You're on a ${streak}-day streak. ` +
        (lastTrack ? "Here's where you left off." : "Here's how you're doing.")
      : lastTrack || anyProgress
        ? "Here's where you left off."
        : 'Start a track and your progress, streak and activity show up here.';

  const moduleTitle = React.useCallback(
    (id: string) => cur.titles[id] || null,
    [cur]
  );
  const problemName = React.useCallback(
    (id: string) => cur.problems[id]?.name || null,
    [cur]
  );

  return (
    <Layout view="dashboard">
      <SEO title="Dashboard" image={null} pathname={props.path} noIndex />
      <TopNavigationBar current="dashboard" />
      <main className="db">
        <div className="wrap">
          <header className="db-head">
            <div className="db-head-t">
              <p className="crumbs">
                <Link to="/">Home</Link>
                <span className="sep">/</span>
                <span className="here">Dashboard</span>
              </p>
              <h1 className="db-h1">{ready ? h1 : 'Dashboard'}</h1>
              <p className="db-lede" style={ready ? undefined : { visibility: 'hidden' }}>
                {ready ? lede : 'Loading your progress.'}
              </p>
            </div>
            <label className="sel db-tsel">
              <span className="sel-k">Showing progress for</span>
              <select
                value={track}
                onChange={e => {
                  setPicked(e.target.value as SectionID);
                  setShowAll(false);
                }}
              >
                {UG_TRACKS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <IcoChev />
            </label>
          </header>

          {!ready ? (
            <div className="db-wait" aria-busy="true" />
          ) : (
            <>
              {cont ? (
                <Link className="cont" to={cont.href}>
                  <div className="cont-l">
                    <p className="cont-k">{cont.k}</p>
                    <p className="cont-path">{cont.path}</p>
                    <h2 className="cont-t">{cont.name}</h2>
                    <div className="bar cont-bar">
                      <span style={{ width: cont.pct }} />
                    </div>
                    <p className="cont-meta">{cont.meta}</p>
                  </div>
                  <span className="cont-go">
                    {cont.go}
                    <IcoArrow />
                  </span>
                </Link>
              ) : null}

              {!user ? (
                <section className="db-card db-sign" aria-labelledby="sg-h">
                  <img
                    className="db-sign-pose"
                    src="/ug/img/panda-wave.webp"
                    alt=""
                    width={450}
                    height={464}
                  />
                  <div className="db-sign-t">
                    <h2 className="db-h2" id="sg-h">
                      Your progress is only saved on this device
                    </h2>
                    <p className="db-sub">
                      Sign in to keep it safe and pick up where you left off
                      on any device.
                    </p>
                  </div>
                  <Btn kind="p" onClick={() => signIn()} arrow>
                    Sign in
                  </Btn>
                </section>
              ) : null}

              <div className="db-row">
                <ActivityCard
                  data={userData}
                  problemName={problemName}
                  moduleTitle={moduleTitle}
                />

                <section className="db-card db-items" aria-labelledby="ai-h">
                  <div className="db-card-h">
                    <h2 className="db-h2" id="ai-h">
                      Active items
                    </h2>
                    <p className="db-sub">
                      {active.length ? active.length + ' open' : 'Nothing open'}
                    </p>
                  </div>
                  {active.length ? (
                    <ul className="ai-l">
                      {shownActive.map(a => (
                        <li key={a.key}>
                          <Link to={a.href}>
                            <span className="ai-k">{a.kind}</span>
                            <span className="ai-t">{a.name}</span>
                          </Link>
                          <span className={'pill ' + PILL[a.st]}>{a.st}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ai-empty">
                      No active problems or modules yet. Anything you mark as
                      reading, solving or reviewing shows up here.
                    </p>
                  )}
                  {active.length > ACTIVE_SHOWN ? (
                    <button
                      className="ai-more"
                      type="button"
                      aria-expanded={showAll}
                      onClick={() => setShowAll(s => !s)}
                    >
                      {showAll
                        ? 'Show fewer'
                        : 'Show all ' + active.length}
                    </button>
                  ) : null}
                </section>
              </div>

              <h2 className="db-sec-h">
                Statistics<span>{trackLabel}</span>
              </h2>
              <div className="db-stats">
                {stats.map(s => (
                  <section className="db-card stat" key={s.title}>
                    <div className="stat-h">
                      <div>
                        <h3 className="stat-t">{s.title}</h3>
                        <p className="db-sub">{s.total} total</p>
                      </div>
                      <p className="stat-pct">
                        <b>{s.pct}</b>
                        <span>complete</span>
                      </p>
                    </div>
                    <ul className="stat-l">
                      {s.rows.map(r => (
                        <li key={r.cls}>
                          <span className={'lg ' + r.cls} aria-hidden="true" />
                          <span className="stat-n">{r.name}</span>
                          <b>{r.n}</b>
                        </li>
                      ))}
                    </ul>
                    <div className="seg" role="img" aria-label={s.aria}>
                      {s.rows
                        .filter(r => r.n > 0)
                        .map(r => (
                          <span
                            key={r.cls}
                            className={r.cls}
                            style={{ flexGrow: r.n }}
                          />
                        ))}
                    </div>
                  </section>
                ))}
              </div>

              <StreakRow
                streak={streak}
                lastVisitDate={userData.lastVisitDate}
              />
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}

export const pageQuery = graphql`
  query {
    modules: allXdm(
      filter: {
        fileAbsolutePath: { regex: "/content/" }
        fields: { division: { ne: null } }
      }
    ) {
      nodes {
        frontmatter {
          id
          title
        }
        fields {
          division
        }
      }
    }
    problemLists: allModuleProblemLists {
      nodes {
        moduleId
        problemLists {
          problems {
            uniqueId
            name
            source
          }
        }
      }
    }
  }
`;
