import React, { useEffect, useState } from 'react';
import { Link } from 'gatsby';
import Layout from '../../components/layout';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { apiFetch } from '../../lib/api/client';

export default function AdminDashboardPage() {
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ roles: string[] }>('/api/me')
      .then((data) => setRoles(data.roles))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unauthorized'));
  }, []);

  if (error) {
    return (
      <Layout>
        <TopNavigationBar />
        <main className="ui-page min-h-screen px-6 py-16">
          <div className="ui-card mx-auto max-w-3xl p-8">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
            Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!roles.length) {
    return (
      <Layout>
        <TopNavigationBar />
        <main className="ui-page min-h-screen px-6 py-16">
          <div className="ui-card mx-auto max-w-3xl p-8">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="mt-6">Loading...</div>
          </div>
        </main>
      </Layout>
    );
  }

  const isAdmin = roles.includes('admin');
  const isProblemManager = roles.includes('problem_manager');
  const isGrader = roles.includes('grader');

  if (!isAdmin && !isProblemManager && !isGrader) {
    return (
      <Layout>
        <TopNavigationBar />
        <main className="ui-page min-h-screen px-6 py-16">
          <div className="ui-card mx-auto max-w-3xl p-8">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNavigationBar />
      <main className="ui-page min-h-screen px-6 py-16">
        <div className="ui-card mx-auto max-w-3xl p-8">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="mt-8 space-y-3">
            {isAdmin ? <Link to="/admin/contests" className="ui-link block">Contest management</Link> : null}
            {isAdmin || isProblemManager ? (
              <Link to="/admin/problems" className="ui-link block">Problem manager</Link>
            ) : null}
            {isAdmin || isGrader ? (
              <Link to="/admin/grades" className="ui-link block">Grading dashboard</Link>
            ) : null}
          </div>
        </div>
      </main>
    </Layout>
  );
}
