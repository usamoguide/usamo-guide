import { graphql } from 'gatsby';
import * as React from 'react';
import { SectionID } from '../../content/ordering';
import TrackPage from '../components/ug/track/TrackPage';

export default function Template(props: {
  data: Queries.SyllabusQuery;
  pageContext: { division: SectionID };
  path: string;
}) {
  return (
    <TrackPage
      data={props.data}
      division={props.pageContext.division}
      path={props.path}
    />
  );
}
export const pageQuery = graphql`
  query Syllabus($division: String!) {
    modules: allXdm(
      filter: {
        fileAbsolutePath: { regex: "/content/" }
        fields: { division: { eq: $division } }
      }
    ) {
      nodes {
        id
        frontmatter {
          title
          id
          description
        }
        isIncomplete
        readingMinutes
      }
    }
    problems: allProblemInfo(
      filter: { module: { fields: { division: { eq: $division } } } }
    ) {
      nodes {
        uniqueId
        module {
          frontmatter {
            id
          }
        }
      }
    }
  }
`;
