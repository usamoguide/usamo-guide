import React, { useEffect, useState } from 'react';
import GradeTable from '../../components/admin/GradeTable';
import Layout from '../../components/layout';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { apiFetch } from '../../lib/api/client';
import { supabase } from '../../lib/supabaseClient';

type SubmissionRow = {
  id: string;
  contest_id: string;
  problem_id: string;
  user_id: string;
  content_latex: string;
};

export default function AdminGradesPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const me = await apiFetch<{ roles: string[] }>('/api/me');
      setRoles(me.roles);
      if (!me.roles.includes('admin') && !me.roles.includes('grader')) {
        setError('Not allowed unless permission granted by admin. Contact pranavramesh2017@gmail.com.');
        return;
      }
      const { data } = await supabase
        .from('submissions')
        .select('id,contest_id,problem_id,user_id,content_latex')
        .order('created_at', { ascending: false })
        .limit(50);
      setSubmissions(data ?? []);
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
          <div className="ui-card mx-auto max-w-6xl p-8">
            <h1 className="text-2xl font-semibold">Grading Dashboard</h1>
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
          <div className="ui-card mx-auto max-w-6xl p-8">
            <h1 className="text-2xl font-semibold">Grading Dashboard</h1>
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
        <div className="mx-auto max-w-6xl">
          <div className="ui-card p-8">
            <h1 className="text-2xl font-semibold">Grading Dashboard</h1>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <button
                    key={submission.id}
                    className="ui-button w-full justify-between text-left"
                    onClick={() => setSelected(submission)}
                  >
                    <div>
                      <div className="text-sm ui-text-secondary">{submission.user_id}</div>
                      <div className="font-semibold">Submission {submission.id.slice(0, 8)}</div>
                    </div>
                  </button>
                ))}
              </div>
              {selected ? (
                <div className="space-y-4">
                  <div className="ui-surface p-4">
                    <pre className="whitespace-pre-wrap text-sm">{selected.content_latex}</pre>
                  </div>
                  <GradeTable
                    submissionId={selected.id}
                    parts={[{ id: null, label: 'Total', maxScore: 7 }]}
                  />
                </div>
              ) : (
                <div className="ui-surface p-6 text-sm ui-muted">
                  Select a submission to grade.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
