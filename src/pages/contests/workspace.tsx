import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, navigate } from 'gatsby';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import LaTeXEditor from '../../components/contest/LaTeXEditor';
import ContestTimer from '../../components/contest/ContestTimer';
import Layout from '../../components/layout';
import SignInGate from '../../components/SignInGate';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { apiFetch } from '../../lib/api/client';
import { supabase } from '../../lib/supabaseClient';
import useAntiCheat from '../../hooks/useAntiCheat';

function useQueryParam(key: string): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(key) ?? '');
  }, [key]);
  return value;
}

type ContestRow = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  state: string;
  duration_minutes: number;
  rating_enabled: boolean;
  visibility: string;
};

type ContestProblemRow = {
  problem_id: string;
  order_index: number;
  problems: {
    id: string;
    title: string;
    statement_latex: string;
    point_value: number;
    tags: string[];
    difficulty: number;
    problem_parts?: Array<{
      id: string;
      label: string;
      statement_latex: string;
      point_value: number;
    }>;
  };
};

type SubmissionRow = {
  id: string;
  content_latex: string;
  last_submit_at: string | null;
  state: string;
  is_locked: boolean;
  problem_id: string;
};

type GradeRow = {
  submission_id: string;
  score: number;
  max_score: number;
  feedback: string;
  grade_parts: Array<{
    part_id: string | null;
    score: number;
    max_score: number;
    feedback: string;
  }>;
};

type ContestSession = {
  id: string;
  mode: 'live' | 'virtual' | 'practice';
  start_time: string;
  end_time: string;
};

export default function ContestWorkspacePage() {
  const contestId = useQueryParam('contestId');
  const [contest, setContest] = useState<ContestRow | null>(null);
  const [problems, setProblems] = useState<ContestProblemRow[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ContestProblemRow | null>(null);
  const [content, setContent] = useState('');
  const [session, setSession] = useState<ContestSession | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submissions, setSubmissions] = useState<Record<string, SubmissionRow>>({});
  const [grades, setGrades] = useState<Record<string, GradeRow>>({});
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [ratingDelta, setRatingDelta] = useState<number | null>(null);
  const [error, setError] = useState('');
  const lastChangeRef = useRef<number>(0);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentUser = useCurrentUser();

  useAntiCheat(currentUser ? contestId || null : null);

  const fetchUserData = useCallback((id: string) => {
    apiFetch<{
      submissions: SubmissionRow[];
      grades: GradeRow[];
      totalScore: number;
      ratingDelta: number | null;
    }>(`/api/contest-user-data?contestId=${id}`)
      .then((data) => {
        const submissionMap: Record<string, SubmissionRow> = {};
        data.submissions.forEach((row) => {
          submissionMap[row.problem_id] = row;
        });
        const gradeMap: Record<string, GradeRow> = {};
        data.grades.forEach((row) => {
          gradeMap[row.submission_id] = row;
        });
        setSubmissions(submissionMap);
        setGrades(gradeMap);
        setTotalScore(data.totalScore);
        setRatingDelta(data.ratingDelta);
      })
        .catch(() => null);
      }, []);

  useEffect(() => {
    if (!contestId || !currentUser) return;
    apiFetch<{ contests: ContestRow[] }>(`/api/contests?contestId=${contestId}`)
      .then((data) => setContest(data.contests[0] ?? null))
      .catch(() => setContest(null));

    supabase
      .from('contest_problems')
      .select(
        'problem_id,order_index,problems(id,title,statement_latex,point_value,tags,difficulty,problem_parts(id,label,statement_latex,point_value))'
      )
      .eq('contest_id', contestId)
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setProblems((data ?? []) as ContestProblemRow[]);
        if (data && data.length) {
          setSelectedProblem(data[0] as ContestProblemRow);
        }
      });

    apiFetch<{ session: ContestSession | null }>(`/api/contest-session?contestId=${contestId}`)
      .then((data) => setSession(data.session))
      .catch(() => setSession(null));

    fetchUserData(contestId);
  }, [contestId, currentUser, fetchUserData]);

  useEffect(() => {
    if (!contestId || !session || !currentUser) return;
    const interval = setInterval(() => {
      fetchUserData(contestId);
    }, 30000);
    return () => clearInterval(interval);
  }, [contestId, session, currentUser, fetchUserData]);

  useEffect(() => {
    if (!selectedProblem || !contestId) return;
    const storageKey = `contest:${contestId}:problem:${selectedProblem.problem_id}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { content: string; updatedAt: number };
      setContent(parsed.content ?? '');
      lastChangeRef.current = parsed.updatedAt ?? 0;
      return;
    }

    const submission = submissions[selectedProblem.problem_id];
    setContent(submission?.content_latex ?? '');
  }, [contestId, selectedProblem, submissions]);

  useEffect(() => {
    if (!contestId || !selectedProblem) return;
    const storageKey = `contest:${contestId}:problem:${selectedProblem.problem_id}`;
    const updatedAt = Date.now();
    lastChangeRef.current = updatedAt;
    localStorage.setItem(storageKey, JSON.stringify({ content, updatedAt }));
  }, [contestId, selectedProblem, content]);

  useEffect(() => {
    if (!contestId || !selectedProblem) return;
    if (!content.trim()) return;
    if (!session) return;

    const canEdit = canEditNow(contest, session);
    if (!canEdit) return;

    const handle = setTimeout(() => {
      setSaving(true);
      apiFetch<{ submission: SubmissionRow }>('/api/submissions', {
        json: {
          contestId,
          problemId: selectedProblem.problem_id,
          contentLatex: content,
          submit: false,
        },
      })
        .then((data) => {
          setSubmitStatus('Saved');
          setSubmissions((current) => ({
            ...current,
            [selectedProblem.problem_id]: data.submission,
          }));
        })
        .catch(() => setSubmitStatus('Save failed'))
        .finally(() => setSaving(false));
    }, 800);

    return () => clearTimeout(handle);
  }, [contestId, selectedProblem, content, session, contest]);

  useEffect(() => {
    if (!contestId || !selectedProblem) return;
    if (channelRef.current) return;
    const channel = new BroadcastChannel(`contest-${contestId}`);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const data = event.data as {
        problemId: string;
        content: string;
        updatedAt: number;
      };
      if (data.problemId !== selectedProblem.problem_id) return;
      if (data.updatedAt <= lastChangeRef.current) return;
      lastChangeRef.current = data.updatedAt;
      setContent(data.content);
      setSubmitStatus('Synced');
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [contestId, selectedProblem]);

  useEffect(() => {
    if (!contestId || !selectedProblem) return;
    const channel = channelRef.current;
    if (!channel) return;
    const updatedAt = Date.now();
    channel.postMessage({
      problemId: selectedProblem.problem_id,
      content,
      updatedAt,
    });
  }, [contestId, selectedProblem, content]);

  async function join(mode: 'live' | 'virtual' | 'practice') {
    setError('');
    try {
      const result = await apiFetch<{ session: ContestSession }>('/api/contest-join', {
        json: { contestId, mode },
      });
      setSession(result.session);
      fetchUserData(contestId);
    } catch {
      setError('Unable to start contest session.');
    }
  }

  async function submitFinal() {
    if (!contestId || !selectedProblem) return;
    setError('');
    await apiFetch<{ submission: SubmissionRow }>('/api/submissions', {
      json: {
        contestId,
        problemId: selectedProblem.problem_id,
        contentLatex: content,
        submit: true,
      },
    })
      .then((data) => {
        setSubmissions((current) => ({
          ...current,
          [selectedProblem.problem_id]: data.submission,
        }));
        setSubmitStatus('Submitted');
        fetchUserData(contestId);
      })
      .catch(() => setError('Submission failed. Please retry.'));
  }

  const status = getContestStatus(contest);
  const sessionMode = session?.mode ?? null;
  const isRated = contest?.rating_enabled && sessionMode !== 'practice';
  const countdownEnd = sessionMode === 'virtual' ? session?.end_time : contest?.end_time;
  const canEdit = session ? canEditNow(contest, session) : false;
  const selectedSubmission = selectedProblem ? submissions[selectedProblem.problem_id] : undefined;
  const selectedGrade = selectedSubmission ? grades[selectedSubmission.id] : undefined;

  const signedInContent = () => {
    if (!contestId) {
      return (
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="ui-card mx-auto max-w-3xl p-6">Missing contestId.</div>
        </main>
      );
    }

    if (!contest) {
      return (
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="ui-card mx-auto max-w-3xl p-6">Loading contest...</div>
        </main>
      );
    }

    return (
      <main className="ui-page min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="ui-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">{contest.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ui-pill">{status}</span>
                  <span className="ui-pill">{isRated ? 'Rated' : 'Unrated'}</span>
                  {sessionMode ? <span className="ui-pill">{sessionMode.toUpperCase()}</span> : null}
                </div>
              </div>
              {countdownEnd && sessionMode !== 'practice' ? (
                <ContestTimer endTime={countdownEnd} />
              ) : (
                <div className="ui-pill">Practice mode</div>
              )}
            </div>
            <div className="mt-4 ui-text-secondary">{contest.description}</div>
            <div className="mt-4 text-sm ui-muted">
              {dayjs(contest.start_time).format('MMM D, YYYY h:mm A')} -{' '}
              {dayjs(contest.end_time).format('MMM D, YYYY h:mm A')}
            </div>
          </section>

          {!session ? (
            <section className="ui-card p-6">
              <div className="text-sm ui-muted">Choose a mode to begin.</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="ui-button ui-button-primary" onClick={() => join('live')}>
                  Start Live
                </button>
                <button className="ui-button" onClick={() => join('virtual')}>
                  Start Virtual
                </button>
                <button className="ui-button" onClick={() => join('practice')}>
                  Start Practice
                </button>
                <button className="ui-button" onClick={() => navigate('/contests')}>
                  Back
                </button>
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <aside className="space-y-3">
              <div className="ui-card p-4">
                <div className="text-sm font-semibold">Problems</div>
                <div className="mt-3 space-y-2">
                  {problems.map((problem, index) => (
                    <button
                      key={problem.problem_id}
                      className={`ui-button w-full justify-between text-left ${
                        selectedProblem?.problem_id === problem.problem_id
                          ? 'border-[color:var(--accent)]'
                          : ''
                      }`}
                      onClick={() => setSelectedProblem(problem)}
                    >
                      <div>
                        <div className="font-semibold">
                          {index + 1}. {problem.problems.title}
                        </div>
                        <div className="text-xs ui-muted">
                          {problem.problems.point_value} pts · {problem.problems.difficulty}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="ui-card p-4">
                <div className="text-sm font-semibold">Contest summary</div>
                <div className="mt-2 text-sm ui-text-secondary">
                  Total score: {totalScore ?? 0}
                </div>
                {contest.state === 'finalized' ? (
                  <div className="mt-2 text-sm ui-text-secondary">
                    Rating change: {ratingDelta ?? 'Pending'}
                  </div>
                ) : null}
                {contest.state === 'finalized' ? (
                  <Link
                    to={`/contests/leaderboard?contestId=${contest.id}`}
                    className="ui-link mt-3 inline-block"
                  >
                    View leaderboard
                  </Link>
                ) : null}
              </div>
            </aside>

            <section className="lg:col-span-2 space-y-4">
              <div className="ui-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm ui-muted">Problem</div>
                    <div className="text-lg font-semibold">
                      {selectedProblem?.problems.title}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProblem?.problems.tags?.map((tag) => (
                      <span key={tag} className="ui-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {selectedProblem?.problems.statement_latex ?? ''}
                  </ReactMarkdown>
                  {selectedProblem?.problems.problem_parts?.length ? (
                    <div className="space-y-3">
                      {selectedProblem.problems.problem_parts.map((part) => (
                        <div key={part.id} className="ui-surface p-3">
                          <div className="text-sm font-semibold">
                            Part {part.label} · {part.point_value} pts
                          </div>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {part.statement_latex}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ui-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-lg font-semibold">Submission</div>
                  <div className="text-sm ui-muted">
                    {selectedSubmission?.last_submit_at
                      ? `Last submitted ${dayjs(selectedSubmission.last_submit_at).format('MMM D, h:mm A')}`
                      : 'No submission yet'}
                  </div>
                </div>
                <LaTeXEditor
                  value={content}
                  onChange={setContent}
                  label="Your solution"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="ui-button ui-button-primary"
                    onClick={submitFinal}
                    disabled={saving || !canEdit}
                  >
                    Submit final
                  </button>
                  <div className="text-sm ui-muted">
                    {saving ? 'Saving...' : submitStatus}
                  </div>
                  {!canEdit ? (
                    <div className="text-sm ui-muted">Submissions are locked.</div>
                  ) : null}
                </div>
                {error ? <div className="text-sm text-red-600">{error}</div> : null}
              </div>

              {selectedGrade ? (
                <div className="ui-card p-5 space-y-3">
                  <div className="text-lg font-semibold">Grading Feedback</div>
                  <div className="text-sm ui-text-secondary">
                    Score: {selectedGrade.score} / {selectedGrade.max_score}
                  </div>
                  {selectedGrade.feedback ? (
                    <div className="ui-surface p-3 text-sm">{selectedGrade.feedback}</div>
                  ) : null}
                  {selectedGrade.grade_parts?.length ? (
                    <div className="space-y-2">
                      {selectedGrade.grade_parts.map((part, idx) => (
                        <div key={`${part.part_id ?? idx}`} className="ui-surface p-3 text-sm">
                          <div className="font-semibold">
                            Part {idx + 1}: {part.score} / {part.max_score}
                          </div>
                          {part.feedback ? <div className="ui-muted">{part.feedback}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>
    );
  };

  return (
    <Layout>
      <TopNavigationBar />
      <SignInGate
        title="Sign in to access contests"
        message="Contests require an account so your work can be saved and graded."
      >
        {signedInContent()}
      </SignInGate>
    </Layout>
  );
}

function getContestStatus(contest: ContestRow | null): string {
  if (!contest) return 'Loading';
  const now = dayjs();
  if (now.isBefore(dayjs(contest.start_time))) return 'Upcoming';
  if (now.isAfter(dayjs(contest.end_time))) return 'Finished';
  return 'Live';
}

function canEditNow(contest: ContestRow | null, session: ContestSession | null): boolean {
  if (!contest || !session) return false;
  if (contest.state === 'finalized' || contest.state === 'archived') return false;
  const now = dayjs();
  if (session.mode === 'practice') return true;
  if (session.mode === 'virtual') {
    return now.isAfter(dayjs(session.start_time)) && now.isBefore(dayjs(session.end_time));
  }
  return now.isAfter(dayjs(contest.start_time)) && now.isBefore(dayjs(contest.end_time));
}
