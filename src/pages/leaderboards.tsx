import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { apiFetch } from '../lib/api/client';
import { supabase } from '../lib/supabaseClient';

export default function LeaderboardsPage() {
  const [global, setGlobal] = useState<Array<{ id: string; handle: string; rating: number }>>([]);
  const [levels, setLevels] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [levelBoard, setLevelBoard] = useState<Array<{ id: string; handle: string; rating: number }>>([]);

  useEffect(() => {
    apiFetch<{ leaderboard: Array<{ id: string; handle: string; rating: number }> }>(
      '/api/leaderboards?type=global'
    ).then((data) => setGlobal(data.leaderboard));

    supabase
      .from('levels')
      .select('id,name')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setLevels(data ?? []);
        if (data && data.length) {
          setSelectedLevel(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedLevel) return;
    apiFetch<{ leaderboard: Array<{ id: string; handle: string; rating: number }> }>(
      `/api/leaderboards?type=level&levelId=${selectedLevel}`
    ).then((data) => setLevelBoard(data.leaderboard));
  }, [selectedLevel]);

  return (
    <Layout>
      <TopNavigationBar />
      <main className="ui-page min-h-screen px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="ui-card p-6">
            <h1 className="text-3xl font-semibold">Leaderboards</h1>
          </div>

          <section className="ui-card p-6">
            <h2 className="text-xl font-semibold">Global</h2>
            <div className="mt-4 space-y-2">
              {global.map((row, index) => (
                <div key={row.id} className="ui-surface flex items-center justify-between p-3">
                  <span>#{index + 1}</span>
                  <span>{row.handle}</span>
                  <span className="font-semibold">{row.rating}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ui-card p-6">
            <h2 className="text-xl font-semibold">By level</h2>
            <select
              className="ui-select mt-3 max-w-xs"
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            <div className="mt-4 space-y-2">
              {levelBoard.map((row, index) => (
                <div key={row.id} className="ui-surface flex items-center justify-between p-3">
                  <span>#{index + 1}</span>
                  <span>{row.handle}</span>
                  <span className="font-semibold">{row.rating}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
