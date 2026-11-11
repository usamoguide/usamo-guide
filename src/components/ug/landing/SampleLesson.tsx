import { Link } from 'gatsby';
import * as React from 'react';
import MODULE_ORDERING, {
  moduleIDToURLMap,
  SectionID,
} from '../../../../content/ordering';
import Markdown, { evaluateMdx } from '../../markdown/Markdown';
import { components as mdxComponents } from '../../markdown/MDXComponents';
import Btn from '../Btn';
import { UG_TRACKS } from '../links';
import { PASCAL_ARROW } from './paths';
import { css, cx, IcoOut, onIf } from './util';

/** The module the landing page opens (the page query fetches it). */
export const SAMPLE_MODULE_ID = 'shoelace-theorem-p1';

/** How many of its sections the landing page shows before "Keep reading". */
const SHOWN = 2;

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

type Sec = {
  head: React.ReactElement<Kids>;
  /** the heading's slug, which is also the section's id on the lesson page */
  id: string | null;
  body: React.ReactNode[];
};

/** Top-level blocks before the first h2, then one group per h2. */
function splitSections(children: React.ReactNode): {
  intro: React.ReactNode[];
  secs: Sec[];
} {
  const intro: React.ReactNode[] = [];
  const secs: Sec[] = [];
  React.Children.toArray(children).forEach(c => {
    if (React.isValidElement(c) && c.type === H2) {
      const head = c as React.ReactElement<Kids & { id?: string }>;
      secs.push({ head, id: head.props.id ?? null, body: [] });
    } else if (secs.length) {
      secs[secs.length - 1].body.push(c);
    } else {
      intro.push(c);
    }
  });
  return { intro, secs };
}

/**
 * Markdown's `transform`: the intro and the first SHOWN sections, each h2 and
 * what follows it in a `section.ls-sec[data-ls]` that the contents list
 * follows as the page scrolls.
 */
function toExcerpt(children: React.ReactNode): React.ReactNode {
  const { intro, secs } = splitSections(children);
  return (
    <>
      {intro.length ? <div className="ls-intro">{intro}</div> : null}
      {secs.slice(0, SHOWN).map((s, i) => (
        <section
          key={i}
          id={`sl-${i}`}
          className="ls-sec"
          data-ls={String(i)}
        >
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
 * "Read a lesson right here": the opening of a real module from the Guide, as
 * part of the page (no window of its own to scroll), with the export's
 * contents list beside it. Its later sections link to the full lesson.
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
  // the contents list uses the same h2s the sections are cut at, so index i is data-ls i
  const outline = React.useMemo(
    () =>
      splitSections(childrenOf(content)).secs.map(s => ({
        label: withoutAnchors(s.head.props.children),
        id: s.id,
      })),
    [content]
  );
  const more = outline.length - SHOWN;

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
            of its corners, no cutting it into triangles. Start reading below,
            then keep going in the full lesson for the worked examples.
          </p>
        </div>
        <div className="sl rv" style={css({ '--d': '160ms' })}>
          <nav className="ls-rail sl-rail" aria-label="In this lesson">
            <p className="ls-rail-k">In this lesson</p>
            {outline.map((s, i) =>
              i < SHOWN ? (
                <a
                  key={i}
                  className={cx('ls-item', onIf(i, lsec))}
                  href={`#sl-${i}`}
                  aria-current={i === lsec ? 'location' : undefined}
                  onClick={e => {
                    e.preventDefault();
                    jumpTo(i);
                  }}
                >
                  {s.label}
                </a>
              ) : (
                <Link
                  key={i}
                  className="ls-item sl-out"
                  to={s.id ? `${moduleUrl}#${s.id}` : moduleUrl}
                >
                  <span>{s.label}</span>
                  <IcoOut />
                </Link>
              )
            )}
          </nav>
          <div className="sl-card">
            <img
              className="lf-fox"
              src="/ug/img/panda-read.webp"
              alt=""
              width="450"
              height="464"
            />
            <article className="lesson" aria-labelledby="ug-sample-t">
              {chips.length ? (
                <div className="ls-chips">
                  {chips.map(c => (
                    <span key={c} className="ls-chip">
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
              <h3 className="ls-title" id="ug-sample-t">
                {title}
              </h3>
              {description ? <p className="ls-sub">{description}</p> : null}
              <Markdown
                content={content}
                transform={toExcerpt}
                className="ls-md"
              />
            </article>
            <div className="sl-more">
              {more > 0 ? (
                <p className="sl-more-t">
                  {more} more {more === 1 ? 'section' : 'sections'} in the full
                  lesson, worked examples included.
                </p>
              ) : null}
              <Btn kind="p" to={moduleUrl} arrow>
                Keep reading
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// the page re-renders on every ladder/scene step; the lesson only needs to when its contents list moves
export default React.memo(SampleLesson);
