import { graphql, Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import ProblemAnswer from '../components/ProblemPage/ProblemAnswer';
import {
  CommunityDifficulty,
  SuggestTags,
  useApprovedTags,
} from '../components/ProblemPage/ProblemCommunity';
import ProblemMoreMenu from '../components/ProblemPage/ProblemMoreMenu';
import ProblemStatementMarkdown from '../components/ProblemPage/ProblemStatementMarkdown';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import Btn from '../components/ug/Btn';
import { useUGPrefs } from '../components/ug/hooks';
import {
  IcoChev,
  IcoChevLeft,
  IcoChevRight,
  IcoExternal,
} from '../components/ug/icons';
import { UG_LINKS, UG_TRACKS } from '../components/ug/links';
import { diffPill } from '../components/ug/pages/difficulty';
import { IcoBack, IcoStar } from '../components/ug/pages/pageIcons';
import ProblemStatusMenu, {
  PROBLEM_STATUS_LABELS,
  useProblemStatus,
} from '../components/ug/ProblemStatusMenu';
import { useLastViewedModule } from '../context/UserDataContext/properties/simpleProperties';
import {
  getProblemURL,
  ProblemDifficulty,
  ProblemInfo,
  probSources,
} from '../models/problem';

type ProblemTemplateData = {
  allProblemInfo: {
    nodes: ProblemTemplateNode[];
  };
  allModuleProblemLists: {
    nodes: {
      moduleId: string;
      problemLists: {
        listId: string;
        problems: { uniqueId: string; name: string; source: string }[];
      }[];
    }[];
  };
};

type ProblemTemplateNode = {
  uniqueId: string;
  name: string;
  url: string;
  source: string;
  sourceDescription: string | null;
  difficulty: string | null;
  isStarred: boolean;
  tags: string[];
  statement: string | null;
  author: string | null;
  interaction: {
    type: string;
    correct: string | null;
    choices: readonly string[] | null;
    correctIndex: number | null;
  };
  solutionReveal: {
    mode: string;
    url: string | null;
    markdown: string | null;
  };
  solution: ProblemInfo['solution'] | null;
  module: {
    frontmatter: { id: string; title: string };
    fields: { division: string } | null;
  } | null;
};

type ModuleRef = {
  id: string;
  title: string;
  division: string;
  starred: boolean;
};
type Neighbour = { name: string; to: string };

function graphqlInteraction(
  i: ProblemTemplateNode['interaction']
): ProblemInfo['interaction'] {
  if (i.type === 'integer' && i.correct != null) {
    return { type: 'integer', correct: i.correct };
  }
  if (
    i.type === 'mcq' &&
    i.choices &&
    i.correctIndex != null &&
    i.correctIndex >= 0 &&
    i.correctIndex < i.choices.length
  ) {
    return {
      type: 'mcq',
      choices: [...i.choices],
      correctIndex: i.correctIndex,
    };
  }
  return { type: 'none' };
}

function graphqlSolutionReveal(
  r: ProblemTemplateNode['solutionReveal'],
  fallbackUrl: string
): ProblemInfo['solutionReveal'] {
  if (r.mode === 'inline' && r.markdown?.trim()) {
    return { mode: 'inline', markdown: r.markdown };
  }
  return { mode: 'external', url: r.url ?? fallbackUrl };
}

function templateNodeToProblemInfo(node: ProblemTemplateNode): ProblemInfo {
  return {
    uniqueId: node.uniqueId,
    name: node.name,
    url: node.url,
    source: node.source,
    sourceDescription: node.sourceDescription ?? undefined,
    difficulty: (node.difficulty ?? 'N/A') as ProblemDifficulty,
    isStarred: node.isStarred,
    tags: [...node.tags],
    solution: node.solution as ProblemInfo['solution'],
    statement: node.statement ?? '',
    author: node.author ?? undefined,
    interaction: graphqlInteraction(node.interaction),
    solutionReveal: graphqlSolutionReveal(node.solutionReveal, node.url),
  };
}

const trackLabel = (division: string): string =>
  UG_TRACKS.find(t => t.id === division)?.label ?? division;

/** A real link to the original problem, not the usamoguide.com placeholder some entries carry. */
function originalUrlOf(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\/(www\.)?usamo(guide\.com|\.guide)(\/|$)/.test(url)) {
    return null;
  }
  return /^https?:/.test(url) ? url : null;
}

/** "artofproblemsolving.com" -> "AoPS", otherwise the bare host. */
function siteName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.endsWith('artofproblemsolving.com')) return 'AoPS';
    return host;
  } catch (e) {
    return 'the source';
  }
}

/** The status control in the head: the shared `.ps` ring plus its label, as one pill. */
function StatusPill({ uniqueId, name }: { uniqueId: string; name: string }) {
  const status = useProblemStatus(uniqueId);
  return (
    <div className="prb-stm">
      <ProblemStatusMenu uniqueId={uniqueId} name={name} alignRight />
      <span className="prb-stm-l">{PROBLEM_STATUS_LABELS[status]}</span>
      <IcoChev className="chev" />
    </div>
  );
}

export default function ProblemTemplate(
  props: PageProps<ProblemTemplateData, { uniqueId: string }>
): JSX.Element {
  const nodes = props.data.allProblemInfo.nodes;
  const node = nodes[0];
  const problem = node ? templateNodeToProblemInfo(node) : null;
  const prefs = useUGPrefs();
  const lastViewedModule = useLastViewedModule();
  const [approvedTags, setApprovedTags] = useApprovedTags(problem?.uniqueId);

  // Every module this problem appears in, in content order.
  const modules = React.useMemo(() => {
    const seen = new Map<string, ModuleRef>();
    nodes.forEach(n => {
      const id = n.module?.frontmatter?.id;
      const division = n.module?.fields?.division;
      if (!id || !division) return;
      const prev = seen.get(id);
      seen.set(id, {
        id,
        title: n.module!.frontmatter.title,
        division,
        starred: (prev?.starred ?? false) || n.isStarred,
      });
    });
    return Array.from(seen.values());
  }, [nodes]);

  // The module we're "in": the one you last read if it has this problem, else the first.
  const ctx =
    modules.find(m => m.id === lastViewedModule) ?? modules[0] ?? null;

  // Previous / next problem in that module's list.
  const [prev, next] = React.useMemo((): [
    Neighbour | null,
    Neighbour | null,
  ] => {
    if (!ctx || !node) return [null, null];
    const lists =
      props.data.allModuleProblemLists.nodes.find(l => l.moduleId === ctx.id)
        ?.problemLists ?? [];
    const list = lists.find(l =>
      l.problems.some(p => p.uniqueId === node.uniqueId)
    );
    if (!list) return [null, null];
    const i = list.problems.findIndex(p => p.uniqueId === node.uniqueId);
    const at = (k: number): Neighbour | null => {
      const p = list.problems[k];
      return p ? { name: p.name, to: getProblemURL(p) } : null;
    };
    return [at(i - 1), at(i + 1)];
  }, [ctx, node, props.data.allModuleProblemLists.nodes]);

  const visibleTags = React.useMemo(() => {
    if (!problem) return [];
    const tags = new Set<string>(problem.tags);
    approvedTags.forEach(tag => tags.add(tag));
    return Array.from(tags);
  }, [approvedTags, problem]);

  if (!node || !problem) {
    return (
      <Layout>
        <SEO title="Problem not found" image={null} pathname={props.path} />
        <TopNavigationBar current="problems" />
        <main className="wrap ap-page">
          <header className="ap-head">
            <p className="k-label">Problems</p>
            <h1 className="ap-h1">Problem not found</h1>
            <p className="ap-lede">
              This problem may have moved. Search the full list instead.
            </p>
            <div className="cta-row ap-cta">
              <Btn kind="p" to={UG_LINKS.problems} arrow>
                All problems
              </Btn>
            </div>
          </header>
        </main>
      </Layout>
    );
  }

  const sourceTooltip =
    node.sourceDescription ||
    (probSources[node.source as keyof typeof probSources]?.[1] ?? null);
  const original = originalUrlOf(node.url);
  const diff = prefs.diff ? diffPill(node.difficulty) : null;
  const starred = ctx ? ctx.starred : node.isStarred;
  const reveal = problem.solutionReveal;
  const externalSolution =
    reveal.mode === 'external' ? originalUrlOf(reveal.url) : null;

  return (
    <Layout footer="wide">
      <SEO
        title={`${node.name} — ${node.source}`}
        image={null}
        pathname={props.path}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.usamoguide.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Problems',
                item: 'https://www.usamoguide.com/problems/',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: node.name,
                item: `https://www.usamoguide.com${props.path}`,
              },
            ],
          },
        ]}
      />
      <TopNavigationBar current="problems" wide />

      <div className="prb-shell wrap-w" id="top">
        <article className="prb-main">
          <div className="prb-top">
            {prev ? (
              <Link
                className="prb-step"
                to={prev.to}
                aria-label={`Previous problem${ctx ? ` in ${ctx.title}` : ''}: ${prev.name}`}
              >
                <IcoChevLeft />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="prb-step-gap" aria-hidden="true" />
            )}
            <nav className="crumbs prb-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep" aria-hidden="true">
                ›
              </span>
              {ctx ? (
                <Link to={`/${ctx.division}/${ctx.id}`}>{ctx.title}</Link>
              ) : (
                <Link to={UG_LINKS.problems}>Problems</Link>
              )}
              <span className="sep" aria-hidden="true">
                ›
              </span>
              <span className="here">{node.name}</span>
            </nav>
            {next ? (
              <Link
                className="prb-step prb-step-n"
                to={next.to}
                aria-label={`Next problem${ctx ? ` in ${ctx.title}` : ''}: ${next.name}`}
              >
                <span>Next</span>
                <IcoChevRight />
              </Link>
            ) : (
              <span className="prb-step-gap" aria-hidden="true" />
            )}
          </div>

          <header className="prb-head">
            <div className="prb-head-t">
              <p className="k-label">
                <span title={sourceTooltip ?? undefined}>{node.source}</span>
                {ctx ? (
                  <>
                    <span className="prb-dot" aria-hidden="true">
                      ·
                    </span>
                    {trackLabel(ctx.division)}
                  </>
                ) : null}
              </p>
              <h1 className={node.name.length > 26 ? 'prb-h1 long' : 'prb-h1'}>
                {node.name}
              </h1>
              {diff || starred || node.author ? (
                <div className="prb-meta">
                  {diff ? (
                    <span className={`diff ${diff.cls}`}>{diff.label}</span>
                  ) : null}
                  {starred ? (
                    <span className="prb-feat">
                      <IcoStar />
                      Featured
                    </span>
                  ) : null}
                  {node.author ? (
                    <span className="prb-by">By {node.author}</span>
                  ) : null}
                </div>
              ) : null}
              {prefs.tags && visibleTags.length > 0 ? (
                <details className="prb-tagd">
                  <summary>
                    Show tags{' '}
                    <span className="prb-tagn">({visibleTags.length})</span>
                  </summary>
                  <span className="prb-tags">
                    {visibleTags.map(tag => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                </details>
              ) : null}
            </div>
            <div className="prb-head-ctl">
              <StatusPill uniqueId={problem.uniqueId} name={node.name} />
              <ProblemMoreMenu name={node.name} originalUrl={original} />
            </div>
          </header>

          <section className="prb-q" aria-labelledby="prb-h-problem">
            <h2 className="k-label" id="prb-h-problem">
              Problem
            </h2>
            <ProblemStatementMarkdown className="prb-stmt">
              {node.statement ?? ''}
            </ProblemStatementMarkdown>

            <ProblemAnswer problem={problem} />

            <div className="prb-sol">
              {reveal.mode === 'inline' ? (
                <details className="reveal">
                  <summary>
                    <span className="a-show">Show solution</span>
                    <span className="a-hide">Hide solution</span>
                  </summary>
                  <div className="prb-sol-body">
                    <ProblemStatementMarkdown>
                      {reveal.markdown}
                    </ProblemStatementMarkdown>
                  </div>
                </details>
              ) : externalSolution ? (
                <a
                  className="prb-ext"
                  href={externalSolution}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  See the solution on {siteName(externalSolution)}
                  <IcoExternal />
                </a>
              ) : (
                <p className="prb-none">
                  No solution is available for this problem yet.
                </p>
              )}
            </div>
          </section>

          <CommunityDifficulty
            uniqueId={problem.uniqueId}
            showAverage={prefs.diff}
          />

          {visibleTags.length === 0 ? (
            <SuggestTags
              uniqueId={problem.uniqueId}
              onApproved={setApprovedTags}
            />
          ) : null}

          {prev || next ? (
            <nav
              className="prb-pn"
              aria-label={
                ctx ? `More problems in ${ctx.title}` : 'More problems'
              }
            >
              {prev ? (
                <Link className="prb-pn-a" to={prev.to}>
                  <span className="prb-pn-k">
                    <IcoChevLeft />
                    Previous problem
                  </span>
                  <b>{prev.name}</b>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link className="prb-pn-a prb-pn-next" to={next.to}>
                  <span className="prb-pn-k">
                    Next problem
                    <IcoChevRight />
                  </span>
                  <b>{next.name}</b>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <Link className="prb-back" to={UG_LINKS.problems}>
            <IcoBack />
            All problems
          </Link>
        </article>

        <aside className="prb-side" aria-label="About this problem">
          {modules.length > 0 ? (
            <div className="prb-side-b">
              <p className="prb-side-k">Appears in</p>
              <nav className="prb-mods" aria-label="Modules with this problem">
                {modules.map(m => (
                  <Link
                    key={m.id}
                    to={`/${m.division}/${m.id}`}
                    className={
                      ctx && m.id === ctx.id && modules.length > 1
                        ? 'on'
                        : undefined
                    }
                  >
                    <span>{m.title}</span>
                    <small>{trackLabel(m.division)}</small>
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
          <div className="prb-side-b">
            <p className="prb-side-k">Source</p>
            <p className="prb-src">
              <b>{node.source}</b>
              {sourceTooltip && sourceTooltip !== node.source ? (
                <span>{sourceTooltip}</span>
              ) : null}
            </p>
            {original ? (
              <a
                className="prb-src-a"
                href={original}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                View the original
                <IcoExternal />
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query ProblemTemplate($uniqueId: String!) {
    allProblemInfo(filter: { uniqueId: { eq: $uniqueId } }) {
      nodes {
        uniqueId
        name
        url
        source
        sourceDescription
        difficulty
        isStarred
        tags
        statement
        author
        interaction {
          type
          correct
          choices
          correctIndex
        }
        solutionReveal {
          mode
          url
          markdown
        }
        solution {
          kind
          label
          labelTooltip
          url
          hasHints
          sketch
        }
        module {
          frontmatter {
            id
            title
          }
          fields {
            division
          }
        }
      }
    }
    allModuleProblemLists(
      filter: {
        problemLists: {
          elemMatch: {
            problems: { elemMatch: { uniqueId: { eq: $uniqueId } } }
          }
        }
      }
    ) {
      nodes {
        moduleId
        problemLists {
          listId
          problems {
            uniqueId
            name
            source
          }
        }
      }
    }
  }
`;
