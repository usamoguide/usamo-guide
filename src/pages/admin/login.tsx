import React, { useState } from 'react';
import { navigate } from 'gatsby';
import Layout from '../../components/layout';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate('/admin');
  }

  return (
    <Layout>
      <TopNavigationBar />
      <main className="ui-page min-h-screen px-6 py-16">
        <div className="ui-card mx-auto max-w-md p-8">
          <h1 className="mb-6 text-2xl font-semibold">Admin Login</h1>
          {error ? (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="ui-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="ui-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="ui-button ui-button-primary w-full" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </main>
    </Layout>
  );
}
