import { Link } from 'gatsby';
import * as React from 'react';
import MODULE_ORDERING, {
  moduleIDToURLMap,
  SectionID,
} from '../../../../content/ordering';
import Markdown, { evaluateMdx } from '../../markdown/Markdown';
import { components as mdxComponents } from '../../markdown/MDXComponents';
import { UG_TRACKS } from '../links';
import { PASCAL_ARROW } from './paths';
import { css, cx, IcoLock, IcoOut, onIf } from './util';

/** The module the landing page shows in its lesson window (the page query fetches it). */
export const SAMPLE_MODULE_ID = 'shoelace-theorem-p1';

/** The landing page query's result for that module. */
export type SampleLessonData = {
  body: string;
  frontmatter: {
    id: string;
    title: string;
    description: string | null;
    difficulty: string | null;
  };
  fields: { division: string | null } | null;
};

// Pascal's triangle in the margin doodle: [x, y, value]
const PASCAL: [number, number, number][] = [
  [120, 34, 1],
  [103.5, 67, 1],
  [136.5, 67, 1],
  [87, 100, 1],
  [120, 100, 2],
  [153, 100, 1],
  [70.5, 133, 1],
  [103.5, 133, 3],
  [136.5, 133, 3],
  [169.5, 133, 1],
  [54, 166, 1],
  [87, 166, 4],
  [120, 166, 6],
  [153, 166, 4],
  [186, 166, 1],
];

// ---------- the module's MDX, rendered onto the export's lesson markup ----------
// Inside the window the lesson title is an h3 and each section title an h4
// (`.ls-sec h4`), as in the export, so the MDX headings move down two levels.
// The headings' hover permalinks and ids are dropped: they would point at the
// landing page, not the lesson.

type Kids = { children?: React.ReactNode };

function isAnchorLink(node: React.ReactNode): boolean {
  return (
    React.isValidElement(node) &&
    /\banchor\b/.test(
      String((node.props as { className?: string }).className || '')
    )
  );
}
const withoutAnchors = (children: React.ReactNode) =>
  React.Children.toArray(children).filter(c => !isAnchorLink(c));

const H2 = ({ children }: Kids) => <h4>{withoutAnchors(children)}</h4>;
const H3 = ({ children }: Kids) => <h5>{withoutAnchors(children)}</h5>;
const H4 = ({ children }: Kids) => <h6>{withoutAnchors(children)}</h6>;
const P = ({ children }: Kids) => <p>{children}</p>;
const Li = ({ children }: Kids) => <li>{children}</li>;
const A = ({
  href,
  className,
  children,
}: Kids & { href?: string; className?: string }) => {
  if (/\banchor\b/.test(className || '')) return null;
  const external = !!href && /^https?:/.test(href);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
};

/** The app's MDX components, with plain headings, paragraphs, list items and links. */
const LESSON_COMPONENTS = {
  ...mdxComponents,
  h1: H3,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  li: Li,
  a: A,
};

/** Top-level blocks before the first h2, then one group per h2. */
function splitSections(children: React.ReactNode): {
  intro: React.ReactNode[];
  secs: { head: React.ReactElement<Kids>; body: React.ReactNode[] }[];
} {
  const intro: React.ReactNode[] = [];
  const secs: { head: React.ReactElement<Kids>; body: React.ReactNode[] }[] =
    [];
  React.Children.toArray(children).forEach(c => {
    if (React.isValidElement(c) && c.type === H2) {
      secs.push({ head: c as React.ReactElement<Kids>, body: [] });
    } else if (secs.length) {
      secs[secs.length - 1].body.push(c);
    } else {
      intro.push(c);
    }
  });
  return { intro, secs };
}

/**
 * Markdown's `transform`: wraps each h2 and what follows it in the export's
 * `section.ls-sec[data-ls]`, which the contents rail and its scroll-spy use.
 */
function toSections(children: React.ReactNode): React.ReactNode {
  const { intro, secs } = splitSections(children);
  return (
    <>
      {intro.length ? <div className="ls-intro">{intro}</div> : null}
      {secs.map((s, i) => (
        <section key={i} className="ls-sec" data-ls={String(i)}>
          {s.head}
          {s.body}
        </section>
      ))}
    </>
  );
}

const childrenOf = (node: React.ReactNode): React.ReactNode =>
  React.isValidElement(node)
    ? (node as React.ReactElement<Kids>).props.children
    : node;

/** The chapter of the curriculum the module sits in ("Coordinate Geometry"). */
function chapterOf(
  id: string,
  division: string | null | undefined
): string | null {
  const chapters = division ? MODULE_ORDERING[division as SectionID] : null;
  const ch = chapters?.find(c => c.items.includes(id));
  return ch ? ch.name : null;
}

/**
 * "Read a lesson right here": a real module from the Guide, framed as a page
 * that scrolls inside its own window, with the export's contents rail.
 */
function SampleLesson({
  lesson,
  lsec,
  jumpTo,
}: {
  lesson: SampleLessonData;
  lsec: number;
  jumpTo: (i: number) => void;
}): JSX.Element {
  const { id, title, description, difficulty } = lesson.frontmatter;
  const division = lesson.fields?.division ?? null;
  const moduleUrl =
    moduleIDToURLMap[id] || (division ? `/${division}` : '/foundations');
  const chips = [
    chapterOf(id, division),
    difficulty || UG_TRACKS.find(t => t.id === division)?.exam || null,
  ].filter(Boolean) as string[];

  const content = React.useMemo(
    () => evaluateMdx(lesson.body, LESSON_COMPONENTS),
    [lesson.body]
  );
  // the rail lists the same h2s the sections are cut at, so index i is data-ls i
  const rail = React.useMemo(
    () =>
      splitSections(childrenOf(content)).secs.map(s =>
        withoutAnchors(s.head.props.children)
      ),
    [content]
  );

  return (
    <section className="sec sample" id="sample" aria-labelledby="ug-sample-h">
      <div className="sample-geo" aria-hidden="true">
        <span className="sg-ring" />
        <span className="sg-ring sg-ring2" />
      </div>
      <div className="dz dz-pascal" aria-hidden="true">
        <div className="dd-in rv" style={css({ '--d': '200ms' })}>
          <svg className="dd-svg" viewBox="0 0 250 236">
            {PASCAL.map(([x, y, v], i) => (
              <text key={i} className="dd-t" x={x} y={y}>
                {v}
              </text>
            ))}
            <path className="ink ink-v dr" pathLength={1} d={PASCAL_ARROW} />
            <path
              className="ink ink-v dr dr2"
              pathLength={1}
              d="M196 206C178 206 160 196 146 178M146 178L155.8 183M146 178L147.3 188.9"
            />
            <text className="dd-n" x="205" y="226">
              C(4, 2)
            </text>
          </svg>
        </div>
      </div>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="h2 rv" id="ug-sample-h" style={css({ '--d': '60ms' })}>
            Read a lesson right here.
          </h2>
          <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
            This one finds the area of any polygon straight from the coordinates
            of its corners, no cutting it into triangles. Scroll inside the
            window to read it, then work through the examples at the end.
          </p>
        </div>
        <div className="lf-wrap rv" style={css({ '--d': '160ms' })}>
          <img
            className="lf-fox"
            src="/ug/img/panda-read.webp"
            alt=""
            width="450"
            height="464"
          />
          <span className="lf-note" aria-hidden="true">
            it scrolls, try it
            <svg className="arw" viewBox="0 0 60 70">
              <path className="ink ink-v" d="M10 6C30 8 44 24 40 58" />
              <path
                className="ink ink-v"
                d="M40 58L34.6 47.3M40 58L47.2 48.4"
              />
            </svg>
          </span>
          <div className="lesson-frame">
            <div className="lf-bar">
              <span className="lf-url">
                <IcoLock />
                usamoguide.com
              </span>
              <span className="lf-tag">Sample lesson</span>
              <Link
                className="lf-open"
                to={moduleUrl}
                aria-label="Open this lesson in the Guide"
              >
                <span>Open in the Guide</span>
                <IcoOut />
              </Link>
            </div>
            <div className="lf-body">
              <div className="ls-rail">
                <p className="ls-rail-k">In this lesson</p>
                {rail.map((label, i) => (
                  <button
                    key={i}
                    className={cx('ls-item', onIf(i, lsec))}
                    type="button"
                    onClick={() => jumpTo(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                className="lesson-scroll"
                tabIndex={0}
                role="region"
                aria-label={`Sample lesson: ${title}`}
              >
                <article className="lesson">
                  {chips.length ? (
                    <div className="ls-chips">
                      {chips.map(c => (
                        <span key={c} className="ls-chip">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <h3 className="ls-title">{title}</h3>
                  {description ? <p className="ls-sub">{description}</p> : null}
                  <Markdown
                    content={content}
                    transform={toSections}
                    className="ls-md"
                  />
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// the page re-renders on every ladder/scene step; the lesson only needs to when its rail moves
export default React.memo(SampleLesson);
