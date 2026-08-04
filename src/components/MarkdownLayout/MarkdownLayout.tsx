import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { useContext, useState } from 'react';
import ConfettiContext from '../../context/ConfettiContext';
import MarkdownLayoutContext from '../../context/MarkdownLayoutContext';
import {
  ProblemSolutionContext,
  type ProblemSolutionContextValue,
} from '../../context/ProblemSolutionContext';
import { ProblemSuggestionModalProvider } from '../../context/ProblemSuggestionModalContext';
import {
  useSetProgressOnModule,
  useUserProgressOnModules,
} from '../../context/UserDataContext/properties/userProgress';
import { ModuleInfo } from '../../models/module';
import { SolutionInfo } from '../../models/solution';
import ForumCTA from '../ForumCTA';
import DesktopSidebar from './DesktopSidebar';
import MobileAppBar from './MobileAppBar';
import MobileSideNav from './MobileSideNav';
import ModuleHeaders from './ModuleHeaders/ModuleHeaders';
import ModuleProgressUpdateBanner from './ModuleProgressUpdateBanner';
import NavBar from './NavBar';
import NotSignedInWarning from './NotSignedInWarning';
import ScrollProgressButton from './ScrollProgressButton';
import LinksToEdit from './TableOfContents/LinksToEdit';
import TableOfContentsBlock from './TableOfContents/TableOfContentsBlock';

const ContentContainer = ({ children }) => (
  <main
    className="relative overflow-x-hidden pt-6 focus:outline-hidden lg:pt-2"
    tabIndex={0}
  >
    <div className="mx-auto">
      <div className="flex justify-center">
        {/* Placeholder for the sidebar */}
        <div
          className="order-1 hidden shrink-0 lg:block"
          style={{ width: '20rem' }}
        />
        <div className="order-2 w-0 min-w-0 flex-1 overflow-x-auto px-5 sm:px-8 lg:px-10 xl:px-12">
          <div className="hidden lg:block">
            <NavBar />
            <div className="h-8" />
          </div>

          {children}

          <div className="pt-4 pb-6">
            <NavBar alignNavButtonsRight={false} />
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default function MarkdownLayout({
  markdownData,
  children,
  /** When `markdownData` is a solution page, pass this or wrap with ProblemSolutionProvider. */
  problemSolution,
}: {
  markdownData: ModuleInfo | SolutionInfo;
  children: React.ReactNode;
  problemSolution?: ProblemSolutionContextValue | null;
}) {
  const userProgressOnModules = useUserProgressOnModules();
  const setModuleProgress = useSetProgressOnModule();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const moduleProgress =
    (userProgressOnModules && userProgressOnModules[markdownData.id]) ||
    'Not Started';

  const tocEntries = markdownData.toc ?? {};
  const tableOfContents =
    tocEntries.cpp ||
    tocEntries.java ||
    tocEntries.py ||
    Object.values(tocEntries)[0] ||
    [];

  const data = useStaticQuery(graphql`
    query {
      allXdm(
        filter: {
          fileAbsolutePath: { regex: "/content/" }
          fields: { division: { ne: null } }
        }
      ) {
        nodes {
          frontmatter {
            title
            id
          }
          fields {
            division
          }
        }
      }
    }
  `);
  const moduleLinks = React.useMemo(() => {
    return data.allXdm.nodes
      .filter(cur => cur.fields?.division)
      .map(cur => ({
        id: cur.frontmatter.id,
        title: cur.frontmatter.title ?? cur.frontmatter.id,
        section: cur.fields.division,
        url: `/${cur.fields.division}/${cur.frontmatter.id}`,
      }));
  }, [data.allXdm]);
  const showConfetti = useContext(ConfettiContext);
  const handleCompletionChange = progress => {
    if (moduleProgress === progress) return;
    setModuleProgress(markdownData.id, progress);
    if (
      moduleProgress !== 'Complete' &&
      (progress === 'Practicing' || progress === 'Complete')
    ) {
      showConfetti!();
    }
  };

  const problemSolutionFromTree = useContext(ProblemSolutionContext);
  const solutionLayoutContext: ProblemSolutionContextValue | null =
    markdownData instanceof SolutionInfo
      ? problemSolution ?? problemSolutionFromTree
      : null;

  if (markdownData instanceof SolutionInfo && !solutionLayoutContext) {
    throw new Error(
      'MarkdownLayout: solution pages need `problemSolution={...}` or an ancestor ProblemSolutionProvider'
    );
  }

  let activeIDs: string[] = [];
  if (markdownData instanceof ModuleInfo) {
    activeIDs.push(markdownData.id);
  } else {
    activeIDs = solutionLayoutContext!.modulesThatHaveProblem.map(x => x.id);
  }

  const layoutTree = (
    <MarkdownLayoutContext.Provider
      value={{
        markdownLayoutInfo: markdownData,
        sidebarLinks: moduleLinks,
        activeIDs,
        uniqueID: null, // legacy, remove when classes is removed
        isMobileNavOpen,
        setIsMobileNavOpen,
        moduleProgress,
        handleCompletionChange,
      }}
    >
      <ProblemSuggestionModalProvider>
        <MobileSideNav />
        <DesktopSidebar />
        <ScrollProgressButton />

        <div className="w-full">
          <MobileAppBar />

          <ContentContainer>
            <NotSignedInWarning />

            <ModuleHeaders moduleLinks={moduleLinks} />

            <TableOfContentsBlock tableOfContents={tableOfContents} />

            {children}

            {markdownData instanceof ModuleInfo && (
              <div className="mt-6 mb-2">
                <LinksToEdit className="group inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" />
              </div>
            )}

            <ModuleProgressUpdateBanner />

            <ForumCTA />
          </ContentContainer>
        </div>
      </ProblemSuggestionModalProvider>
    </MarkdownLayoutContext.Provider>
  );

  if (markdownData instanceof SolutionInfo && problemSolution) {
    return (
      <ProblemSolutionContext.Provider value={problemSolution}>
        {layoutTree}
      </ProblemSolutionContext.Provider>
    );
  }

  return layoutTree;
}
