import { Link } from 'gatsby';
import * as React from 'react';
import { SectionID } from '../../../../content/ordering';
import { useSignIn } from '../../../context/SignInContext';
import { useCurrentUser } from '../../../context/UserDataContext/UserDataContext';
import Layout from '../../layout';
import SEO from '../../seo';
import TopNavigationBar from '../../TopNavigationBar/TopNavigationBar';
import Btn from '../Btn';
import { IcoBook } from '../icons';

// the export's clock (start.html rec-meta)
const IcoClock = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
import { UG_LINKS, UG_TRACKS } from '../links';
import { useContinueTarget } from '../UGNav';
import { buildTrack, ModuleSource, plural, TrackSection } from '../track/curriculum';
import ModuleDesc from '../track/ModuleDesc';
import Placement, { hasPlacement, PlacementPools } from './Placement';

/** The four answers to "where are you now?", one per track. */
export const LEVELS: { track: SectionID; title: string; desc: string }[] = [
  {
    track: 'foundations',
    title: "I'm new to math contests",
    desc: "You haven't taken one yet, or you've only tried a few problems.",
  },
  {
    track: 'intermediate',
    title: "I've taken the AMC 8 or AMC 10",
    desc: 'You know the format and want a higher score.',
  },
  {
    track: 'advanced',
    title: "I'm aiming for the AIME",
    desc: 'You can solve most of the first 15 problems on an AMC 10 or 12.',
  },
  {
    track: 'usamo',
    title: "I'm working toward USAMO or USAJMO",
    desc: "You've qualified for the AIME and want to start writing proofs.",
  },
];

const HOW = [
  {
    img: 'panda-read',
    h: 'Read the lesson',
    p: 'Each module teaches one idea with worked examples. Most take 15 to 30 minutes.',
  },
  {
    img: 'panda-focus',
    h: 'Do the practice set',
    p: 'Problems from past contests, sorted from easiest to hardest.',
  },
  {
    img: 'panda-idea',
    h: 'Mark it done',
    p: 'Your progress shows up on this page, so you always know where to pick up.',
  },
  {
    img: 'panda-stuck',
    h: "Ask when you're stuck",
    p: "Post the problem in the Discord and say what you've tried so far.",
  },
];

export type StartPageData = {
  modules: {
    nodes: ReadonlyArray<{
      isIncomplete: boolean | null;
      readingMinutes?: number | null;
      frontmatter: { id: string | null; title: string; description: string | null };
      fields: { division: string | null } | null;
    }>;
  };
  problemCounts: {
    group: ReadonlyArray<{ fieldValue: string | null; totalCount: number }>;
  };
};

export default function StartPage({
  data,
  path,
  pools,
}: {
  data: StartPageData;
  path: string;
  /** problem pools for "Try five quick problems", easiest first */
  pools: PlacementPools;
}): JSX.Element {
  const user = useCurrentUser();
  const { signIn } = useSignIn();
  const cont = useContinueTarget();
  const [level, setLevel] = React.useState(0);
  const [placing, setPlacing] = React.useState(false);
  const optRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const recRef = React.useRef<HTMLElement | null>(null);

  // the first sections of every track, from the ordering and the frontmatter
  const tracks = React.useMemo(() => {
    const counts: { [id: string]: number } = {};
    data.problemCounts.group.forEach(g => {
      if (g.fieldValue) counts[g.fieldValue] = g.totalCount;
    });
    const out = {} as { [k in SectionID]: TrackSection[] };
    LEVELS.forEach(({ track }) => {
      const modules: { [id: string]: ModuleSource } = {};
      data.modules.nodes.forEach(n => {
        if (n.fields?.division !== track || !n.frontmatter.id) return;
        modules[n.frontmatter.id] = {
          id: n.frontmatter.id,
          title: n.frontmatter.title,
          description: n.frontmatter.description,
          isIncomplete: n.isIncomplete,
          minutes: n.readingMinutes ?? null,
        };
      });
      out[track] = buildTrack(track, modules, id => counts[id] || 0);
    });
    return out;
  }, [data]);

  const L = LEVELS[level];
  const T = UG_TRACKS.find(t => t.id === L.track) || UG_TRACKS[0];
  const sections = tracks[L.track];
  const ordered = sections.flatMap(s => s.modules);
  const first = ordered[0];
  const after = ordered.slice(1, 3);

  const pick = (k: number) => setLevel(k);
  // arrow keys move the choice, as in a native radio group
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const k = (level + d + LEVELS.length) % LEVELS.length;
    setLevel(k);
    optRefs.current[k]?.focus();
  };
  // the placement panel hands back a level: pick it and bring the answer into view
  const pickFromPlacement = (k: number) => {
    setLevel(k);
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
      recRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const signInLink = (label: string) => (
    <a
      href="#sign-in"
      role="button"
      onClick={e => {
        e.preventDefault();
        signIn();
      }}
    >
      {label}
    </a>
  );

  return (
    <Layout view="start">
      <SEO
        title="Start learning"
        description="Pick where you are now and get your first USAMO Guide module: Foundations (AMC 8), Intermediate (AMC 10/12), Advanced (AIME) or Olympiad (USA(J)MO)."
        image={null}
        pathname={path}
      />
      <TopNavigationBar current="start" />
      <main>
        <section className="st-hero" aria-labelledby="st-h">
          <div className="wrap st-grid">
            <div className="st-pick">
              <p className="crumbs">
                <Link to="/">Home</Link>
                <span className="sep">/</span>
                <span className="here">Start learning</span>
              </p>
              <h1 className="st-h1" id="st-h">
                Where should you start?
              </h1>
              <p className="st-lede">
                Pick the line that sounds most like you. We&apos;ll point you to your first
                module, and you can switch tracks any time.
              </p>
              <div
                className="st-opts"
                role="radiogroup"
                aria-label="Where you are right now"
                onKeyDown={onKey}
              >
                <span className="hnote st-note" aria-hidden="true">
                  most people start here
                  <svg viewBox="0 0 44 40">
                    <path d="M40 4C30 6 14 12 8 32" />
                    <path d="M8 32L5.5 21M8 32L17.5 27" />
                  </svg>
                </span>
                {LEVELS.map((lv, k) => {
                  const t = UG_TRACKS.find(x => x.id === lv.track);
                  return (
                    <button
                      key={lv.track}
                      ref={el => {
                        optRefs.current[k] = el;
                      }}
                      className={`st-opt ${k === level ? 'on' : ''}`}
                      type="button"
                      role="radio"
                      aria-checked={k === level}
                      tabIndex={k === level ? 0 : -1}
                      onClick={() => pick(k)}
                    >
                      <span className="st-radio" aria-hidden="true" />
                      <span className="st-opt-t">{lv.title}</span>
                      <span className="st-opt-d">{lv.desc}</span>
                      <span className="st-opt-k">{t?.name}</span>
                    </button>
                  );
                })}
              </div>
              {hasPlacement(pools) ? (
                <p className="st-unsure">
                  Not sure?{' '}
                  <a
                    href="#placement"
                    role="button"
                    onClick={e => {
                      e.preventDefault();
                      setPlacing(true);
                    }}
                  >
                    Try five quick problems
                  </a>{' '}
                  and we&apos;ll suggest a track for you.
                </p>
              ) : null}
              <p className="st-unsure">
                Been here before?{' '}
                {user ? (
                  <>
                    <Link to={cont.module || UG_LINKS.dashboard}>Pick up where you left off</Link>
                    {cont.module ? (
                      <>
                        {' '}
                        or open your <Link to={UG_LINKS.dashboard}>dashboard</Link>.
                      </>
                    ) : (
                      '.'
                    )}
                  </>
                ) : (
                  <>{signInLink('Log in')} to pick up where you left off.</>
                )}
              </p>
            </div>
            <aside
              className="st-rec"
              aria-live="polite"
              aria-label="Your first step"
              ref={recRef}
            >
              <img className="st-pose" src="/ug/img/panda-point.webp" alt="" width={480} height={383} />
              <div className="rec-card">
                <p className="rec-k">Your first step</p>
                <p className="rec-track">{T.label}</p>
                <h2 className="rec-mod">{first ? first.title : T.label}</h2>
                {first ? (
                  <p className="rec-meta">
                    {first.minutes ? (
                      <>
                        <IcoClock />
                        <span>About {first.minutes} minutes</span>
                      </>
                    ) : (
                      <>
                        <IcoBook />
                        <span>Module {first.num}</span>
                      </>
                    )}
                    <span className="dot" aria-hidden="true">
                      ·
                    </span>
                    <span>
                      {first.problemCount > 0
                        ? plural(first.problemCount, 'practice problem')
                        : 'Lesson only'}
                    </span>
                  </p>
                ) : null}
                {first && first.description ? (
                  <p className="rec-why">
                    <ModuleDesc text={first.description} />
                  </p>
                ) : null}
                <div className="rec-ctas">
                  <Btn kind="w" size="lg" to={first ? first.url : `/${T.id}`} arrow>
                    Start this module
                  </Btn>
                  <Link className="rec-link" to={`/${T.id}`}>
                    See the whole track
                  </Link>
                </div>
                {after.length ? (
                  <div className="rec-next">
                    <p className="rec-next-k">After that</p>
                    <ol>
                      {after.map(m => (
                        <li key={m.id}>
                          <span className="rec-n">{m.num}</span>
                          <span>{m.title}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <section className="st-how" aria-labelledby="st-how-h">
          <div className="wrap">
            <h2 className="st-h2" id="st-how-h">
              How a module works
            </h2>
            <ol className="how">
              {HOW.map((h, i) => (
                <li className="how-i" key={h.h}>
                  <img className="how-fox" src={`/ug/img/${h.img}.webp`} alt="" width={450} height={464} />
                  <span className="how-n">{i + 1}</span>
                  <h3>{h.h}</h3>
                  <p>{h.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="st-save">
          <div className="wrap">
            <div className="save-card">
              {user ? (
                <>
                  <div>
                    <h2 className="save-h">Your progress is saved</h2>
                    <p>
                      You&apos;re signed in, so what you finish here syncs across your devices.
                    </p>
                  </div>
                  <Btn kind="s" size="sm" to={UG_LINKS.dashboard}>
                    Open your dashboard
                  </Btn>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="save-h">You don&apos;t need an account to start</h2>
                    <p>Sign in when you want your progress saved and synced across devices.</p>
                  </div>
                  <Btn kind="s" size="sm" onClick={() => signIn()}>
                    Sign in
                  </Btn>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <Placement
        pools={pools}
        open={placing}
        onClose={() => setPlacing(false)}
        onPick={pickFromPlacement}
      />
    </Layout>
  );
}
