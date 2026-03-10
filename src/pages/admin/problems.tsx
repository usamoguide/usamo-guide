import React, { useEffect, useState } from 'react';
import ProblemManagerForm from '../../components/admin/ProblemManagerForm';
import Layout from '../../components/layout';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { apiFetch } from '../../lib/api/client';

type ProblemRow = {
  id: string;
  title: string;
  difficulty: number;
  point_value: number;
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const me = await apiFetch<{ roles: string[] }>('/api/me');
      setRoles(me.roles);
      if (!me.roles.includes('admin') && !me.roles.includes('problem_manager')) {
        setError('Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.');
        return;
      }
      const data = await apiFetch<{ problems: ProblemRow[] }>('/api/problems');
      setProblems(data.problems);
    } catch {
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
            <h1 className="text-2xl font-semibold">Problem Manager</h1>
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
            <h1 className="text-2xl font-semibold">Problem Manager</h1>
            <div className="mt-6">Loading...</div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNavigationBar />
      <main className="ui-page min-h-screen px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="ui-card p-8">
            <h1 className="text-2xl font-semibold">Problem Manager</h1>
            <ProblemManagerForm />
          </div>
          <div className="space-y-2">
            {problems.map((problem) => (
              <div key={problem.id} className="ui-card p-4">
                <div className="font-semibold">{problem.title}</div>
                <div className="text-sm ui-text-secondary">
                  {problem.difficulty} · {problem.point_value} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
