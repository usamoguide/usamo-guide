import { graphql, Link, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { useContext, useState } from 'react';
import { SectionID } from '../../../content/ordering';
import ConfettiContext from '../../context/ConfettiContext';
import MarkdownLayoutContext from '../../context/MarkdownLayoutContext';
import {
  useMarkdownProblemLists,
  useMarkdownProblems,
} from '../../context/MarkdownProblemListsContext';
import { ProblemSuggestionModalProvider } from '../../context/ProblemSuggestionModalContext';
import {
  useSetProgressOnModule,
  useUserProgressOnModules,
  useUserProgressOnProblems,
} from '../../context/UserDataContext/properties/userProgress';
import { ModuleInfo, ModuleProgress } from '../../models/module';
import { FrequencyHints, FrequencyLabels } from '../Frequency';
import Markdown, { evaluateMdx } from '../markdown/Markdown';
import { IcoChevLeft, IcoChevRight } from '../ug/icons';
import { UG_LINKS, UG_TRACKS } from '../ug/links';
import {
  lessonComponents,
  readingMinutes,
  referencedLists,
  sectionize,
} from '../ug/module/lesson';
import ModuleEnd from '../ug/module/ModuleEnd';
import { ModulePageProvider } from '../ug/module/ModulePageContext';
import ModuleSidebar from '../ug/module/ModuleSidebar';
import ModuleStatusMenu from '../ug/module/ModuleStatusMenu';
import {
  TocColumn,
  TocInline,
  TocItem,
  useScrollSpy,
} from '../ug/module/ModuleToc';
import PracticeTable from '../ug/module/PracticeTable';
import {
  buildNavTrack,
  joinNames,
  NavModule,
  timeAgo,
} from '../ug/module/track';

type NavQuery = {
  allXdm: {
    nodes: {
      frontmatter: { title: string | null; id: string };
      fields: { division: string | null } | null;
    }[];
  };
};

/** id of the practice section added for problem lists the lesson doesn't show */
const EXTRA_ID = 'practice-set';

const IcoUp = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 19V5.5M6 11l6-6 6 6" />
  </svg>
);

/** The heading text in the MDX toc arrives HTML-escaped ("Definition &amp; Intuition"). */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&');
}

/** The contents from the MDX headings: the top level and the one below it. */
function tocFrom(module: ModuleInfo): TocItem[] {
  const t = module.toc ?? ({} as ModuleInfo['toc']);
  const entries =
    (t as any)?.cpp ||
    (t as any)?.java ||
    (t as any)?.py ||
    Object.values(t || {})[0] ||
    [];
  const list = (
    entries as { depth: number; value: string; slug: string }[]
  ).filter(e => e && e.slug);
  // a lone h1 at the top just repeats the title: the h2s are the sections then
  const h1s = list.filter(e => e.depth === 1).length;
  const base = h1s > 1 ? 1 : 2;
  return (
    list
      .filter(e => e.depth === base || e.depth === base + 1)
      // "Solution" headings become reveals in the lesson; they'd only repeat here
      .filter(e => !/^(solution|answer)s?:?$/i.test(e.value.trim()))
      .map(e => ({
        id: e.slug,
        label: decodeEntities(e.value),
        l2: e.depth === base + 1,
      }))
  );
}

/**
 * The module page in the redesign (module.html): the whole track in a sidebar,
 * the lesson in the middle, contents on the right.
 */
export default function MarkdownLayout({
  markdownData,
  body,
  readingMinutes: givenMinutes,
}: {
  markdownData: ModuleInfo;
  /** the compiled MDX */
  body: string;
  /** reading time from the content pipeline (Xdm.readingMinutes) */
  readingMinutes?: number | null;
}): JSX.Element {
  const module = markdownData;
  const division = module.section as SectionID;
  const userProgressOnModules = useUserProgressOnModules() || {};
  const problemProgress = useUserProgressOnProblems() || {};
  const setModuleProgress = useSetProgressOnModule();
  const showConfetti = useContext(ConfettiContext);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const moduleProgress: ModuleProgress =
    (userProgressOnModules[module.id] as ModuleProgress) || 'Not Started';

  const handleCompletionChange = (progress: ModuleProgress) => {
    if (moduleProgress === progress) return;
    setModuleProgress(module.id, progress);
    if (
      moduleProgress !== 'Complete' &&
      (progress === 'Practicing' || progress === 'Complete')
    ) {
      showConfetti?.();
    }
  };

  // every module's title and track, for the sidebar, the switcher and prev/next
  const data: NavQuery = useStaticQuery(graphql`
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
  const { titles, trackCounts, sidebarLinks } = React.useMemo(() => {
    const titles: { [id: string]: string } = {};
    const trackCounts: { [division: string]: number } = {};
    const sidebarLinks: {
      id: string;
      title: string;
      section: SectionID;
      url: string;
    }[] = [];
    data.allXdm.nodes.forEach(n => {
      const d = n.fields?.division;
      if (!d) return;
      trackCounts[d] = (trackCounts[d] || 0) + 1;
      const title = n.frontmatter.title ?? n.frontmatter.id;
      sidebarLinks.push({
        id: n.frontmatter.id,
        title,
        section: d as SectionID,
        url: `/${d}/${n.frontmatter.id}`,
      });
      if (d === division) titles[n.frontmatter.id] = title;
    });
    return { titles, trackCounts, sidebarLinks };
  }, [data, division]);

  const chapters = React.useMemo(
    () => buildNavTrack(division, titles),
    [division, titles]
  );
  const flat = React.useMemo(
    () => chapters.flatMap(ch => ch.modules),
    [chapters]
  );
  const idx = flat.findIndex(m => m.id === module.id);
  const here = flat[idx] as NavModule | undefined;
  const chapter = chapters.find(ch => ch.modules.some(m => m.id === module.id));
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const track = UG_TRACKS.find(t => t.id === division);
  const trackLabel = track?.label ?? division;

  // the lesson
  const content = React.useMemo(
    () => evaluateMdx(body, lessonComponents),
    [body]
  );
  // the pipeline's estimate (shared with the track page), else one from the rendered text
  const fallbackMinutes = React.useMemo(
    () => readingMinutes(content),
    [content]
  );
  const minutes = givenMinutes ?? fallbackMinutes;

  // the practice set
  const problems = useMarkdownProblems();
  const problemIds = React.useMemo(
    () => Array.from(new Set(problems.map(p => p.uniqueId))),
    [problems]
  );
  const solved = problemIds.filter(
    id => problemProgress[id] === 'Solved'
  ).length;

  // problem lists the lesson doesn't place itself still get a practice section at the end
  const allLists = useMarkdownProblemLists();
  const extraLists = React.useMemo(() => {
    const shown = referencedLists(content);
    return (allLists ?? []).filter(
      l => !shown.has(l.listId) && l.problems.length > 0
    );
  }, [allLists, content]);

  const toc = React.useMemo(() => {
    const items = tocFrom(module);
    if (extraLists.length && !items.some(t => t.id === EXTRA_ID)) {
      items.push({ id: EXTRA_ID, label: 'Practice problems', l2: false });
    }
    return items;
  }, [module, extraLists]);
  const { cur, topOn } = useScrollSpy(
    React.useMemo(() => toc.map(t => t.id), [toc])
  );

  const authors = joinNames(module.author);
  const contributors = joinNames(module.contributors);
  const freq =
    module.frequency !== null && module.frequency !== undefined
      ? Number(module.frequency)
      : null;
  const prereqs = (module.prerequisites || []).map(id => {
    const link = sidebarLinks.find(x => x.id === id);
    return link
      ? { id, title: link.title, url: link.url }
      : { id, title: id, url: null };
  });

  const relPath = `content/${module.fileRelativePath}`;
  const githubEditUrl = `${UG_LINKS.github}/edit/main/${relPath}`;
  const editorUrl = `/editor/?filepath=${relPath}`;
  const reportUrl = `${UG_LINKS.contact}?location=${encodeURIComponent(module.title)}`;
  const [updated, setUpdated] = useState<string | null>(null);
  React.useEffect(
    () => setUpdated(timeAgo(module.gitAuthorTime)),
    [module.gitAuthorTime]
  );

  return (
    <MarkdownLayoutContext.Provider
      value={{
        markdownLayoutInfo: module,
        sidebarLinks,
        activeIDs: [module.id],
        uniqueID: null,
        isMobileNavOpen,
        setIsMobileNavOpen,
        moduleProgress,
        handleCompletionChange,
      }}
    >
      <ModulePageProvider value={{ id: module.id, title: module.title }}>
        <ProblemSuggestionModalProvider>
          <div className="md-shell wrap-w" id="top">
            <ModuleSidebar
              division={division}
              chapters={chapters}
              currentId={module.id}
              progress={
                userProgressOnModules as { [id: string]: ModuleProgress }
              }
              trackCounts={trackCounts}
            />

            <article className="md-main">
              <div className="md-top">
                {prev ? (
                  <Link
                    className="md-step"
                    to={prev.url}
                    aria-label={`Previous module: ${prev.title}`}
                  >
                    <IcoChevLeft />
                    <span>Prev</span>
                  </Link>
                ) : (
                  <span className="md-step is-off" aria-disabled="true">
                    <IcoChevLeft />
                    <span>Prev</span>
                  </span>
                )}
                <nav className="crumbs md-crumbs" aria-label="Breadcrumb">
                  <Link to="/">Home</Link>
                  <span className="sep" aria-hidden="true">
                    ›
                  </span>
                  <Link to={`/${division}`}>{trackLabel}</Link>
                  <span className="sep" aria-hidden="true">
                    ›
                  </span>
                  <span className="here">{module.title}</span>
                </nav>
                {next ? (
                  <Link
                    className="md-step md-step-n"
                    to={next.url}
                    aria-label={`Next module: ${next.title}`}
                  >
                    <span>Next</span>
                    <IcoChevRight />
                  </Link>
                ) : (
                  <span
                    className="md-step md-step-n is-off"
                    aria-disabled="true"
                  >
                    <span>Next</span>
                    <IcoChevRight />
                  </span>
                )}
              </div>

              <header className="md-head">
                <div className="md-head-t">
                  <p className="k-label">
                    {here ? `Module ${here.num}` : 'Module'}
                    {chapter ? (
                      <>
                        <span className="dot" aria-hidden="true">
                          ·
                        </span>
                        {chapter.name}
                      </>
                    ) : null}
                  </p>
                  <h1 className="md-h1">{module.title}</h1>
                  {module.description ? (
                    <p className="md-sub">{module.description}</p>
                  ) : null}
                  <p className="md-meta">
                    {authors ? (
                      <>
                        <span className="m-by">
                          By {authors}
                          {contributors
                            ? `, with help from ${contributors}`
                            : ''}
                        </span>
                        <span className="dot m-dot" aria-hidden="true">
                          ·
                        </span>
                      </>
                    ) : null}
                    <span className="nw">{minutes} min read</span>
                    {problemIds.length ? (
                      <>
                        <span className="dot" aria-hidden="true">
                          ·
                        </span>
                        <span className="nw">
                          {problemIds.length} practice problem
                          {problemIds.length === 1 ? '' : 's'}
                        </span>
                      </>
                    ) : null}
                    {freq !== null && FrequencyLabels[freq] ? (
                      <>
                        <span className="dot" aria-hidden="true">
                          ·
                        </span>
                        <span className="nw" title={FrequencyHints[freq]}>
                          {FrequencyLabels[freq]} on contests
                        </span>
                      </>
                    ) : null}
                  </p>
                  {prereqs.length ? (
                    <p className="md-pre">
                      <span className="md-pre-k">Before this</span>
                      {prereqs.map((p, i) => (
                        <React.Fragment key={p.id}>
                          {i > 0 ? ', ' : ''}
                          {p.url ? (
                            <Link to={p.url}>{p.title}</Link>
                          ) : (
                            <span>{p.title}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  ) : null}
                </div>
                <ModuleStatusMenu
                  status={moduleProgress}
                  onChange={handleCompletionChange}
                />
              </header>

              <TocInline items={toc} cur={cur} />

              <Markdown
                content={content}
                transform={sectionize}
                className="md-body"
                after={
                  <>
                    {extraLists.length ? (
                      <section id={EXTRA_ID} aria-labelledby={`h-${EXTRA_ID}`}>
                        <h2 id={`h-${EXTRA_ID}`}>Practice problems</h2>
                        {extraLists.map((l, i) => (
                          <PracticeTable
                            key={l.listId}
                            problems={l.listId}
                            intro={i === 0}
                          />
                        ))}
                      </section>
                    ) : null}
                    <ModuleEnd
                      status={moduleProgress}
                      onStatus={handleCompletionChange}
                      hasProblems={problemIds.length > 0}
                      prev={prev}
                      next={next}
                      githubEditUrl={githubEditUrl}
                      editorUrl={editorUrl}
                      reportUrl={reportUrl}
                      updated={updated}
                    />
                  </>
                }
              />
            </article>

            <TocColumn
              items={toc}
              cur={cur}
              solved={solved}
              total={problemIds.length}
            />
          </div>
          <a
            className={topOn ? 'to-top on' : 'to-top'}
            href="#top"
            aria-label="Back to top"
          >
            <IcoUp />
          </a>
        </ProblemSuggestionModalProvider>
      </ModulePageProvider>
    </MarkdownLayoutContext.Provider>
  );
}
