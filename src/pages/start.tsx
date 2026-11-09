import { graphql, PageProps } from 'gatsby';
import * as React from 'react';
import StartPage, { StartPageData } from '../components/ug/start/StartPage';
import { PlacementProblem } from '../components/ug/start/Placement';

type Pool = { nodes: ReadonlyArray<PlacementProblem> };
type Data = StartPageData & { e8: Pool; n8: Pool; h8: Pool; a1: Pool; a2: Pool };

/** Start learning: pick a level, get a first module. */
export default function Start({ data, path }: PageProps<Data>): JSX.Element {
  const pools = React.useMemo(
    () => [data.e8, data.n8, data.h8, data.a1, data.a2].map(p => p?.nodes || []),
    [data]
  );
  return <StartPage data={data} path={path} pools={pools} />;
}

// The placement pools: recent AMC 8 problems (easy, normal, hard) and AIME
// problems 1-3 and 4-7, with an answer to check, and no figure to draw (the
// statement regex skips images, Asymptote and "shown below" wording).
export const query = graphql`
  fragment StartPlacementProblem on ProblemInfo {
    uniqueId
    name
    source
    statement
    interaction {
      type
      correct
      choices
      correctIndex
    }
  }
  query StartPage {
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
          description
        }
        fields {
          division
        }
        isIncomplete
        readingMinutes
      }
    }
    problemCounts: allProblemInfo {
      group(field: module___frontmatter___id) {
        fieldValue
        totalCount
      }
    }
    e8: allProblemInfo(
      filter: {
        uniqueId: { regex: "/^amc8-/" }
        difficulty: { eq: "Easy" }
        interaction: { type: { eq: "mcq" } }
        statement: {
          regex: "/^(?![^]*(![[]|<img|[[]asy|[.]png|[.]svg|below|shown|figure|diagram|picture))/i"
        }
      }
      sort: { fields: uniqueId, order: DESC }
      limit: 8
    ) {
      nodes {
        ...StartPlacementProblem
      }
    }
    n8: allProblemInfo(
      filter: {
        uniqueId: { regex: "/^amc8-/" }
        difficulty: { eq: "Normal" }
        interaction: { type: { eq: "mcq" } }
        statement: {
          regex: "/^(?![^]*(![[]|<img|[[]asy|[.]png|[.]svg|below|shown|figure|diagram|picture))/i"
        }
      }
      sort: { fields: uniqueId, order: DESC }
      limit: 8
    ) {
      nodes {
        ...StartPlacementProblem
      }
    }
    h8: allProblemInfo(
      filter: {
        uniqueId: { regex: "/^amc8-/" }
        difficulty: { eq: "Hard" }
        interaction: { type: { eq: "mcq" } }
        statement: {
          regex: "/^(?![^]*(![[]|<img|[[]asy|[.]png|[.]svg|below|shown|figure|diagram|picture))/i"
        }
      }
      sort: { fields: uniqueId, order: DESC }
      limit: 8
    ) {
      nodes {
        ...StartPlacementProblem
      }
    }
    a1: allProblemInfo(
      filter: {
        uniqueId: { regex: "/^aime-[0-9]{4}(-ii?)?-[1-3]$/" }
        interaction: { type: { eq: "integer" } }
        statement: {
          regex: "/^(?![^]*(![[]|<img|[[]asy|[.]png|[.]svg|below|shown|figure|diagram|picture))/i"
        }
      }
      sort: { fields: uniqueId, order: DESC }
      limit: 8
    ) {
      nodes {
        ...StartPlacementProblem
      }
    }
    a2: allProblemInfo(
      filter: {
        uniqueId: { regex: "/^aime-[0-9]{4}(-ii?)?-[4-7]$/" }
        interaction: { type: { eq: "integer" } }
        statement: {
          regex: "/^(?![^]*(![[]|<img|[[]asy|[.]png|[.]svg|below|shown|figure|diagram|picture))/i"
        }
      }
      sort: { fields: uniqueId, order: DESC }
      limit: 8
    ) {
      nodes {
        ...StartPlacementProblem
      }
    }
  }
`;
