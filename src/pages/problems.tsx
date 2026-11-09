import { graphql, PageProps } from 'gatsby';
import * as React from 'react';
import { InstantSearch } from 'react-instantsearch';
import MODULE_ORDERING, { moduleIDToSectionMap } from '../../content/ordering';
import Layout from '../components/layout';
import ProblemSearch, {
  ModuleGroup,
  ProblemStats,
} from '../components/ProblemsPage/ProblemSearch';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { UG_TRACKS } from '../components/ug/links';
import { diffOf, familyOf } from '../components/ug/problems/facets';
import { EMPTY_FILTERS, sortFilters } from '../components/ug/problems/search';
import { searchClient } from '../utils/algoliaSearchClient';

const indexName = `${process.env.GATSBY_ALGOLIA_INDEX_NAME ?? 'dev'}_problems`;

type Group = { fieldValue: string; problems: { totalCount: number }[] };

type DataProps = {
  problemStats: {
    all: { totalCount: number }[];
    bySource: Group[];
    byDifficulty: Group[];
    modulesWithProblems: string[];
  };
  modules: {
    nodes: {
      frontmatter: { id: string; title: string };
      fields: { division: string | null };
    }[];
  };
};

/**
 * Counts for the sidebar and the lists behind the source, track and module
 * filters, from the build-time problem data. A problem listed in several
 * modules has several nodes, so counts are of distinct problem ids.
 */
function buildStats(data: DataProps): ProblemStats {
  const { problemStats, modules } = data;
  const srcCounts: Record<string, number> = {};
  const sourcesByFamily: Record<string, string[]> = {};
  problemStats.bySource.forEach(g => {
    const fam = familyOf(g.fieldValue).key;
    srcCounts[fam] = (srcCounts[fam] ?? 0) + g.problems.length;
    sourcesByFamily[fam] = [...(sourcesByFamily[fam] ?? []), g.fieldValue];
  });
  const diffCounts: Record<string, number> = {};
  problemStats.byDifficulty.forEach(g => {
    const d = diffOf(g.fieldValue);
    if (d) diffCounts[d.key] = (diffCounts[d.key] ?? 0) + g.problems.length;
  });

  const withProblems = new Set(problemStats.modulesWithProblems);
  const titleOf: Record<string, string> = {};
  modules.nodes.forEach(n => {
    titleOf[n.frontmatter.id] = n.frontmatter.title;
  });
  // a few modules share a title across their parts ("..._p1", "..._p2")
  const seen: Record<string, number> = {};
  Object.values(titleOf).forEach(t => (seen[t] = (seen[t] ?? 0) + 1));
  const label = (id: string) => {
    const t = titleOf[id] ?? id;
    const part = id.match(/[_-]p(?:art)?(\d+)$/i);
    return seen[t] > 1 && part ? `${t} (part ${part[1]})` : t;
  };

  const modulesByTrack: Record<string, string[]> = {};
  const moduleGroups: ModuleGroup[] = UG_TRACKS.map(t => {
    const ids = MODULE_ORDERING[t.id]
      .flatMap(ch => ch.items)
      .filter(id => withProblems.has(id));
    modulesByTrack[t.id] = ids;
    return {
      label: t.label,
      track: t.id,
      modules: ids.map(id => ({ id, title: label(id) })),
    };
  });
  const elsewhere = [...withProblems]
    .filter(id => !moduleIDToSectionMap[id])
    .map(id => ({ id, title: label(id) }))
    .sort((a, b) => a.title.localeCompare(b.title));
  if (elsewhere.length) {
    moduleGroups.push({
      label: 'Other modules',
      track: '',
      modules: elsewhere,
    });
  }

  return {
    total: problemStats.all.length,
    diffCounts,
    srcCounts,
    sourcesByFamily,
    modulesByTrack,
    moduleGroups,
  };
}

export default function ProblemsPage(props: PageProps<DataProps>): JSX.Element {
  const stats = React.useMemo(() => buildStats(props.data), [props.data]);
  // the first request goes out in the default order; the page applies the URL right after
  const initialUiState = React.useMemo(
    () => ({
      [indexName]: {
        configure: {
          hitsPerPage: 24,
          filters: '',
          optionalFilters: sortFilters(EMPTY_FILTERS.sort),
        },
      },
    }),
    []
  );
  return (
    <Layout view="problems" footer="wide">
      <SEO
        title="Problems"
        description="Search every USAMO Guide practice problem by topic, difficulty, source, track and module."
        image={null}
        pathname={props.path}
      />
      <TopNavigationBar current="problems" wide />
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        initialUiState={initialUiState}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <ProblemSearch indexName={indexName} stats={stats} />
      </InstantSearch>
    </Layout>
  );
}

export const pageQuery = graphql`
  query ProblemsPage {
    problemStats: allProblemInfo {
      all: group(field: uniqueId) {
        totalCount
      }
      bySource: group(field: source) {
        fieldValue
        problems: group(field: uniqueId) {
          totalCount
        }
      }
      byDifficulty: group(field: difficulty) {
        fieldValue
        problems: group(field: uniqueId) {
          totalCount
        }
      }
      modulesWithProblems: distinct(field: module___frontmatter___id)
    }
    modules: allXdm(
      filter: {
        fileAbsolutePath: { regex: "/content/" }
        fields: { division: { ne: null } }
      }
    ) {
      nodes {
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
`;
