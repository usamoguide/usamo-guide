import * as React from 'react';
import Layout from '../../components/layout';
import ProblemView, {
  ProblemTemplateNode,
} from '../../components/ProblemPage/ProblemView';
import SEO from '../../components/seo';
import TopNavigationBar from '../../components/TopNavigationBar/TopNavigationBar';

/**
 * Client-only route for every individual problem.
 *
 * Previously each problem got its own statically generated page, which meant
 * ~3,800 extra pages, page-data payloads, and SSR renders per build. That is
 * what pushed deploys over their memory ceiling. Now a single route serves all
 * of them and pulls the problem record from a static JSON file at runtime, so
 * the build cost is constant regardless of how many problems exist.
 *
 * The JSON files are emitted by `onPostBuild`/`onCreateDevServer` in
 * gatsby-node.ts, keyed by the same slug the URL already used, so every
 * existing /problems/... link keeps working unchanged.
 */

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; node: ProblemTemplateNode; path: string }
  | { status: 'missing' };

function slugFromPathname(pathname: string): string | null {
  // "/problems/aime-problem-12-2000-aime-i-aime-2000-i-12/" -> the last segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2 || segments[0] !== 'problems') return null;
  return segments[segments.length - 1];
}

export default function ProblemRoute(): JSX.Element {
  const [state, setState] = React.useState<LoadState>({ status: 'loading' });

  React.useEffect(() => {
    const slug = slugFromPathname(window.location.pathname);
    if (!slug) {
      setState({ status: 'missing' });
      return;
    }

    let cancelled = false;
    fetch(`/problem-data/${encodeURIComponent(slug)}.json`)
      .then(response => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return response.json();
      })
      .then((node: ProblemTemplateNode) => {
        if (!cancelled)
          setState({ status: 'ready', node, path: window.location.pathname });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'missing' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'ready') {
    return <ProblemView node={state.node} path={state.path} />;
  }

  // Loading and missing share the page chrome so the frame does not jump once
  // the fetch resolves.
  return (
    <Layout>
      <SEO
        title={state.status === 'loading' ? 'Problem' : 'Problem not found'}
      />
      <div
        className="flex min-h-screen flex-col"
        style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
      >
        <TopNavigationBar />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
          {state.status === 'loading' ? (
            <div aria-live="polite">
              <div
                className="h-4 w-28 animate-pulse rounded"
                style={{ background: 'var(--bg-surface-alt)' }}
              />
              <div
                className="mt-6 h-9 w-3/4 animate-pulse rounded"
                style={{ background: 'var(--bg-surface-alt)' }}
              />
              <div
                className="mt-8 h-32 w-full animate-pulse rounded"
                style={{ background: 'var(--bg-surface-alt)' }}
              />
              <span className="sr-only">Loading problem</span>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Problem not found</h1>
              <p className="mt-3" style={{ color: 'var(--text-muted)' }}>
                We could not find a problem at this address. It may have been
                renamed or removed.
              </p>
              <p className="mt-8">
                <a className="underline" href="/problems">
                  ← Back to all problems
                </a>
              </p>
            </>
          )}
        </main>
      </div>
    </Layout>
  );
}
