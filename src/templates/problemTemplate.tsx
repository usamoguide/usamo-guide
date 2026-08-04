import { graphql, Link, PageProps } from 'gatsby';
import * as React from 'react';
import DifficultyBox from '../components/DifficultyBox';
import Layout from '../components/layout';
import ProblemStatusCheckbox from '../components/markdown/ProblemsList/ProblemStatusCheckbox';
import ProblemStatementMarkdown from '../components/ProblemPage/ProblemStatementMarkdown';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { ConfettiProvider } from '../context/ConfettiContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
  useUpdateUserData,
} from '../context/UserDataContext/UserDataContext';
import { supabase } from '../lib/supabaseClient';
import { ProblemDifficulty, ProblemInfo, probSources } from '../models/problem';

type ProblemTemplateData = {
  allProblemInfo: {
    nodes: ProblemTemplateNode[];
  };
};

type ProblemTemplateNode = {
  uniqueId: string;
  name: string;
  url: string;
  source: string;
  sourceDescription: string | null;
  difficulty: string | null;
  isStarred: boolean;
  tags: string[];
  statement: string | null;
  author: string | null;
  interaction: {
    type: string;
    correct: string | null;
    choices: readonly string[] | null;
    correctIndex: number | null;
  };
  solutionReveal: {
    mode: string;
    url: string | null;
    markdown: string | null;
  };
  solution: ProblemInfo['solution'] | null;
  module: {
    frontmatter: { id: string; title: string };
    fields: { division: string } | null;
  } | null;
};

function graphqlInteraction(
  i: ProblemTemplateNode['interaction']
): ProblemInfo['interaction'] {
  if (i.type === 'integer' && i.correct != null) {
    return { type: 'integer', correct: i.correct };
  }
  if (
    i.type === 'mcq' &&
    i.choices &&
    i.correctIndex != null &&
    i.correctIndex >= 0 &&
    i.correctIndex < i.choices.length
  ) {
    return {
      type: 'mcq',
      choices: [...i.choices],
      correctIndex: i.correctIndex,
    };
  }
  return { type: 'none' };
}

function graphqlSolutionReveal(
  r: ProblemTemplateNode['solutionReveal'],
  fallbackUrl: string
): ProblemInfo['solutionReveal'] {
  if (r.mode === 'inline' && r.markdown?.trim()) {
    return { mode: 'inline', markdown: r.markdown };
  }
  return { mode: 'external', url: r.url ?? fallbackUrl };
}

function templateNodeToProblemInfo(node: ProblemTemplateNode): ProblemInfo {
  return {
    uniqueId: node.uniqueId,
    name: node.name,
    url: node.url,
    source: node.source,
    sourceDescription: node.sourceDescription ?? undefined,
    difficulty: (node.difficulty ?? 'N/A') as ProblemDifficulty,
    isStarred: node.isStarred,
    tags: [...node.tags],
    solution: node.solution as ProblemInfo['solution'],
    statement: node.statement ?? '',
    author: node.author ?? undefined,
    interaction: graphqlInteraction(node.interaction),
    solutionReveal: graphqlSolutionReveal(node.solutionReveal, node.url),
  };
}

function answersMatch(user: string, correct: string): boolean {
  const u = user.trim();
  const c = correct.trim();
  if (u === c) return true;
  const nu = Number(u);
  const nc = Number(c);
  if (!Number.isNaN(nu) && !Number.isNaN(nc) && nu === nc) return true;
  return false;
}

const PAGE_BG = 'var(--bg-page)';
const VANILLA = '#F4EDEA';
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.74)';
const MAUVE = '#F0C2FF';
const PURPLE = '#70428A';
const BORDER_STRONG = 'rgba(240, 194, 255, 0.30)';
const DIFFICULTY_SCALE_TEXT = `Scale

0.5: Easiest math competition problems, often solvable even for early middle school students without experience.

1: Problems strictly for beginners, often at a moderate middle school level.

1.5: Problems for stronger beginner students, on the level of the middling problems in most middle school contests.

2: For motivated beginners, harder questions from the previous categories.

2.5: More advanced beginner problems, hardest questions from previous categories.

3: Early intermediate problems that require more creative thinking.

3.5: Tougher early intermediate problems that consistently stretch into higher-level creative thinking or conceptual knowledge.

4: Intermediate-level problems.

4.5: Upper intermediate problems approaching the upper bound for non-invitational sprint math competitions.

5: More difficult AIME problems or simple proof-based Olympiad-style problems.

6: High-level AIME-styled questions or introductory Olympiad-level questions.

7: Tougher Olympiad-level questions, may require more technical knowledge.

8: High-level Olympiad-level questions.

9: Expert Olympiad-level questions.

9.5: The hardest problems appearing on Olympiads which the strongest students could reasonably solve.

10: Historically notorious problems, generally unsuitable for even very hard competitions because they are exceedingly tedious, long, and difficult.`;
const DIFFICULTY_OPTIONS = Array.from({ length: 20 }, (_, index) =>
  Number((index / 2 + 0.5).toFixed(1))
);

export default function ProblemTemplate(
  props: PageProps<ProblemTemplateData, { uniqueId: string }>
): JSX.Element {
  const node = props.data.allProblemInfo.nodes[0];
  const problem = node ? templateNodeToProblemInfo(node) : null;
  const [solutionOpen, setSolutionOpen] = React.useState(false);
  const [integerInput, setIntegerInput] = React.useState('');
  const [mcqIndex, setMcqIndex] = React.useState<number | null>(null);
  const [checkResult, setCheckResult] = React.useState<
    'idle' | 'correct' | 'incorrect'
  >('idle');
  const [approvedTags, setApprovedTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [tagSubmissionMessage, setTagSubmissionMessage] = React.useState<
    string | null
  >(null);
  const [isSubmittingTags, setIsSubmittingTags] = React.useState(false);
  const [difficultyAverage, setDifficultyAverage] = React.useState<
    number | null
  >(null);
  const [difficultyVoteCount, setDifficultyVoteCount] = React.useState(0);
  const [difficultyValue, setDifficultyValue] = React.useState('5');
  const [difficultyMessage, setDifficultyMessage] = React.useState<
    string | null
  >(null);
  const [isSubmittingDifficulty, setIsSubmittingDifficulty] =
    React.useState(false);
  const currentUser = useCurrentUser();
  const isUserDataLoaded = useIsUserDataLoaded();
  const updateUserData = useUpdateUserData();

  const recordUserContribution = React.useCallback(
    (kind: 'tag' | 'difficulty') => {
      if (!problem?.uniqueId || !isUserDataLoaded || !currentUser) return;

      updateUserData(prevUserData => {
        if (kind === 'tag') {
          const taggedProblemIds =
            prevUserData.problemTaggingStats.taggedProblemIds;
          if (taggedProblemIds.includes(problem.uniqueId)) {
            return { localStorageUpdate: {}, remoteUpdate: {} };
          }

          const updates = {
            problemsTagged: prevUserData.problemTaggingStats.problemsTagged + 1,
            taggedProblemIds: [...taggedProblemIds, problem.uniqueId],
          };

          return {
            localStorageUpdate: { problemTaggingStats: updates },
            remoteUpdate: { problemTaggingStats: updates },
          };
        }

        const ratedProblemIds =
          prevUserData.problemDifficultyStats.ratedProblemIds;
        if (ratedProblemIds.includes(problem.uniqueId)) {
          return { localStorageUpdate: {}, remoteUpdate: {} };
        }

        const updates = {
          problemsRated: prevUserData.problemDifficultyStats.problemsRated + 1,
          ratedProblemIds: [...ratedProblemIds, problem.uniqueId],
        };

        return {
          localStorageUpdate: { problemDifficultyStats: updates },
          remoteUpdate: { problemDifficultyStats: updates },
        };
      });
    },
    [currentUser, isUserDataLoaded, problem?.uniqueId, updateUserData]
  );

  const visibleTags = React.useMemo(() => {
    if (!problem) return [];
    const tags = new Set<string>(problem.tags);
    approvedTags.forEach(tag => tags.add(tag));
    return Array.from(tags);
  }, [approvedTags, problem]);

  React.useEffect(() => {
    if (!problem?.uniqueId) return;

    let isActive = true;

    const loadApprovedTags = async () => {
      const { data, error } = await supabase
        .from('problem_tag_approvals')
        .select('tag')
        .eq('problem_id', problem.uniqueId);

      if (!isActive) return;
      if (error) {
        console.error('Failed to load approved problem tags', error);
        return;
      }

      setApprovedTags((data ?? []).map(row => row.tag).filter(Boolean));
    };

    void loadApprovedTags();

    const loadDifficultyRatings = async () => {
      const { data, error } = await supabase
        .from('problem_difficulty_ratings')
        .select('rating')
        .eq('problem_id', problem.uniqueId);

      if (!isActive) return;
      if (error) {
        console.error('Failed to load community difficulty ratings', error);
        return;
      }

      const ratings = (data ?? [])
        .map(row => Number(row.rating))
        .filter(value => !Number.isNaN(value));

      if (ratings.length === 0) {
        setDifficultyAverage(null);
        setDifficultyVoteCount(0);
        return;
      }

      const average =
        ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
      setDifficultyAverage(Number(average.toFixed(1)));
      setDifficultyVoteCount(ratings.length);
    };

    void loadApprovedTags();
    void loadDifficultyRatings();

    return () => {
      isActive = false;
    };
  }, [problem?.uniqueId]);

  if (!node || !problem) {
    return (
      <Layout>
        <SEO title="Problem not found" image={null} pathname={props.path} />
        <div className="ui-page min-h-screen">
          <TopNavigationBar />
          <main className="mx-auto max-w-3xl px-4 py-16">
            <p className="text-gray-600 dark:text-gray-400">
              Problem not found.
            </p>
            <Link to="/problems/" className="mt-4 inline-block text-blue-600">
              All problems
            </Link>
          </main>
        </div>
      </Layout>
    );
  }

  const sourceTooltip =
    node.sourceDescription ||
    (probSources[node.source as keyof typeof probSources]?.[1] ?? null);

  const handleTagSubmission = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!problem?.uniqueId) return;

    const tagsToSuggest = tagInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    if (tagsToSuggest.length === 0) {
      setTagSubmissionMessage('Please enter at least one tag.');
      return;
    }

    setIsSubmittingTags(true);
    setTagSubmissionMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('problem_tag_suggestions')
        .insert(
          tagsToSuggest.map(tag => ({
            problem_id: problem.uniqueId,
            tag,
            user_id: user?.id ?? null,
          }))
        );

      if (insertError) throw insertError;
      recordUserContribution('tag');

      const { data: suggestionRows, error: readError } = await supabase
        .from('problem_tag_suggestions')
        .select('tag')
        .eq('problem_id', problem.uniqueId);

      if (readError) throw readError;

      const counts = new Map<string, number>();
      for (const row of suggestionRows ?? []) {
        const tag = row.tag?.trim().toLowerCase();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }

      const newlyApproved: string[] = [];
      for (const [tag, count] of counts.entries()) {
        if (count <= 5) continue;

        const { error: approvalError } = await supabase
          .from('problem_tag_approvals')
          .upsert(
            { problem_id: problem.uniqueId, tag },
            { onConflict: 'problem_id,tag' }
          );

        if (!approvalError) {
          newlyApproved.push(tag);
        }
      }

      const { data: approvalRows, error: approvalReadError } = await supabase
        .from('problem_tag_approvals')
        .select('tag')
        .eq('problem_id', problem.uniqueId);

      if (approvalReadError) throw approvalReadError;

      setApprovedTags((approvalRows ?? []).map(row => row.tag).filter(Boolean));
      setTagInput('');

      if (newlyApproved.length > 0) {
        setTagSubmissionMessage(
          `Thanks! Your suggestions were recorded and ${newlyApproved.join(', ')} ${newlyApproved.length === 1 ? 'is' : 'are'} now approved.`
        );
      } else {
        setTagSubmissionMessage('Thanks! Your suggestions were recorded.');
      }
    } catch (error) {
      console.error('Failed to save problem tag suggestions', error);
      setTagSubmissionMessage(
        'We could not save your tag suggestions right now. Please try again later.'
      );
    } finally {
      setIsSubmittingTags(false);
    }
  };

  const handleDifficultySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!problem?.uniqueId) return;

    const rating = Number(difficultyValue);
    if (Number.isNaN(rating)) {
      setDifficultyMessage('Please choose a valid difficulty.');
      return;
    }

    setIsSubmittingDifficulty(true);
    setDifficultyMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('problem_difficulty_ratings')
        .upsert(
          {
            problem_id: problem.uniqueId,
            user_id: user?.id ?? null,
            rating,
          },
          { onConflict: 'problem_id,user_id' }
        );

      if (error) throw error;
      recordUserContribution('difficulty');

      const { data: ratingRows, error: readError } = await supabase
        .from('problem_difficulty_ratings')
        .select('rating')
        .eq('problem_id', problem.uniqueId);

      if (readError) throw readError;

      const ratings = (ratingRows ?? [])
        .map(row => Number(row.rating))
        .filter(value => !Number.isNaN(value));

      if (ratings.length > 0) {
        const average =
          ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
        setDifficultyAverage(Number(average.toFixed(1)));
        setDifficultyVoteCount(ratings.length);
      }

      setDifficultyMessage('Thanks! Your difficulty rating has been recorded.');
    } catch (error) {
      console.error('Failed to save community difficulty rating', error);
      setDifficultyMessage(
        'We could not save your rating right now. Please try again later.'
      );
    } finally {
      setIsSubmittingDifficulty(false);
    }
  };

  const runCheck = () => {
    if (problem.interaction.type === 'integer') {
      setCheckResult(
        answersMatch(integerInput, problem.interaction.correct)
          ? 'correct'
          : 'incorrect'
      );
    } else if (problem.interaction.type === 'mcq') {
      if (mcqIndex === null) {
        setCheckResult('incorrect');
        return;
      }
      setCheckResult(
        mcqIndex === problem.interaction.correctIndex ? 'correct' : 'incorrect'
      );
    }
  };

  return (
    <Layout>
      <SEO
        title={`${node.name} — ${node.source}`}
        image={null}
        pathname={props.path}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.usamoguide.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Problems',
                item: 'https://www.usamoguide.com/problems/',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: node.name,
                item: `https://www.usamoguide.com${props.path}`,
              },
            ],
          },
        ]}
      />
      <div
        data-page-tone="dark"
        className="ui-page relative min-h-screen overflow-hidden"
        style={{
          background: PAGE_BG,
          color: VANILLA,
        }}
      >
        <TopNavigationBar />
        <main className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm" style={{ color: TEXT_SECONDARY }}>
            <Link
              to="/problems/"
              className="transition-opacity hover:opacity-85"
              style={{ color: MAUVE }}
            >
              Problems
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: VANILLA }}>{node.name}</span>
          </nav>

          <header
            className="mb-8 rounded-2xl pb-6"
            style={{
              background: 'rgba(43, 30, 57, 0.92)',
            }}
          >
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <h1
                className="text-2xl font-bold sm:text-3xl"
                style={{ color: VANILLA }}
              >
                {node.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium" style={{ color: MAUVE }}>
                  {sourceTooltip ? (
                    <span title={sourceTooltip}>{node.source}</span>
                  ) : (
                    node.source
                  )}
                </span>
                {node.author ? (
                  <>
                    <span style={{ color: TEXT_SECONDARY }}>·</span>
                    <span style={{ color: TEXT_SECONDARY }}>{node.author}</span>
                  </>
                ) : null}
                <DifficultyBox
                  difficulty={(node.difficulty ?? 'N/A') as ProblemDifficulty}
                />
              </div>
              {node.module?.frontmatter?.id && node.module.fields?.division ? (
                <p className="mt-3 text-sm" style={{ color: TEXT_SECONDARY }}>
                  From module{' '}
                  <Link
                    className="hover:underline"
                    style={{ color: MAUVE }}
                    to={`/${node.module.fields.division}/${node.module.frontmatter.id}/`}
                  >
                    {node.module.frontmatter.title}
                  </Link>
                </p>
              ) : null}
              <div className="mt-4">
                <ConfettiProvider>
                  <ProblemStatusCheckbox problem={problem} size="large" />
                </ConfettiProvider>
              </div>
              <div
                className="mt-5 rounded-2xl px-4 py-4"
                style={{
                  background: 'rgba(14, 11, 31, 0.72)',
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: VANILLA }}
                  >
                    Community difficulty
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-sm font-medium"
                    style={{ color: MAUVE }}
                  >
                    {difficultyAverage === null
                      ? 'No ratings yet'
                      : `${difficultyAverage.toFixed(1)} / 10`}
                  </span>
                  <span className="text-sm" style={{ color: TEXT_SECONDARY }}>
                    {difficultyVoteCount === 0
                      ? 'Be the first to rate this problem.'
                      : `${difficultyVoteCount} ${difficultyVoteCount === 1 ? 'vote' : 'votes'}`}
                  </span>
                </div>
                <form
                  className="mt-4 flex flex-wrap items-center gap-3"
                  onSubmit={handleDifficultySubmit}
                >
                  <label
                    className="text-sm font-medium"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    Your rating
                  </label>
                  <select
                    value={difficultyValue}
                    onChange={event => setDifficultyValue(event.target.value)}
                    className="rounded-md px-3 py-2 text-sm"
                    style={{
                      borderColor: BORDER_STRONG,
                      background: 'rgba(14, 11, 31, 0.72)',
                      color: VANILLA,
                    }}
                  >
                    {DIFFICULTY_OPTIONS.map(option => (
                      <option
                        key={option}
                        value={option}
                        style={{ color: '#0A0818' }}
                      >
                        {option.toFixed(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={isSubmittingDifficulty}
                    className="rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      border: `1px solid ${BORDER_STRONG}`,
                      background: '#6D3B9F',
                      color: VANILLA,
                    }}
                  >
                    {isSubmittingDifficulty ? 'Saving…' : 'Submit rating'}
                  </button>
                </form>
                {difficultyMessage ? (
                  <p className="mt-3 text-sm" style={{ color: MAUVE }}>
                    {difficultyMessage}
                  </p>
                ) : null}
                <details className="mt-4">
                  <summary
                    className="cursor-pointer text-sm font-medium"
                    style={{ color: MAUVE }}
                  >
                    Understand the scale
                  </summary>
                  <div
                    className="mt-3 text-sm leading-6 whitespace-pre-wrap"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    {DIFFICULTY_SCALE_TEXT}
                  </div>
                </details>
              </div>
            </div>
          </header>

          {visibleTags.length > 0 ? (
            <section className="mb-8" aria-label="Problem tags">
              <div className="flex flex-wrap gap-2">
                {visibleTags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      background: 'rgba(14, 11, 31, 0.72)',
                      color: MAUVE,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {visibleTags.length === 0 ? (
            <section
              className="mb-10 rounded-2xl p-5"
              style={{
                background: 'rgba(43, 30, 57, 0.92)',
              }}
              aria-label="Suggest tags"
            >
              <h2 className="text-lg font-semibold" style={{ color: VANILLA }}>
                Suggest tags for this problem
              </h2>
              <p className="mt-2 text-sm" style={{ color: TEXT_SECONDARY }}>
                This problem does not have any tags yet. Add a few useful tags
                and once enough people agree, they will be added here
                automatically.
              </p>
              <form className="mt-4" onSubmit={handleTagSubmission}>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: TEXT_SECONDARY }}
                >
                  Suggested tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={event => setTagInput(event.target.value)}
                  placeholder="algebra, combinatorics"
                  className="ui-input w-full rounded-md px-3 py-2"
                  style={{
                    borderColor: BORDER_STRONG,
                    background: 'rgba(14, 11, 31, 0.72)',
                    color: VANILLA,
                  }}
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingTags}
                    className="purple-motion-effect inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold disabled:cursor-not-allowed disabled:opacity-70"
                    style={
                      {
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#6D3B9F',
                        '--pme-color': '#F4EDEA',
                        '--pme-hover-color': '#201C36',
                        '--pme-wipe-bg': '#F0C2FF',
                      } as React.CSSProperties
                    }
                  >
                    {isSubmittingTags ? 'Submitting…' : 'Submit tags'}
                  </button>
                </div>
                {tagSubmissionMessage ? (
                  <p className="mt-3 text-sm" style={{ color: MAUVE }}>
                    {tagSubmissionMessage}
                  </p>
                ) : null}
              </form>
            </section>
          ) : null}

          <section className="mb-10" aria-labelledby="problem-statement">
            <h2
              id="problem-statement"
              className="mb-4 text-lg font-semibold"
              style={{ color: VANILLA }}
            >
              Problem
            </h2>
            <ProblemStatementMarkdown>
              {node.statement ?? ''}
            </ProblemStatementMarkdown>
          </section>

          {problem.interaction.type === 'integer' && (
            <section className="mb-10" aria-label="Submit numeric answer">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: TEXT_SECONDARY }}
              >
                Your answer
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={integerInput}
                  onChange={e => {
                    setIntegerInput(e.target.value);
                    setCheckResult('idle');
                  }}
                  className="ui-input max-w-xs rounded-md px-3 py-2"
                  style={{
                    borderColor: BORDER_STRONG,
                    background: 'rgba(14, 11, 31, 0.72)',
                    color: VANILLA,
                  }}
                  placeholder="Enter a number"
                />
                <button
                  type="button"
                  onClick={runCheck}
                  className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-2 font-mono text-sm leading-tight font-bold"
                  style={
                    {
                      border: '1px solid rgba(240, 194, 255, 0.34)',
                      background: '#6D3B9F',
                      '--pme-color': '#F4EDEA',
                      '--pme-hover-color': '#201C36',
                      '--pme-wipe-bg': '#F0C2FF',
                    } as React.CSSProperties
                  }
                >
                  Check
                </button>
              </div>
              {checkResult === 'correct' && (
                <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                  Correct.
                </p>
              )}
              {checkResult === 'incorrect' && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  Not quite — try again.
                </p>
              )}
            </section>
          )}

          {problem.interaction.type === 'mcq' && (
            <section className="mb-10" aria-label="Multiple choice">
              <p
                className="mb-3 text-sm font-medium"
                style={{ color: TEXT_SECONDARY }}
              >
                Select an answer
              </p>
              <ul className="space-y-2">
                {problem.interaction.choices.map((choice, i) => (
                  <li key={i}>
                    <label
                      className="flex cursor-pointer items-start gap-2 rounded-2xl px-3 py-2"
                      style={{
                        border: '1px solid rgba(229, 194, 255, 0.12)',
                        background: 'rgba(43, 30, 57, 0.92)',
                      }}
                    >
                      <input
                        type="radio"
                        name="mcq"
                        checked={mcqIndex === i}
                        onChange={() => {
                          setMcqIndex(i);
                          setCheckResult('idle');
                        }}
                        className="mt-1"
                      />
                      <span style={{ color: VANILLA }}>{choice}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={runCheck}
                className="mt-4 rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-95"
                style={{
                  backgroundColor: PURPLE,
                  color: VANILLA,
                  border: `1px solid ${BORDER_STRONG}`,
                }}
              >
                Check
              </button>
              {checkResult === 'correct' && (
                <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                  Correct.
                </p>
              )}
              {checkResult === 'incorrect' && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                  Not quite — try again.
                </p>
              )}
            </section>
          )}

          <section className="mb-10" aria-label="Solution">
            {problem.solutionReveal.mode === 'external' &&
            problem.solutionReveal.url ? (
              <a
                href={problem.solutionReveal.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-2.5 font-mono text-sm leading-tight font-bold"
                style={
                  {
                    border: '1px solid rgba(240, 194, 255, 0.34)',
                    background: '#6D3B9F',
                    '--pme-color': '#F4EDEA',
                    '--pme-hover-color': '#201C36',
                    '--pme-wipe-bg': '#F0C2FF',
                  } as React.CSSProperties
                }
              >
                Show me the solution
                <svg
                  className="ml-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            ) : problem.solutionReveal.mode === 'inline' ? (
              <>
                <button
                  type="button"
                  onClick={() => setSolutionOpen(o => !o)}
                  className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-2.5 font-mono text-sm leading-tight font-bold"
                  style={
                    {
                      border: '1px solid rgba(240, 194, 255, 0.34)',
                      background: '#6D3B9F',
                      '--pme-color': '#F4EDEA',
                      '--pme-hover-color': '#201C36',
                      '--pme-wipe-bg': '#F0C2FF',
                    } as React.CSSProperties
                  }
                >
                  {solutionOpen ? 'Hide solution' : 'Show me the solution'}
                </button>
                {solutionOpen && (
                  <div
                    className="mt-6 rounded-2xl p-4"
                    style={{
                      background: 'rgba(43, 30, 57, 0.92)',
                    }}
                  >
                    <ProblemStatementMarkdown>
                      {problem.solutionReveal.markdown}
                    </ProblemStatementMarkdown>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>
                No solution is configured for this problem yet.
              </p>
            )}
          </section>

          <p className="text-sm" style={{ color: TEXT_SECONDARY }}>
            <Link
              to="/problems/"
              className="hover:underline"
              style={{ color: MAUVE }}
            >
              ← Back to all problems
            </Link>
          </p>
        </main>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query ProblemTemplate($uniqueId: String!) {
    allProblemInfo(filter: { uniqueId: { eq: $uniqueId } }, limit: 1) {
      nodes {
        uniqueId
        name
        url
        source
        sourceDescription
        difficulty
        isStarred
        tags
        statement
        author
        interaction {
          type
          correct
          choices
          correctIndex
        }
        solutionReveal {
          mode
          url
          markdown
        }
        solution {
          kind
          label
          labelTooltip
          url
          hasHints
          sketch
        }
        module {
          frontmatter {
            id
            title
          }
          fields {
            division
          }
        }
      }
    }
  }
`;
