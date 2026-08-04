import dayjs from 'dayjs';
import React from 'react';
import { useActiveGroup } from '../../../hooks/groups/useActiveGroup';
import { usePost } from '../../../hooks/groups/usePost';
import { usePostActions } from '../../../hooks/groups/usePostActions';
import { useProblem } from '../../../hooks/groups/useProblem';
import Layout from '../../layout';
import Spoiler from '../../markdown/Spoiler';
import SEO from '../../seo';
import TopNavigationBar from '../../TopNavigationBar/TopNavigationBar';
import Breadcrumbs from '../Breadcrumbs';
import SafeMarkdownRenderer from '../SafeMarkdownRenderer';
import ProblemSidebar from './ProblemSidebar';
import ProblemSubmission from './ProblemSubmissionInterface';

export default function ProblemPage(props) {
  const { postId, problemId } = props as {
    path: string;
    groupId: string;
    postId: string;
    problemId: string;
  };
  const activeGroup = useActiveGroup();
  const post = usePost(postId);
  const problem = useProblem(problemId);
  const { deleteProblem } = usePostActions(activeGroup.groupData!.id);

  if (!problem || post?.type !== 'assignment' || activeGroup.isLoading) {
    return null;
  }

  const customReleaseTimestamp =
    problem.solutionReleaseMode === 'custom'
      ? problem.solutionReleaseTimestamp
      : null;
  const releaseDisplayTimestamp =
    problem.solutionReleaseMode === 'due-date'
      ? post.dueTimestamp
      : customReleaseTimestamp;

  return (
    <Layout>
      <SEO
        title={`${problem.name} · ${activeGroup.groupData?.name}`}
        image={null}
        pathname={props.path}
      />
      <TopNavigationBar />
      <div className="relative overflow-hidden bg-orange-50 transition-colors duration-500 dark:bg-[#0b0a12]">
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-repeat opacity-20"
          style={{ backgroundImage: "url('/images/starbg.png')" }}
        />
        <nav className="relative z-10 mt-6 mb-4 flex" aria-label="Breadcrumb">
          <Breadcrumbs
            className="mx-auto w-full max-w-(--breakpoint-xl) px-4 pt-3 pb-4 sm:px-6 lg:px-8"
            group={activeGroup.groupData!}
            post={post}
          />
        </nav>
      </div>
      <main
        className="relative flex-1 overflow-y-auto bg-transparent focus:outline-hidden"
        tabIndex={-1}
      >
        <div className="pb-8 xl:pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 xl:grid xl:max-w-(--breakpoint-xl) xl:grid-cols-3">
            <div className="xl:col-span-2 xl:pr-8">
              <div className="rounded-2xl bg-white/90 p-6 dark:bg-slate-900/75">
                <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6 dark:border-gray-700">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                      Problem: {problem.name}
                    </h1>
                    <p className="mt-2 text-base font-medium text-orange-700 dark:text-orange-300">
                      {post.name}
                    </p>
                  </div>
                </div>
                <aside className="mt-8 xl:hidden">
                  <ProblemSidebar post={post} problem={problem} />
                </aside>
                <div className="py-6 xl:pt-8 xl:pb-12">
                  <SafeMarkdownRenderer>{problem.body}</SafeMarkdownRenderer>

                  {problem.hints.length > 0 && (
                    <>
                      <div className="h-10" />

                      <div>
                        {problem.hints.map(hint => (
                          <Spoiler
                            title={'Hint: ' + hint.name || 'Hint'}
                            key={hint.id}
                          >
                            <div className="pb-4">
                              <SafeMarkdownRenderer>
                                {hint.body}
                              </SafeMarkdownRenderer>
                            </div>
                          </Spoiler>
                        ))}
                      </div>
                    </>
                  )}

                  {problem.solution &&
                    ((problem.solutionReleaseMode == 'due-date' &&
                      post.dueTimestamp) ||
                      problem.solutionReleaseMode == 'now' ||
                      problem.solutionReleaseMode == 'custom') && (
                      <>
                        <div className="h-10" />
                        <div>
                          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                            Solution
                          </h2>
                        </div>
                        <div className="h-2" />
                        {problem.solutionReleaseMode == 'now' ||
                        (problem.solutionReleaseMode == 'due-date' &&
                          post.dueTimestamp &&
                          new Date(post.dueTimestamp).getTime() < Date.now()) ||
                        (problem.solutionReleaseMode == 'custom' &&
                          customReleaseTimestamp &&
                          new Date(customReleaseTimestamp).getTime() <
                            Date.now()) ? (
                          <Spoiler title={'Show Solution'}>
                            <div className="pb-4">
                              <SafeMarkdownRenderer>
                                {problem.solution}
                              </SafeMarkdownRenderer>
                            </div>
                          </Spoiler>
                        ) : (
                          ((problem.solutionReleaseMode == 'due-date' &&
                            post.dueTimestamp) ||
                            problem.solutionReleaseMode == 'custom') && (
                            <p className="text-gray-600 italic dark:text-gray-400">
                              The problem solution will be released on{' '}
                              {problem &&
                                dayjs(
                                  new Date(releaseDisplayTimestamp!)
                                ).format('MMMM DD h:mma')}
                              .
                            </p>
                          )
                        )}
                      </>
                    )}
                </div>
                <ProblemSubmission problem={problem} />
              </div>
              <aside className="hidden xl:block xl:pl-8">
                <ProblemSidebar post={post} problem={problem} />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
