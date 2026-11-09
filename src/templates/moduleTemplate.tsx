import { graphql, navigate } from 'gatsby';
import * as React from 'react';
import { useEffect } from 'react';
import { SECTION_LABELS } from '../../content/ordering';
import { ContentAccessModal } from '../components/ContentAccessModal';
import Layout from '../components/layout';
import MarkdownLayout from '../components/MarkdownLayout/MarkdownLayout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { ConfettiProvider } from '../context/ConfettiContext';
import { MarkdownProblemListsProvider } from '../context/MarkdownProblemListsContext';
import { useIsUserDataLoaded } from '../context/UserDataContext/UserDataContext';
import { graphqlToModuleInfo } from '../utils/utils';

export default function Template(props): JSX.Element {
  const { xdm, moduleProblemLists } = props.data; // data.markdownRemark holds your post data
  const { body } = xdm;
  const module = React.useMemo(() => graphqlToModuleInfo(xdm), [xdm]);
  const isLoaded = useIsUserDataLoaded();
  const isDevelopmentSection =
    module.section === 'advanced' || module.section === 'usamo';
  const [isDevModalDismissed, setIsDevModalDismissed] = React.useState(false);
  const showDevelopmentModal =
    isLoaded && isDevelopmentSection && !isDevModalDismissed;

  useEffect(() => {
    // Modal dismissal should reset on page navigation/module change.
    setIsDevModalDismissed(false);
  }, [module.id]);

  useEffect(() => {
    // source: https://miguelpiedrafita.com/snippets/scrollToHash
    const { hash } = location;
    if (!hash) return;
    if (!isLoaded) return;
    window.requestAnimationFrame(() => {
      try {
        const anchor = document.getElementById(hash.substring(1));
        if (!anchor) throw new Error(`The anchor "${hash}" doesn't exist`);
        // a solution reveal (or anything inside one) opens before we scroll to it
        let d: HTMLDetailsElement | null =
          anchor instanceof HTMLDetailsElement
            ? anchor
            : anchor.closest('details');
        while (d) {
          d.open = true;
          d = d.parentElement?.closest('details') ?? null;
        }
        // scroll-margin-top on [id] keeps it clear of the sticky nav
        anchor.scrollIntoView({ block: 'start' });
      } catch (e) {
        console.error(e);
      }
    });
  }, [isLoaded]);

  return (
    <Layout view="module" footer="wide" setLastViewedModule={module.id}>
      <SEO
        title={`${module.title}`}
        description={module.description}
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
                name: SECTION_LABELS[module.section],
                item: `https://www.usamoguide.com/${module.section}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: module.title,
                item: `https://www.usamoguide.com/${module.section}/${module.id}`,
              },
            ],
          },
        ]}
      />

      <TopNavigationBar current="tracks" wide hidePromoBar />

      <div
        className={showDevelopmentModal ? 'md-blur' : undefined}
        aria-hidden={showDevelopmentModal ? 'true' : undefined}
      >
        <ConfettiProvider>
          <MarkdownProblemListsProvider
            value={moduleProblemLists?.problemLists || []}
          >
            <MarkdownLayout
              markdownData={module}
              body={body}
              readingMinutes={xdm.readingMinutes}
            />
          </MarkdownProblemListsProvider>
        </ConfettiProvider>
      </div>

      <ContentAccessModal
        isOpen={showDevelopmentModal}
        mode="development"
        sectionLabel={SECTION_LABELS[module.section]}
        primaryActionLabel="Go to Dashboard"
        onPrimaryAction={() => navigate('/dashboard')}
        onClose={() => {
          setIsDevModalDismissed(true);
        }}
      />
    </Layout>
  );
}

export const pageQuery = graphql`
  query ($id: String!) {
    xdm(frontmatter: { id: { eq: $id } }) {
      body
      readingMinutes
      frontmatter {
        title
        author
        contributors
        id
        prerequisites
        description
        frequency
      }
      parent {
        ... on File {
          name
          relativePath
        }
      }
      fields {
        division
        gitAuthorTime
      }
      toc {
        cpp {
          depth
          value
          slug
        }
        java {
          depth
          value
          slug
        }
        py {
          depth
          value
          slug
        }
      }
    }
    moduleProblemLists(moduleId: { eq: $id }) {
      problemLists {
        listId
        problems {
          uniqueId
          name
          url
          source
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
        }
      }
    }
  }
`;
