import { Link } from 'gatsby';
import * as React from 'react';
import {
  SECTION_LABELS,
  SECTION_SEO_DESCRIPTION,
  SECTION_SEO_TITLES,
  SectionID,
} from '../../../content/ordering';
import { ModuleFrequency, ModuleLinkInfo } from '../../models/module';
import {
  useModulesProgressInfo,
  useProblemsProgressInfo,
} from '../../utils/getProgressInfo';
import { getModulesForDivision } from '../../utils/utils';
import DashboardProgress, {
  DashboardProgressSmall,
} from '../Dashboard/DashboardProgress';
import Layout from '../layout';
import SEO from '../seo';
import TopNavigationBar from '../TopNavigationBar/TopNavigationBar';
import ModuleLink from './ModuleLink';

/* All sections share the one page background; see --bg-page in src/styles/theme.css. */
const HeroAccentColor: { [key in SectionID]: string } = {
  foundations: 'bg-[var(--bg-page)]',
  intermediate: 'bg-[var(--bg-page)]',
  advanced: 'bg-[var(--bg-page)]',
  usamo: 'bg-[var(--bg-page)]',
};

const SECTION_DESCRIPTION: { [key in SectionID]: React.ReactNode } = {
  foundations: (
    <>
      Build your core toolbox first: algebra, geometry, counting, and number
      theory fundamentals that show up across AMC and early AIME problems.
      <br />
      Focus on understanding patterns and writing clean solutions before moving
      on.
    </>
  ),
  intermediate: (
    <>
      Strengthen problem-solving depth with multi-step AIME-style techniques,
      including functional equations, inequalities, advanced counting, and
      richer geometry.
      <br />
      This stage is about speed plus rigor: solve accurately under time
      pressure.
    </>
  ),
  advanced: (
    <>
      Tackle olympiad-level ideas and harder AIME/USAMO crossover topics such as
      advanced number theory, geometry transformations, and deep algebraic
      methods.
      <br />
      Expect longer chains of reasoning and proof-oriented structure.
    </>
  ),
  usamo: (
    <>
      Prepare specifically for proof-based olympiad rounds with guided practice
      in construction, invariants, and elegant argument design.
      <br />
      Emphasis is on clarity, correctness, and full-solution communication.
    </>
  ),
};

type SyllabusPageProps = {
  data: Queries.SyllabusQuery;
  division: SectionID;
  path: string;
};

export default function SyllabusPage({
  data,
  division,
  path,
}: SyllabusPageProps) {
  const isFoundations = division === 'foundations';

  const allModules = data.modules.nodes.reduce(
    (acc, cur) => {
      acc[cur.frontmatter.id] = cur;
      return acc;
    },
    {} as { [key: string]: (typeof data.modules.nodes)[0] }
  );

  const section = getModulesForDivision(allModules, division);

  const moduleIDs = section.reduce((acc, cur) => {
    const ids = cur.items
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map(x => x.frontmatter.id);
    return [...acc, ...ids];
  }, [] as string[]);
  const moduleProgressInfo = useModulesProgressInfo(moduleIDs);

  const problemIDs = [
    ...new Set(data.problems.nodes.map(x => x.uniqueId) as string[]),
  ];
  const problemsProgressInfo = useProblemsProgressInfo(problemIDs);

  const useProgressBarForCategory = (category: (typeof section)[0]) => {
    const categoryModuleIDs = category.items
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .map(module => module.frontmatter.id);
    const categoryProblemIDs = data.problems.nodes
      .filter(x => categoryModuleIDs.includes(x.module?.frontmatter.id ?? ''))
      .map(x => x.uniqueId);
    const categoryProblemsProgressInfo =
      useProblemsProgressInfo(categoryProblemIDs);
    return (
      categoryProblemIDs.length > 1 && (
        <DashboardProgressSmall
          {...categoryProblemsProgressInfo}
          total={categoryProblemIDs.length}
        />
      )
    );
  };

  return (
    <Layout>
      <SEO
        title={SECTION_SEO_TITLES[division]}
        description={SECTION_SEO_DESCRIPTION[division]}
        image={null}
        pathname={path}
      />
      <div className="relative min-h-screen overflow-hidden bg-[var(--bg-page)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="syllabus-grid-pattern"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-[#F0C2FF]/30"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#syllabus-grid-pattern)"
              />
            </svg>
          </div>
        </div>

        <TopNavigationBar />

        <main>
          <div className="relative py-12 sm:py-16">
            <div
              className={`absolute inset-x-0 top-0 h-full ${HeroAccentColor[division]} opacity-90`}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="mb-6 text-center text-5xl leading-10 font-black tracking-tight text-[#F4EDEA] sm:leading-none md:text-6xl">
                {SECTION_LABELS[division]}
              </h1>
              <p className="mx-auto mb-8 max-w-4xl text-center text-[#F4EDEA]/90 sm:mb-10">
                {SECTION_DESCRIPTION[division]}
              </p>

              {(division === 'advanced' || division === 'usamo') && (
                <div className="mx-auto mb-8 max-w-4xl rounded-2xl bg-[#171228]/76 px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-[#F0C2FF] sm:text-base">
                    This section is currently under development. The content you
                    see here is filler for now.
                  </p>
                </div>
              )}

              <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
                  style={
                    {
                      border: '1px solid rgba(240, 194, 255, 0.34)',
                      background: '#6D3B9F',
                      boxShadow: 'none',
                      '--pme-color': '#F4EDEA',
                      '--pme-hover-color': '#201C36',
                      '--pme-wipe-bg': '#F0C2FF',
                    } as React.CSSProperties
                  }
                >
                  Continue Learning &gt;
                </Link>
                <a
                  href="https://discord.gg/WZge4DWUuy"
                  target="_blank"
                  rel="noreferrer"
                  className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
                  style={
                    {
                      border: '1px solid rgba(240, 194, 255, 0.34)',
                      background: '#EFE3FF',
                      boxShadow: 'none',
                      '--pme-color': '#2C1842',
                      '--pme-hover-color': '#201C36',
                      '--pme-wipe-bg': '#F0C2FF',
                    } as React.CSSProperties
                  }
                >
                  Join Community
                </a>
              </div>

              <div className="mx-auto grid max-w-2xl gap-8 lg:max-w-full lg:grid-cols-2">
                <div className="rounded-xl bg-[#171228]/68 backdrop-blur sm:rounded-2xl">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-semibold text-[#F4EDEA]">
                      Modules Progress
                    </h3>
                    <div className="mt-6">
                      <DashboardProgress
                        {...moduleProgressInfo}
                        total={moduleIDs.length}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#171228]/68 backdrop-blur sm:rounded-2xl">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-semibold text-[#F4EDEA]">
                      Problems Progress
                    </h3>
                    <div className="mt-6">
                      <DashboardProgress
                        {...problemsProgressInfo}
                        total={problemIDs.length}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="syllabus-dotted-line-container relative mx-auto max-w-(--breakpoint-xl) space-y-6 px-4 py-12">
            {section.map(category => (
              <div
                key={category.name}
                className="group/category flex flex-col rounded-2xl bg-[#171228]/58 p-4 transition md:flex-row"
              >
                <div className="flex flex-1 flex-col items-center justify-center pr-0 text-center md:pr-12">
                  <h2 className="py-3 text-2xl leading-tight font-bold tracking-tight text-[#F4EDEA] transition group-hover/category:text-[#F0C2FF] md:text-3xl">
                    {category.name}
                  </h2>
                  <div className="py-2 leading-6 text-[#D2D4C8] transition group-hover/category:text-[#F4EDEA]">
                    {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                    {useProgressBarForCategory(category)}
                  </div>
                  <p className="max-w-sm text-sm text-[#D2D4C8] transition group-hover/category:text-[#F4EDEA]">
                    {category.description}
                  </p>
                </div>
                <div className="flex-1 pl-12">
                  {category.items
                    .filter((x): x is NonNullable<typeof x> => Boolean(x))
                    .map(item => (
                      <ModuleLink
                        key={item.frontmatter.id}
                        link={
                          new ModuleLinkInfo(
                            item.frontmatter.id,
                            division,
                            item.frontmatter.title,
                            item.frontmatter.description,
                            item.frontmatter.frequency as ModuleFrequency,
                            item.isIncomplete,
                            [],
                            item.fields?.gitAuthorTime
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
