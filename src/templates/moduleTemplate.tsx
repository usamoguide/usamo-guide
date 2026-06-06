import { graphql, navigate } from 'gatsby';
import * as React from 'react';
import { useEffect } from 'react';
import { SECTION_LABELS } from '../../content/ordering';
import { ContentAccessModal } from '../components/ContentAccessModal';
import Layout from '../components/layout';
import Markdown from '../components/markdown/Markdown';
import MarkdownLayout from '../components/MarkdownLayout/MarkdownLayout';
import SEO from '../components/seo';
import { ConfettiProvider } from '../context/ConfettiContext';
import { MarkdownProblemListsProvider } from '../context/MarkdownProblemListsContext';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../context/UserDataContext/UserDataContext';
import { graphqlToModuleInfo } from '../utils/utils';

export default function Template(props): JSX.Element {
  const { xdm, moduleProblemLists } = props.data; // data.markdownRemark holds your post data
  const { body } = xdm;
  const module = React.useMemo(() => graphqlToModuleInfo(xdm), [xdm]);
  const isLoaded = useIsUserDataLoaded();
  const currentUser = useCurrentUser();
  const isDevelopmentSection = module.section === 'advanced' || module.section === 'usamo';
  const [isAccessModalDismissed, setIsAccessModalDismissed] = React.useState(false);
  const [isDevModalDismissed, setIsDevModalDismissed] = React.useState(false);
  const isContentLocked = !currentUser;
  const showContentAccessModal =
    isLoaded && !isDevelopmentSection && isContentLocked && !isAccessModalDismissed;
  const showDevelopmentModal = isLoaded && isDevelopmentSection && !isDevModalDismissed;

  useEffect(() => {
    // Modal dismissal should reset on page navigation/module change.
    setIsAccessModalDismissed(false);
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
        const offset = anchor.getBoundingClientRect().top + window.scrollY;
        window.scroll({ top: offset, left: 0 });
      } catch (e) {
        console.error(e);
      }
    });
  }, [isLoaded]);

  return (
    <Layout setLastViewedModule={module.id}>
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

      <div
        data-page-tone="dark"
        className="relative overflow-hidden bg-gradient-to-b from-[#0D0A1D] via-[#090713] to-[#05040D]"
      >

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(191,128,255,0.07),transparent_34%),radial-gradient(circle_at_18%_84%,rgba(112,66,138,0.09),transparent_34%),linear-gradient(180deg,rgba(7,6,18,0.48),rgba(8,7,18,0.82)_70%,rgba(4,3,10,0.96))]" />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,2,8,0.42),rgba(3,2,8,0.08)_22%,rgba(3,2,8,0.08)_78%,rgba(3,2,8,0.42))]" />

        <div className="pointer-events-none absolute inset-0">
          <svg className="h-full w-full opacity-[0.04] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="module-grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
                <path
                  d="M 64 0 L 0 0 0 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-[#F0C2FF]/12"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#module-grid-pattern)" />
          </svg>
        </div>

        <div
          className={
            showContentAccessModal || showDevelopmentModal
              ? 'pointer-events-none select-none blur-[4px]'
              : ''
          }
        >
          <ConfettiProvider>
            <MarkdownProblemListsProvider
              value={moduleProblemLists?.problemLists || []}
            >
              <MarkdownLayout markdownData={module}>
                <div className="py-4">
                  <Markdown body={body} />
                </div>
              </MarkdownLayout>
            </MarkdownProblemListsProvider>
          </ConfettiProvider>
        </div>
      </div>

      <ContentAccessModal
        isOpen={showContentAccessModal}
        sectionLabel={SECTION_LABELS[module.section]}
        onClose={() => {
          setIsAccessModalDismissed(true);
        }}
      />
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
        }
      }
    }
  }
`;
