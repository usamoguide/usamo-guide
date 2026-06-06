import { graphql, Link, PageProps } from 'gatsby';
import * as React from 'react';
import { SECTION_LABELS } from '../../content/ordering';
import ActiveItems, { ActiveItem } from '../components/Dashboard/ActiveItems';
import Activity from '../components/Dashboard/Activity';
import DailyStreak from '../components/Dashboard/DailyStreak';
import Card from '../components/Dashboard/DashboardCard';
import WelcomeBackBanner from '../components/Dashboard/WelcomeBackBanner';
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

const VANILLA = '#F4EDEA';
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.72)';
const MIDNIGHT_GRADIENT =
  'linear-gradient(to bottom, #120F24 0%, #0E0B1F 48%, #0A0818 100%)';

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
    const percentComplete = total === 0 ? 0 : Math.round((counts.completed / total) * 100);
    const segment = (value: number) => (total === 0 ? 0 : (value / total) * 100);

    return (
      <Card>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg leading-6 font-medium" style={{ color: VANILLA }}>
                {title}
              </h3>
              <p className="mt-1 text-sm" style={{ color: TEXT_SECONDARY }}>
                {total} total
              </p>
            </div>
            <div className="rounded-lg px-4 py-3 text-center" style={{ background: 'rgba(244, 237, 234, 0.10)' }}>
              <div className="text-2xl font-semibold" style={{ color: VANILLA }}>
                {percentComplete}%
              </div>
              <div className="text-xs font-medium uppercase" style={{ color: TEXT_SECONDARY }}>
                Complete
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: TEXT_SECONDARY }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#70428A' }} />
                Completed
              </span>
              <span className="font-medium" style={{ color: VANILLA }}>
                {counts.completed}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: TEXT_SECONDARY }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#E085FF' }} />
                In progress
              </span>
              <span className="font-medium" style={{ color: VANILLA }}>
                {counts.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: TEXT_SECONDARY }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#F0C2FF' }} />
                Skipped
              </span>
              <span className="font-medium" style={{ color: VANILLA }}>
                {counts.skipped}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: TEXT_SECONDARY }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'rgba(210, 212, 200, 0.6)' }} />
                Not started
              </span>
              <span className="font-medium" style={{ color: VANILLA }}>
                {counts.notStarted}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'rgba(244, 237, 234, 0.16)' }}>
              <div
                style={{ width: `${segment(counts.completed)}%`, background: '#70428A' }}
                className="h-2"
              />
              <div
                style={{ width: `${segment(counts.inProgress)}%`, background: '#E085FF' }}
                className="h-2"
              />
              <div
                style={{ width: `${segment(counts.skipped)}%`, background: '#F0C2FF' }}
                className="h-2"
              />
              <div
                style={{
                  width: `${segment(counts.notStarted)}%`,
                  background: 'rgba(210, 212, 200, 0.6)',
                }}
                className="h-2"
              />
            </div>
          </div>
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
        style={{
          backgroundImage: MIDNIGHT_GRADIENT,
          color: VANILLA,
        } as React.CSSProperties}
      >
        <TopNavigationBar linkLogoToIndex={true} redirectToDashboard={false} />

        {finishedRendering && (
          <main className="pb-12">
            <div className="mx-auto mb-4 max-w-screen-2xl">
              <div className="pt-4 pb-6 lg:px-4">
                <div className="mb-4 flex flex-wrap">
                  <div className="w-full text-center">
                    {currentUser ? (
                      <>
                        Signed in as <i>{currentUser.email}</i>.
                      </>
                    ) : (
                      <div
                        className="w-full rounded-2xl border px-5 py-5 text-center shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                        style={{
                          borderColor: 'rgba(112, 66, 138, 0.28)',
                          background:
                            'linear-gradient(135deg, rgba(244, 237, 234, 0.92) 0%, rgba(240, 194, 255, 0.84) 100%)',
                          color: '#120F24',
                        }}
                      >
                        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 lg:justify-between">
                          <div className="max-w-2xl text-center lg:text-left">
                            <div className="text-xl font-semibold sm:text-2xl">
                              You&apos;re not signed in!
                            </div>
                            <div
                              className="mt-1 text-sm"
                              style={{ color: 'rgba(18, 15, 36, 0.8)' }}
                            >
                              Track progress, unlock problem sets, and sync across devices.
                            </div>
                            <button
                              type="button"
                              onClick={() => signIn()}
                              className="purple-motion-effect mt-4 inline-flex items-center justify-center rounded-full px-6 py-2 font-mono text-sm font-bold leading-tight"
                              style={{
                                border: '1px solid rgba(240, 194, 255, 0.34)',
                                background: 'linear-gradient(135deg, #5A2F87 0%, #C58BFF 100%)',
                                '--pme-color': '#F4EDEA',
                                '--pme-hover-color': '#201C36',
                                '--pme-wipe-bg': '#F0C2FF',
                              } as React.CSSProperties}
                            >
                              Save Progress
                            </button>
                          </div>
                          <img
                            src="/images/cryingmascot.png"
                            alt="Crying mascot"
                            className="h-24 w-auto shrink-0 object-contain sm:h-28"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto mb-8 max-w-screen-2xl px-4 sm:px-6 lg:px-4">
              <div className="grid gap-8 lg:grid-cols-3">
                <section className="lg:col-span-2">
                  <h1 className="text-3xl leading-tight font-bold" style={{ color: VANILLA }}>
                    Activity
                  </h1>
                  <Activity />
                </section>
                <section className="lg:col-span-1">
                  <h2 className="text-2xl leading-tight font-bold" style={{ color: VANILLA }}>
                    Active items
                  </h2>
                  <div className="mt-4 space-y-6">
                    {activeProblems.length > 0 && (
                      <ActiveItems type="problems" items={activeProblems} />
                    )}
                    {activeModules.length > 0 && (
                      <ActiveItems type="modules" items={activeModules} />
                    )}
                    {activeProblems.length === 0 && activeModules.length === 0 && (
                      <Card>
                        <div className="px-4 py-5 text-sm sm:p-6" style={{ color: TEXT_SECONDARY }}>
                          No active problems or modules yet.
                        </div>
                      </Card>
                    )}
                  </div>
                </section>
              </div>
              <div className="mt-6 flex">
                <Link
                  className="purple-motion-effect inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-mono text-base font-bold leading-tight"
                  style={{
                    border: '1px solid rgba(240, 194, 255, 0.34)',
                    background: 'linear-gradient(135deg, #5A2F87 0%, #C58BFF 100%)',
                    '--pme-color': '#F4EDEA',
                    '--pme-hover-color': '#201C36',
                    '--pme-wipe-bg': '#F0C2FF',
                  } as React.CSSProperties}
                  to={
                    lastViewedModuleURL ||
                    '/foundations/fractions_percentages_proportions_p1'
                  }
                >
                  {lastViewedModuleURL
                    ? `Continue: ${moduleInfoById[lastViewedModuleID]?.title}`
                    : 'Start: Fractions, Proportions and Percentage Conversions!'}
                </Link>
              </div>
            </div>
            <header>
              <div className="mx-auto max-w-screen-2xl px-8">
                <h1 className="text-3xl leading-tight font-bold" style={{ color: VANILLA }}>
                  Statistics
                </h1>
              </div>
            </header>
            <div className="mx-auto max-w-screen-2xl">
              <div className="space-y-8 py-4 px-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 lg:px-8">
                <div className="space-y-8">
                  {renderStatsTile(
                    `Modules Progress - ${SECTION_LABELS[lastViewedSection]}`,
                    moduleProgressIDs.length,
                    allModulesProgressInfo
                  )}
                </div>
                <div className="space-y-8">
                  {renderStatsTile(
                    `Problems Progress - ${SECTION_LABELS[lastViewedSection]}`,
                    Object.keys(problemStatisticsIDs).length,
                    allProblemsProgressInfo
                  )}
                </div>
                <DailyStreak streak={consecutiveVisits} />
              </div>
            </div>
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
