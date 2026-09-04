import { Link } from 'gatsby';
import * as React from 'react';
import { useContext } from 'react';
import { SECTION_LABELS } from '../../../../content/ordering';
import { useMarkdownLayout } from '../../../context/MarkdownLayoutContext';
import { useMarkdownProblems } from '../../../context/MarkdownProblemListsContext';
import { ProblemSolutionContext } from '../../../context/ProblemSolutionContext';
import { ModuleInfo, ModuleLinkInfo } from '../../../models/module';
import { getProblemURL } from '../../../models/problem';
import { useProblemsProgressInfo } from '../../../utils/getProgressInfo';
import { ClientOnly } from '../../ClientOnly';
import { DashboardProgressSmall } from '../../Dashboard/DashboardProgress';
import { Frequency } from '../../Frequency';
import MarkCompleteButton from '../MarkCompleteButton';

export default function ModuleHeaders({
  moduleLinks,
}: {
  moduleLinks: ModuleLinkInfo[];
}): JSX.Element {
  const {
    markdownLayoutInfo: markdownData,
    moduleProgress,
    handleCompletionChange,
  } = useMarkdownLayout();

  let problemIDs = [] as string[];
  // this is for modules
  try {
    const markdownProblems = useMarkdownProblems();
    if (markdownData instanceof ModuleInfo) {
      problemIDs = markdownProblems.map(problem => problem.uniqueId);
    }
  } catch (e) {
    console.log(e);
  }
  const problemsProgressInfo = useProblemsProgressInfo(problemIDs);

  // this is for solutions
  const problemSolutionContext = useContext(ProblemSolutionContext);
  const problem = problemSolutionContext?.problem;

  // either prerequisites for modules or appears in for problems
  let moduleHeaderLinks: { label: string; url?: string }[];
  if (markdownData instanceof ModuleInfo) {
    moduleHeaderLinks = (markdownData.prerequisites || []).map(prereq => {
      const moduleLink = moduleLinks.find(x => x.id === prereq);
      return moduleLink
        ? {
            label: `${SECTION_LABELS[moduleLink.section]} - ${
              moduleLink.title
            }`,
            url: moduleLink.url,
          }
        : {
            label: prereq,
          };
    });
  } else {
    // this is displayed within a problem solution
    if (!problemSolutionContext) {
      throw new Error(
        'ModuleHeader is being used to render a problem; ProblemSolutionContext must be defined'
      );
    }
    const modulesThatHaveProblem =
      problemSolutionContext.modulesThatHaveProblem;
    moduleHeaderLinks = modulesThatHaveProblem.map(module => {
      const moduleLink = moduleLinks.find(x => x.id === module.id);
      if (!moduleLink) {
        return {
          label: module.title,
        };
      }
      return {
        label: `${SECTION_LABELS[moduleLink.section]} - ${module.title}`,
        url: `${moduleLink.url}#problem-${problem!.uniqueId}`,
      };
    });
  }

  return (
    <ClientOnly>
      <>
        {markdownData instanceof ModuleInfo &&
          markdownData.frequency !== null && (
            <div className="px-0.5">
              <div className="mb-4 space-y-1 sm:flex sm:items-center sm:justify-between sm:space-y-0">
                <Frequency frequency={markdownData.frequency} />
                {problemIDs.length > 0 && (
                  <DashboardProgressSmall
                    {...problemsProgressInfo}
                    total={problemIDs.length}
                  />
                )}
              </div>
            </div>
          )}
        <div className="mb-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="dark:text-dark-high-emphasis text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {markdownData.title}
            </h1>
            {markdownData.author && (
              <p className={`dark:text-dark-med-emphasis mt-1 text-[var(--text-secondary)]`}>
                Author
                {markdownData.author.indexOf(',') !== -1 ? 's' : ''}:{' '}
                {markdownData.author}
              </p>
            )}
            {markdownData.contributors && (
              <p
                className={`dark:text-dark-med-emphasis text-xs text-[var(--text-secondary)]`}
              >
                Contributor
                {markdownData.contributors.indexOf(',') !== -1 ? 's' : ''}:{' '}
                {markdownData.contributors}
              </p>
            )}
          </div>
          {markdownData instanceof ModuleInfo && (
            <div className="ml-4 hidden lg:flex lg:shrink-0">
              <ClientOnly>
                <MarkCompleteButton
                  state={moduleProgress}
                  onChange={handleCompletionChange}
                />
              </ClientOnly>
            </div>
          )}
          {/* {markdownData instanceof ModuleInfo &&
            `Last Updated: ${time_ago(markdownData.gitAuthorTime)}`
          } */}
        </div>

        {/*{moduleHeaderLinks?.length > 0 && (*/}
        {/*  <ModuleHeadersLinkList*/}
        {/*    title={*/}
        {/*      markdownData instanceof ModuleInfo ? 'Prerequisites' : 'Appears In'*/}
        {/*    }*/}
        {/*    links={moduleHeaderLinks}*/}
        {/*  />*/}
        {/*)}*/}

        {markdownData instanceof ModuleInfo && markdownData.description && (
          <p className="mb-4 italic">{markdownData.description}</p>
        )}

        {moduleHeaderLinks?.length > 0 || problem ? (
          <div className="mb-4 rounded-md bg-[var(--bg-surface-alt)] px-4 py-5 sm:p-6 dark:bg-[var(--bg-surface)]">
            {moduleHeaderLinks?.length > 0 && (
              <div>
                <h3 className="my-0 text-sm leading-5 font-medium text-[var(--text-primary)] dark:text-[var(--text-muted)]">
                  {markdownData instanceof ModuleInfo
                    ? 'Prerequisites'
                    : 'Appears In'}
                </h3>
                <div className="no-y-margin mt-1 text-sm leading-5 text-[var(--text-primary)] dark:text-[var(--text-secondary)]">
                  <ul className="list-inside list-disc space-y-1 pl-3">
                    {moduleHeaderLinks.map(link => (
                      <li key={link.url ?? link.label}>
                        {link.url ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-black underline dark:text-[var(--text-muted)]"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <span className="text-black dark:text-[var(--text-muted)]">
                            {link.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {problem && (
              <div>
                {moduleHeaderLinks?.length > 0 && <div className="h-4 sm:h-6" />}
                <Link
                  to={getProblemURL(problem)}
                  className="my-0 inline-flex items-center text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-primary)] dark:text-[var(--text-muted)] dark:hover:text-[var(--text-muted)]"
                >
                  View problem →
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </>
    </ClientOnly>
  );
}
