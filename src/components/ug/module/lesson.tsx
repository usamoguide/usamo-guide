import { Link } from 'gatsby';
import * as React from 'react';
import { figureUrl } from '../../../utils/problemFigures';
import { components as baseComponents } from '../../markdown/MDXComponents';
import { ProblemsList } from '../../markdown/ProblemsList/ProblemsList';
import { SpoilerContext } from '../../markdown/Spoiler';
import NotSignedInWarning from '../../MarkdownLayout/NotSignedInWarning';
import { UG_LINKS } from '../links';
import PracticeTable from './PracticeTable';

/*
 * The lesson: the module's MDX rendered onto the export's lesson markup
 * (module.css). Headings, paragraphs and lists use the `.md-body` type;
 * a blockquote that opens with a heading becomes an example card (`.ex`),
 * one that opens with "Solution" becomes a reveal (`.reveal`), any other is a
 * rule callout (`.rule`). Spoilers are reveals, Info/Warning/Optional are
 * rule callouts, problem lists are the practice table (`.pp`).
 *
 * This map is only used on module pages. The editor preview keeps the plain
 * MDXComponents map.
 */

type El = React.ReactElement<any>;

function isEl(node: React.ReactNode, types: unknown[]): node is El {
  return React.isValidElement(node) && types.includes(node.type as unknown);
}

function isBlank(node: React.ReactNode): boolean {
  return (
    node === null ||
    node === undefined ||
    typeof node === 'boolean' ||
    (typeof node === 'string' && !node.trim())
  );
}

/** Plain text of a rendered MDX tree (math counts as its LaTeX source). */
export function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (node.type === MathDiv || node.type === baseComponents.MATHSPAN) {
      return ` ${props.latex ?? ''} `;
    }
    return textOf(props.children);
  }
  return '';
}

// ---------- headings ----------

const H2 = ({ id, children }: { id?: string; children?: React.ReactNode }) => (
  <h2 id={id}>{children}</h2>
);
const H3 = ({ id, children }: { id?: string; children?: React.ReactNode }) => (
  <h3 id={id} className="md-h3">
    {children}
  </h3>
);
const H4 = ({ id, children }: { id?: string; children?: React.ReactNode }) => (
  <h4 id={id} className="md-h4">
    {children}
  </h4>
);

/** Headings that open a section of the lesson. */
export const SECTION_HEADINGS: unknown[] = [H2];

// ---------- reveals ----------

function Reveal({
  show = 'Show solution',
  hide = 'Hide solution',
  open,
  id,
  children,
}: {
  show?: string;
  hide?: string;
  open?: boolean;
  /** a "### Solution" heading's id, so its old anchor still lands here */
  id?: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <details className="reveal" id={id} open={open || undefined}>
      <summary>
        <span className="a-show">{show}</span>
        <span className="a-hide">{hide}</span>
      </summary>
      <div className="ans">{children}</div>
    </details>
  );
}

const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

const LessonSpoiler = ({
  title,
  startExpanded = false,
  children,
}: {
  title?: string;
  startExpanded?: boolean;
  children?: React.ReactNode;
}): JSX.Element => {
  const arr = React.Children.toArray(children).filter(c => !isBlank(c));
  const only = arr.length === 1 ? (arr[0] as any) : null;
  const expandCodeBlock =
    !!only &&
    (only.type?.name === 'pre' || only.type?.name === 'LanguageSection');
  const t = (title || '').trim();
  return (
    <Reveal
      show={
        t ? (/^show\b/i.test(t) ? t : `Show ${lowerFirst(t)}`) : 'Show solution'
      }
      hide={
        t ? `Hide ${lowerFirst(t.replace(/^show\s+/i, ''))}` : 'Hide solution'
      }
      open={startExpanded}
    >
      <SpoilerContext.Provider value={{ expandCodeBlock }}>
        {children}
      </SpoilerContext.Provider>
    </Reveal>
  );
};

// ---------- blockquotes ----------

/** rehype-autolink-headings' hover permalink inside a heading */
function isAnchor(node: React.ReactNode): boolean {
  return (
    React.isValidElement(node) &&
    /\banchor\b/.test(String((node.props as any).className || ''))
  );
}

type QuoteKind =
  | {
      kind: 'ex';
      id?: string;
      label: React.ReactNode;
      question: React.ReactNode[];
      body: React.ReactNode[];
    }
  | { kind: 'solution'; id?: string; body: React.ReactNode[] }
  | { kind: 'rule'; body: React.ReactNode[] };

/**
 * If a paragraph opens with a bold lead ("**Solution:**", "**Problem 2:**")
 * that passes `test`, return the lead's text and the paragraph without it.
 */
function splitLead(
  p: El,
  test: (lead: string) => boolean
): { lead: string; rest: El } | null {
  const kids = React.Children.toArray(p.props.children);
  const first = kids[0];
  if (!isEl(first, ['strong', 'b'])) return null;
  const lead = textOf(first.props.children)
    .trim()
    .replace(/\s*[:.]$/, '');
  if (!lead || !test(lead)) return null;
  let rest = kids.slice(1);
  if (typeof rest[0] === 'string') {
    // "**Solution**: ..." puts the colon outside the bold
    const str = (rest[0] as string).replace(/^\s*[:.\u2014-]?\s*/, '');
    rest = str ? [str, ...rest.slice(1)] : rest.slice(1);
  }
  return { lead, rest: React.cloneElement(p, undefined, ...rest) };
}

const isSolutionLead = (t: string) => /^(solution|answer)s?$/i.test(t);
/** "Problem 2", "Example 1", "Exercise 3(a)", "Question" */
const isExampleLead = (t: string) =>
  t.length <= 32 &&
  /^(problem|example|exercise|question|practice problem)\b[\w\s.()#-]*$/i.test(
    t
  );

function hasText(el: El): boolean {
  return React.Children.toArray(el.props.children).some(c => !isBlank(c));
}

export function classifyQuote(children: React.ReactNode): QuoteKind {
  const kids = React.Children.toArray(children).filter(c => !isBlank(c));
  const first = kids[0];
  if (isEl(first, [H3, H4, 'h3', 'h4'])) {
    const text = textOf(first.props.children).trim();
    if (/^(solution|answer)s?\b/i.test(text) && text.length < 40) {
      return { kind: 'solution', id: first.props.id, body: kids.slice(1) };
    }
    // "Example 2: Solve the equation ..." -> label "Example 2", the rest is the question
    // (the heading's hover permalink is dropped: the card is the anchor target)
    const hk = React.Children.toArray(first.props.children).filter(
      c => !isAnchor(c)
    );
    let label: React.ReactNode = hk;
    let question: React.ReactNode[] = [];
    if (typeof hk[0] === 'string') {
      const m = /^([^:]{1,40}):\s*([\s\S]*)$/.exec(hk[0]);
      if (m) {
        label = m[1].trim();
        question = [m[2], ...hk.slice(1)].filter(c => !isBlank(c));
      }
    }
    return {
      kind: 'ex',
      id: first.props.id,
      label,
      question,
      body: kids.slice(1),
    };
  }
  if (isEl(first, [P, 'p'])) {
    const sol = splitLead(first, isSolutionLead);
    if (sol) {
      return {
        kind: 'solution',
        body: hasText(sol.rest) ? [sol.rest, ...kids.slice(1)] : kids.slice(1),
      };
    }
    const ex = splitLead(first, isExampleLead);
    if (ex) {
      return {
        kind: 'ex',
        label: ex.lead,
        question: hasText(ex.rest) ? [ex.rest] : [],
        body: kids.slice(1),
      };
    }
  }
  return { kind: 'rule', body: kids };
}

const Blockquote = ({
  children,
  after,
}: {
  children?: React.ReactNode;
  /** a reveal that followed this example in the source, drawn inside the card */
  after?: React.ReactNode;
}): JSX.Element => {
  const q = classifyQuote(children);
  if (q.kind === 'ex') {
    // a question that came as a paragraph keeps its own <p>; one split off a heading gets one
    const [q0, ...qRest] = q.question;
    const question = isEl(q0, [P, 'p'])
      ? [React.cloneElement(q0, { className: 'ex-q' }), ...qRest]
      : q.question.length
        ? [
            <p className="ex-q" key="ex-q">
              {q.question}
            </p>,
          ]
        : [];
    return (
      <div className="ex" id={q.id}>
        <h3 className="k-label">{q.label}</h3>
        {question}
        {q.body}
        {after}
      </div>
    );
  }
  if (q.kind === 'solution') {
    return <Reveal id={q.id}>{q.body}</Reveal>;
  }
  return <blockquote className="rule">{q.body}</blockquote>;
};

// ---------- callouts ----------

const Callout = ({
  cls,
  label,
  title,
  children,
}: {
  cls: string;
  label: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className={`rule ${cls}`}>
    <p className="k-label">
      {label}
      {title ? (
        <>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          {title}
        </>
      ) : null}
    </p>
    {children}
  </div>
);

const Info = ({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) =>
  title ? (
    <Callout cls="rule-info" label={title}>
      {children}
    </Callout>
  ) : (
    <Callout cls="rule-info" label="Note">
      {children}
    </Callout>
  );
const Warning = ({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => (
  <Callout cls="rule-warn" label="Warning" title={title}>
    {children}
  </Callout>
);
const Optional = ({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => (
  <Callout cls="rule-opt" label="Optional" title={title}>
    {children}
  </Callout>
);
const IncompleteSection = ({ children }: { children?: React.ReactNode }) => (
  <Callout cls="rule-inc" label="Work in progress">
    <p>
      This section isn&apos;t finished yet. Any help is welcome: open a pull
      request on{' '}
      <a
        className="md-a"
        href={UG_LINKS.github}
        target="_blank"
        rel="noreferrer"
      >
        GitHub
      </a>
      .
    </p>
    {children}
  </Callout>
);

// ---------- figures, math, tables, links ----------

const FigureBox = ({
  image,
  alt,
  title,
  children,
}: {
  image?: React.ReactNode | string;
  alt?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <figure className="md-fig">
    {image ? (
      <div className="md-fig-img">
        {typeof image === 'string' ? (
          <img src={image} alt={alt ?? ''} loading="lazy" />
        ) : (
          image
        )}
      </div>
    ) : null}
    {title || React.Children.toArray(children).some(c => !isBlank(c)) ? (
      <figcaption>
        {title ? <span className="k-label">{title}</span> : null}
        {children}
      </figcaption>
    ) : null}
  </figure>
);

const AsyDiagram = ({ code }: { code?: string }) => {
  const [failed, setFailed] = React.useState(false);
  const source = (code ?? '').trim();
  if (!source) return null;
  if (failed) return <baseComponents.AsyDiagram code={code} />;
  return (
    <figure className="md-fig md-asy">
      <div className="md-fig-img">
        <img
          src={figureUrl('asy', source)}
          alt="Asymptote diagram"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    </figure>
  );
};

function MathDiv(props: {
  className?: string;
  latex?: string;
  children?: string;
}) {
  return (
    <div
      className={['md-math', props.className || ''].filter(Boolean).join(' ')}
      data-latex={`$$${props.latex}$$`}
      dangerouslySetInnerHTML={{ __html: props.children ?? '' }}
    />
  );
}

const Table = (props: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="md-table">
    <table {...props} />
  </div>
);

const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    loading="lazy"
    {...props}
    className={['md-img', props.className || ''].filter(Boolean).join(' ')}
  />
);

const A = ({
  href,
  children,
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const cls = /\banchor\b/.test(className || '')
    ? className
    : ['md-a', className || ''].filter(Boolean).join(' ');
  if (href && href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link to={href} className={cls}>
        {children}
      </Link>
    );
  }
  const external = !!href && !href.startsWith('#');
  return (
    <a
      href={href}
      {...rest}
      className={cls}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
};

const InlineCode = (props: React.HTMLAttributes<HTMLElement>) => (
  <code {...props} className="md-code" />
);

const P = (props: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} />
);
const Li = (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />;

/** `<Problems problems="practice" />` is the practice table; anything else keeps the old list. */
const Problems = (props: any) =>
  typeof props.problems === 'string' ? (
    <PracticeTable problems={props.problems} />
  ) : (
    <ProblemsList {...props} />
  );

export const lessonComponents = {
  ...baseComponents,
  h1: H2,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  li: Li,
  a: A,
  code: InlineCode,
  img: Img,
  table: Table,
  blockquote: Blockquote,
  Spoiler: LessonSpoiler,
  Info,
  Warning,
  Optional,
  IncompleteSection,
  FigureBox,
  AsyDiagram,
  MATHDIV: MathDiv,
  Problems,
};

// ---------- sections ----------

/**
 * Group the lesson's top-level blocks into `<section>`s, one per h2 (or h1),
 * as the export does: the section carries the heading's id (so #anchors and
 * the contents still land on it) and the heading is renamed `h-<id>`.
 * An example card followed by a solution keeps the solution inside the card.
 * The sign-in prompt goes at the section break nearest 40% of the text.
 */
export function sectionize(children: React.ReactNode): React.ReactNode {
  const flat = React.Children.toArray(children);

  // pull a solution (blockquote or spoiler) into the example card before it
  const kids: React.ReactNode[] = [];
  for (let i = 0; i < flat.length; i++) {
    const k = flat[i];
    if (
      isEl(k, [Blockquote]) &&
      classifyQuote(k.props.children).kind === 'ex'
    ) {
      let j = i + 1;
      while (j < flat.length && isBlank(flat[j])) j++;
      const next = flat[j];
      const nextIsSolution =
        isEl(next, [LessonSpoiler]) ||
        (isEl(next, [Blockquote]) &&
          classifyQuote(next.props.children).kind === 'solution');
      if (nextIsSolution) {
        kids.push(React.cloneElement(k, { after: next }));
        i = j;
        continue;
      }
    }
    kids.push(k);
  }

  type Sec = { id: string | null; nodes: React.ReactNode[] };
  const secs: Sec[] = [];
  let cur: Sec = { id: null, nodes: [] };
  kids.forEach(k => {
    if (isEl(k, SECTION_HEADINGS)) {
      if (cur.nodes.some(n => !isBlank(n))) secs.push(cur);
      cur = { id: k.props.id ?? null, nodes: [] };
      cur.nodes.push(cur.id ? React.cloneElement(k, { id: `h-${cur.id}` }) : k);
    } else {
      cur.nodes.push(k);
    }
  });
  if (cur.nodes.some(n => !isBlank(n))) secs.push(cur);

  // The sign-in prompt sits at the top of the lesson (a product decision on
  // main; the export places it partway through).
  return [
    <NotSignedInWarning key="not-signed-in-warning" />,
    ...secs.map((s, i) =>
      s.id ? (
        <section key={`s-${s.id}`} id={s.id} aria-labelledby={`h-${s.id}`}>
          {s.nodes}
        </section>
      ) : (
        <section key={`s-intro-${i}`}>{s.nodes}</section>
      )
    ),
  ];
}

/** Rough reading time of the lesson, in minutes. */
export function readingMinutes(content: React.ReactNode): number {
  const words = textOf(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** The problem lists the lesson shows itself (`<Problems problems="..." />`, at any depth). */
export function referencedLists(content: React.ReactNode): Set<string> {
  const ids = new Set<string>();
  const walk = (node: React.ReactNode) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!React.isValidElement(node)) return;
    const props = node.props as any;
    if (node.type === Problems && typeof props.problems === 'string') {
      ids.add(props.problems);
    }
    if (props.children) walk(props.children);
  };
  walk(content);
  return ids;
}
