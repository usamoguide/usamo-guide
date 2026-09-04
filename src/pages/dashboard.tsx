import { graphql, Link, PageProps } from 'gatsby';
import * as React from 'react';
import { SECTION_LABELS } from '../../content/ordering';
import ActiveItems, { ActiveItem } from '../components/Dashboard/ActiveItems';
import Activity from '../components/Dashboard/Activity';
import DailyStreak from '../components/Dashboard/DailyStreak';
import Card from '../components/Dashboard/DashboardCard';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { useSignIn } from '../context/SignInContext';
import { useLastVisitInfo } from '../context/UserDataContext/properties/lastVisit';
import {
  useLastViewedModule,
  useShowIgnoredSetting,
} from '../context/UserDataContext/properties/simpleProperties';
import {
  useUserProgressOnModules,
  useUserProgressOnProblems,
} from '../context/UserDataContext/properties/userProgress';
import { useCurrentUser } from '../context/UserDataContext/UserDataContext';
import {
  useModulesProgressInfo,
  useProblemsProgressInfo,
} from '../utils/getProgressInfo';

const VANILLA = 'var(--text-primary)';
const TEXT_SECONDARY = 'var(--text-muted)';
const PAGE_BG = 'var(--bg-page)';

export default function DashboardPage(props: PageProps) {
  const { modules, problems } = props.data as any;
  const moduleInfoById = modules.edges.reduce((acc, cur) => {
    const id = cur.node.frontmatter.id;
    const division = cur.node.fields?.division;
    if (!id || !division) return acc;
    acc[id] = {
      title: cur.node.frontmatter.title,
      section: division,
      url: `/${division}/${id}`,
    };
    return acc;
  }, {});
  const problemIDMap = React.useMemo(() => {
    // 1. problems in modules
    const res = problems.edges.reduce((acc, cur) => {
      const problem = cur.node;
      // ignore problems that don't have an associated module (extraProblems.json)
      if (problem.module) {
        const moduleId = problem.module.frontmatter.id;
        const moduleInfo = moduleInfoById[moduleId];
        if (!moduleInfo) {
          return acc;
        }
        if (!(problem.uniqueId in acc)) {
          acc[problem.uniqueId] = {
            label: `${problem.source}: ${problem.name}`,
            modules: [],
          };
        }
        acc[problem.uniqueId].modules.push({
          url: `${moduleInfo.url}/#problem-${problem.uniqueId}`,
          moduleId,
        });
      }
      return acc;
    }, {});

    return res;
  }, [problems, moduleInfoById]);
  const lastViewedModuleID = useLastViewedModule();
  const userProgressOnModules = useUserProgressOnModules();
  const userProgressOnProblems = useUserProgressOnProblems();
  const currentUser = useCurrentUser();
  const { consecutiveVisits } = useLastVisitInfo();
  const showIgnored = useShowIgnoredSetting();
  const { signIn } = useSignIn();

  const lastViewedModuleURL = moduleInfoById[lastViewedModuleID]?.url;
  const activeModules: ActiveItem[] = React.useMemo(() => {
    return Object.keys(userProgressOnModules)
      .filter(
        x =>
          (userProgressOnModules[x] === 'Reading' ||
            userProgressOnModules[x] === 'Practicing' ||
            userProgressOnModules[x] === 'Skipped' ||
            (showIgnored && userProgressOnModules[x] === 'Ignored')) &&
          moduleInfoById.hasOwnProperty(x)
      )
      .map(x => ({
        label: `${SECTION_LABELS[moduleInfoById[x].section]}: ${moduleInfoById[x].title}`,
        url: moduleInfoById[x].url,
        status: userProgressOnModules[x] as
          | 'Skipped'
          | 'Reading'
          | 'Practicing'
          | 'Ignored',
      }));
  }, [userProgressOnModules, showIgnored, moduleInfoById]);
  const activeProblems: ActiveItem[] = React.useMemo(() => {
    return Object.keys(userProgressOnProblems)
      .filter(
        x =>
          (userProgressOnProblems[x] === 'Reviewing' ||
            userProgressOnProblems[x] === 'Solving' ||
            userProgressOnProblems[x] === 'Skipped' ||
            (showIgnored && userProgressOnProblems[x] === 'Ignored')) &&
          problemIDMap.hasOwnProperty(x)
      )
      .map(x => ({
        label: problemIDMap[x].label,
        url: problemIDMap[x].modules[0].url,
        status: userProgressOnProblems[x] as
          | 'Reviewing'
          | 'Solving'
          | 'Skipped'
          | 'Ignored',
      }));
  }, [userProgressOnProblems, showIgnored]);

  const lastViewedSection =
    moduleInfoById[lastViewedModuleID]?.section || 'foundations';
  const moduleProgressIDs = Object.keys(moduleInfoById).filter(
    x => moduleInfoById[x].section === lastViewedSection
  );
  const allModulesProgressInfo = useModulesProgressInfo(moduleProgressIDs);

  const problemStatisticsIDs = React.useMemo(() => {
    return Object.keys(problemIDMap).filter(problemID =>
      problemIDMap[problemID].modules.some(
        (module: { url: string; moduleId: string }) =>
          moduleInfoById[module.moduleId]?.section === lastViewedSection
      )
    );
  }, [problemIDMap, lastViewedSection, moduleInfoById]);
  const allProblemsProgressInfo = useProblemsProgressInfo(problemStatisticsIDs);

  const [finishedRendering, setFinishedRendering] = React.useState(false);
  React.useEffect(() => {
    setFinishedRendering(true);
  }, []);

  /**
   * Progress for one section.
   *
   * The four states are separated by ink weight, not by hue — this palette has
   * no four distinguishable colours to spend here, and spending them would
   * break the rule that status never rides on colour alone. Every state also
   * carries its label and its count, so the panel survives being read in
   * greyscale or by someone who cannot separate the steps at all.
   */
  const renderStatsTile = (
    title: string,
    total: number,
    counts: {
      completed: number;
      inProgress: number;
      skipped: number;
      notStarted: number;
    }
  ) => {
    const segment = (value: number) =>
      total === 0 ? 0 : (value / total) * 100;

    const states = [
      { label: 'Completed', value: counts.completed, ink: 'var(--heatmap-4)' },
      {
        label: 'In progress',
        value: counts.inProgress,
        ink: 'var(--heatmap-3)',
      },
      { label: 'Skipped', value: counts.skipped, ink: 'var(--heatmap-2)' },
      {
        label: 'Not started',
        value: counts.notStarted,
        ink: 'var(--heatmap-empty)',
      },
    ];

    return (
      <Card>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3
              className="text-[0.9375rem] font-semibold"
              style={{ color: VANILLA }}
            >
              {title}
            </h3>
            {/* Plain fraction rather than a hero percentage: "0 of 28" says
                what is actually true without turning a blank slate into a
                headline. */}
            <p
              className="shrink-0 font-mono text-sm tabular-nums"
              style={{ color: TEXT_SECONDARY }}
            >
              <span style={{ color: VANILLA }}>{counts.completed}</span>
              {' / '}
              {total}
            </p>
          </div>

          <div
            className="mt-4 flex h-1.5 overflow-hidden rounded-full"
            style={{ background: 'var(--heatmap-empty)' }}
            role="img"
            aria-label={`${counts.completed} of ${total} completed, ${counts.inProgress} in progress, ${counts.skipped} skipped, ${counts.notStarted} not started`}
          >
            {states.slice(0, 3).map(state => (
              <div
                key={state.label}
                className="h-full"
                style={{ width: `${segment(state.value)}%`, background: state.ink }}
              />
            ))}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {states.map(state => (
              <div key={state.label} className="flex flex-col gap-1">
                <dt
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: TEXT_SECONDARY }}
                >
                  <span
                    aria-hidden="true"
                    className="progress-swatch"
                    style={{ background: state.ink }}
                  />
                  {state.label}
                </dt>
                <dd
                  className="font-mono text-sm tabular-nums"
                  style={{ color: VANILLA }}
                >
                  {state.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <SEO title="Dashboard" image={null} pathname={props.path} noIndex />

      <div
        data-page-tone="dark"
        className="ui-page min-h-screen px-0"
        style={
          {
            background: PAGE_BG,
            color: VANILLA,
          } as React.CSSProperties
        }
      >
        <TopNavigationBar linkLogoToIndex={true} redirectToDashboard={false} />

        {finishedRendering && (
          <main className="mx-auto max-w-screen-xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
            {/* The page opens with the one action a returning student almost
                always wants — resume where they stopped — sized to its label
                rather than stretched across the viewport. */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1
                  className="text-2xl font-bold tracking-[-0.02em]"
                  style={{ color: VANILLA }}
                >
                  Dashboard
                </h1>
                {currentUser && (
                  <p className="mt-1 text-sm" style={{ color: TEXT_SECONDARY }}>
                    Signed in as {currentUser.email}
                  </p>
                )}
              </div>
              <Link
                className="btn btn-primary"
                to={
                  lastViewedModuleURL ||
                  '/foundations/fractions_percentages_proportions_p1'
                }
              >
                {lastViewedModuleURL
                  ? `Continue: ${moduleInfoById[lastViewedModuleID]?.title}`
                  : 'Start: Fractions, proportions and percentages'}
              </Link>
            </div>

            {!currentUser && (
              <div
                className="mt-6 flex flex-col gap-4 rounded-lg border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  background: 'var(--bg-surface-alt)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: VANILLA }}
                  >
                    You're not signed in
                  </h2>
                  <p
                    className="mt-1 text-sm leading-6"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Progress on this page is stored in this browser only. Sign
                    in to keep it across devices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => signIn()}
                  className="btn btn-primary shrink-0 self-start sm:self-auto"
                >
                  Sign in
                </button>
              </div>
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <h2
                  className="text-lg font-semibold tracking-[-0.01em]"
                  style={{ color: VANILLA }}
                >
                  Activity
                </h2>
                <div className="mt-4">
                  <Activity />
                </div>
              </section>
              <section className="lg:col-span-1">
                <h2
                  className="text-lg font-semibold tracking-[-0.01em]"
                  style={{ color: VANILLA }}
                >
                  Active items
                </h2>
                <div className="mt-4 space-y-6">
                  {activeProblems.length > 0 && (
                    <ActiveItems type="problems" items={activeProblems} />
                  )}
                  {activeModules.length > 0 && (
                    <ActiveItems type="modules" items={activeModules} />
                  )}
                  {activeProblems.length === 0 &&
                    activeModules.length === 0 && (
                      <Card>
                        <p
                          className="p-5 text-sm leading-6"
                          style={{ color: TEXT_SECONDARY }}
                        >
                          Nothing in progress. Open a module and it will show up
                          here.
                        </p>
                      </Card>
                    )}
                </div>
              </section>
            </div>

            <section className="mt-12">
              <h2
                className="text-lg font-semibold tracking-[-0.01em]"
                style={{ color: VANILLA }}
              >
                Progress
              </h2>
              <p className="mt-1 text-sm" style={{ color: TEXT_SECONDARY }}>
                {SECTION_LABELS[lastViewedSection]}
              </p>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                {renderStatsTile(
                  'Modules',
                  moduleProgressIDs.length,
                  allModulesProgressInfo
                )}
                {renderStatsTile(
                  'Problems',
                  Object.keys(problemStatisticsIDs).length,
                  allProblemsProgressInfo
                )}
              </div>
            </section>

            <section className="mt-12">
              <DailyStreak streak={consecutiveVisits} />
            </section>
          </main>
        )}
      </div>
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
      edges {
        node {
          frontmatter {
            title
            id
          }
          fields {
            division
          }
        }
      }
    }
    problems: allProblemInfo {
      edges {
        node {
          uniqueId
          name
          source
          module {
            frontmatter {
              id
            }
          }
        }
      }
    }
  }
`;
