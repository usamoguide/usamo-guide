import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Link } from 'gatsby';
import Layout from '../../components/layout';
import SignInGate from '../../components/SignInGate';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { apiFetch } from '../../lib/api/client';

function useQueryParam(key: string): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get(key) ?? '');
  }, [key]);
  return value;
}

type LeaderboardRow = {
  userId: string;
  handle: string;
  displayName: string;
  totalScore: number;
  rank: number;
  lastAcceptedAt: string | null;
  ratingDelta: number | null;
  perProblem: Array<{ problemId: string; score: number }>;
};

export default function ContestLeaderboardPage() {
  const contestId = useQueryParam('contestId');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const currentUser = useCurrentUser();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    if (!contestId || !currentUser) return;
    apiFetch<{
      leaderboard: LeaderboardRow[];
      problems: string[];
      total: number;
    }>(`/api/contest-leaderboard?contestId=${contestId}&page=${page}&pageSize=${pageSize}`)
      .then((data) => {
        setRows(data.leaderboard);
        setProblemIds(data.problems);
        setTotal(data.total);
      })
      .catch(() => {
        setRows([]);
        setProblemIds([]);
        setTotal(0);
      });
  }, [contestId, page, pageSize]);

  const signedInContent = () => {
    if (!contestId) {
      return (
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="ui-card mx-auto max-w-4xl p-6">Missing contestId.</div>
        </main>
      );
    }

    return (
      <main className="ui-page min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="ui-card p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Contest Leaderboard</h1>
              <div className="text-sm ui-muted">Contest {contestId}</div>
            </div>
            <Link to={`/contests/workspace?contestId=${contestId}`} className="ui-link">
              Back to contest
            </Link>
          </div>

          <div className="ui-card p-4 overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Total</th>
                  {problemIds.map((_, index) => (
                    <th key={index}>P{index + 1}</th>
                  ))}
                  <th>Last correct</th>
                  <th>Rating Δ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.userId}>
                    <td>{row.rank}</td>
                    <td>{row.handle || row.displayName}</td>
                    <td className="font-semibold">{row.totalScore}</td>
                    {row.perProblem.map((entry) => (
                      <td key={entry.problemId}>{entry.score}</td>
                    ))}
                    <td>
                      {row.lastAcceptedAt
                        ? dayjs(row.lastAcceptedAt).format('MMM D, h:mm A')
                        : '--'}
                    </td>
                    <td>{row.ratingDelta ?? '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="ui-button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="text-sm ui-muted">
              Page {page} of {totalPages}
            </div>
            <button
              className="ui-button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
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
