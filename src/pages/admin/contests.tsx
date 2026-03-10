import React, { useEffect, useState } from 'react';
import ContestForm from '../../components/admin/ContestForm';
import Layout from '../../components/layout';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { apiFetch } from '../../lib/api/client';

type ContestRow = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  state: string;
  visibility: string;
};

export default function AdminContestsPage() {
  const [contests, setContests] = useState<ContestRow[]>([]);
  const [userId, setUserId] = useState('');
  const [problemInputs, setProblemInputs] = useState<Record<string, string>>({});
  const [graderInputs, setGraderInputs] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const me = await apiFetch<{ userId: string; roles: string[] }>('/api/me');
      setRoles(me.roles);
      if (!me.roles.includes('admin')) {
        setError('Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.');
        return;
      }
      const data = await apiFetch<{ contests: ContestRow[] }>('/api/contests');
      setUserId(me.userId);
      setContests(data.contests);
    } catch (err) {
      setError('Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <Layout>
        <TopNavigationBar />
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="ui-card mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold">Contests</h1>
            <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!roles) {
    return (
      <Layout>
        <TopNavigationBar />
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="ui-card mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold">Contests</h1>
            <div className="mt-6">Loading...</div>
          </div>
        </main>
      </Layout>
    );
  }

  async function finalizeContest(contestId: string) {
    await apiFetch('/api/contest-finalize', {
      json: { contestId },
    });
    await load();
  }

  async function attachProblems(contestId: string) {
    const raw = problemInputs[contestId] ?? '';
    const problemIds = raw.split(',').map((value) => value.trim()).filter(Boolean);
    await apiFetch('/api/contest-problems', {
      json: { contestId, problemIds },
    });
  }

  async function assignGrader(contestId: string) {
    const graderId = (graderInputs[contestId] ?? '').trim();
    if (!graderId) return;
    await apiFetch('/api/admin-assign-grader', {
      json: { contestId, graderId },
    });
  }

  return (
    <Layout>
      <TopNavigationBar />
      <main className="ui-page min-h-screen px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="ui-card p-8">
            <h1 className="text-2xl font-semibold">Contests</h1>
            {userId ? <ContestForm currentUserId={userId} onSaved={load} /> : null}
          </div>
          <div className="space-y-4">
            {contests.map((contest) => (
              <div key={contest.id} className="ui-card p-4">
                <div className="text-lg font-semibold">{contest.title}</div>
                <div className="text-sm ui-text-secondary">
                  {contest.state} · {contest.visibility}
                </div>
                <div className="text-sm ui-text-secondary">
                  {contest.start_time} - {contest.end_time}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input
                    className="ui-input text-sm"
                    placeholder="Problem IDs (comma separated)"
                    value={problemInputs[contest.id] ?? ''}
                    onChange={(event) =>
                      setProblemInputs((current) => ({
                        ...current,
                        [contest.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="ui-button"
                    onClick={() => attachProblems(contest.id)}
                  >
                    Attach problems
                  </button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <input
                    className="ui-input text-sm"
                    placeholder="Grader user ID"
                    value={graderInputs[contest.id] ?? ''}
                    onChange={(event) =>
                      setGraderInputs((current) => ({
                        ...current,
                        [contest.id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="ui-button"
                    onClick={() => assignGrader(contest.id)}
                  >
                    Assign grader
                  </button>
                </div>
                <button
                  className="ui-button ui-button-danger mt-3"
                  onClick={() => finalizeContest(contest.id)}
                >
                  Finalize
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
