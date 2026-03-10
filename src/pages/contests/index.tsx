import React, { useEffect, useState } from 'react';
import { Link } from 'gatsby';
import Layout from '../../components/layout';
import SignInGate from '../../components/SignInGate';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { useCurrentUser } from '../../context/UserDataContext/UserDataContext';
import { apiFetch } from '../../lib/api/client';

type ContestRow = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  state: string;
};

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestRow[]>([]);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setContests([]);
      return;
    }
    apiFetch<{ contests: ContestRow[] }>('/api/contests')
      .then((data) => setContests(data.contests))
      .catch(() => setContests([]));
  }, [currentUser]);

  return (
    <Layout>
      <TopNavigationBar />
      <SignInGate
        title="Sign in to access contests"
        message="Contests require an account so your work can be saved and graded."
      >
        <main className="ui-page min-h-screen px-6 py-12">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="ui-card p-6">
              <h1 className="text-3xl font-semibold">Contests</h1>
              <div className="mt-2 text-sm ui-muted">
                Weekly contests, special events, and practice rounds.
              </div>
            </div>
            <div className="grid gap-4">
              {contests.map((contest) => (
                <Link
                  key={contest.id}
                  to={`/contests/workspace?contestId=${contest.id}`}
                  className="ui-card p-4"
                >
                  <div className="text-lg font-semibold">{contest.title}</div>
                  <div className="text-sm ui-text-secondary">{contest.description}</div>
                  <div className="text-xs ui-muted">
                    {contest.start_time} - {contest.end_time}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </SignInGate>
    </Layout>
  );
}
