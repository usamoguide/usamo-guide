import * as React from 'react';
// eslint-disable-next-line
// @ts-ignore
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import NotSignedInWarning from '../MarkdownLayout/NotSignedInWarning';
import { components } from './MDXComponents';

const SIGN_IN_PROMPT_INSERTION_RATIO = 0.4;

function getTextLength(node: React.ReactNode): number {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return 0;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node).trim().length;
  }

  if (Array.isArray(node)) {
    return node.reduce((sum, child) => sum + getTextLength(child), 0);
  }

  if (React.isValidElement(node)) {
    return getTextLength(node.props.children);
  }

  return 0;
}

function isH1Element(node: React.ReactNode): boolean {
  return React.isValidElement(node) && node.type === components.h1;
}

function getTextTargetInsertionIndex(
  childTextLengths: number[],
  totalTextLength: number
): number {
  const targetTextLength = totalTextLength * SIGN_IN_PROMPT_INSERTION_RATIO;
  let runningLength = 0;

  for (let index = 0; index < childTextLengths.length; index += 1) {
    runningLength += childTextLengths[index];
    if (runningLength >= targetTextLength) {
      return index + 1;
    }
  }

  return childTextLengths.length;
}

function getNearestH1SectionEndIndex(
  childList: React.ReactNode[],
  childTextLengths: number[],
  totalTextLength: number
): number | null {
  const h1Indexes = childList.reduce<number[]>((indexes, child, index) => {
    if (isH1Element(child)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  if (h1Indexes.length === 0) {
    return null;
  }

  const cumulativeTextLengths = childTextLengths.reduce<number[]>(
    (lengths, childTextLength) => {
      lengths.push((lengths[lengths.length - 1] ?? 0) + childTextLength);
      return lengths;
    },
    []
  );
  const targetTextLength = totalTextLength * SIGN_IN_PROMPT_INSERTION_RATIO;

  return h1Indexes.reduce((nearestEndIndex, h1Index, sectionIndex) => {
    const nextH1Index = h1Indexes[sectionIndex + 1];
    const sectionEndIndex = nextH1Index ?? childList.length;
    const sectionEndTextLength =
      cumulativeTextLengths[sectionEndIndex - 1] ?? 0;
    const nearestEndTextLength =
      cumulativeTextLengths[nearestEndIndex - 1] ?? 0;

    return Math.abs(sectionEndTextLength - targetTextLength) <
      Math.abs(nearestEndTextLength - targetTextLength)
      ? sectionEndIndex
      : nearestEndIndex;
  }, h1Indexes[0]);
}

function insertPromptIntoChildren(children: React.ReactNode): React.ReactNode {
  const childList = React.Children.toArray(children);

  if (childList.length === 0) {
    return children;
  }

  const childTextLengths = childList.map(child => getTextLength(child));
  const totalTextLength = childTextLengths.reduce(
    (sum, value) => sum + value,
    0
  );

  const insertionIndex = (() => {
    if (totalTextLength <= 0) {
      return Math.max(1, Math.floor(childList.length / 2));
    }

    return (
      getNearestH1SectionEndIndex(
        childList,
        childTextLengths,
        totalTextLength
      ) ?? getTextTargetInsertionIndex(childTextLengths, totalTextLength)
    );
  })();

  // Warning is now rendered at the top of the page (see return below).
  // Keeping insertPromptIntoChildren intact for future use.
  const prompt = null; // <NotSignedInWarning key="not-signed-in-warning" />;

  return [
    ...childList.slice(0, insertionIndex),
    prompt,
    ...childList.slice(insertionIndex),
  ];
}

/** Run a compiled MDX body with a components map; returns the MDX element. */
export function evaluateMdx(
  body: string,
  componentMap: { [name: string]: unknown } = components
): React.ReactNode {
  return new Function(body)({
    Fragment,
    jsx,
    jsxs,
  }).default({ components: componentMap });
}

/**
 * Renders a module's compiled MDX.
 * - `body`: the compiled MDX (or pass an already evaluated `content`)
 * - `components`: the components map (defaults to MDXComponents)
 * - `transform`: rearranges the top-level blocks (the module page groups them
 *   into sections); without it the sign-in prompt goes at the top
 * - `className`: the wrapper's class (defaults to the legacy `markdown`)
 * - `after`: rendered inside the wrapper after the content
 */
const Markdown = (props: {
  body?: string;
  content?: React.ReactNode;
  components?: { [name: string]: unknown };
  transform?: (children: React.ReactNode) => React.ReactNode;
  className?: string;
  after?: React.ReactNode;
}) => {
  const mdxComponent =
    props.content !== undefined
      ? props.content
      : evaluateMdx(props.body ?? '', props.components ?? components);

  const mdxChildren = React.isValidElement(mdxComponent)
    ? (mdxComponent as React.ReactElement<{ children?: React.ReactNode }>).props
        .children
    : mdxComponent;

  // with a memoized `content`, the transformed tree keeps its identity across
  // re-renders, so React can skip the lesson when only the page around it changes
  const { transform } = props;
  const transformed = React.useMemo(
    () => (transform ? transform(mdxChildren) : null),
    [transform, mdxChildren]
  );

  if (transform) {
    return (
      <div className={props.className ?? 'markdown'}>
        {transformed}
        {props.after}
      </div>
    );
  }

  const renderedContent = React.isValidElement(mdxComponent)
    ? (() => {
        const mdxElement = mdxComponent as React.ReactElement<{
          children?: React.ReactNode;
        }>;

        return React.cloneElement(
          mdxElement,
          undefined,
          insertPromptIntoChildren(mdxElement.props.children)
        );
      })()
    : mdxComponent;

  return (
    <div className={props.className ?? 'markdown'}>
      <NotSignedInWarning key="not-signed-in-warning" />
      {renderedContent}
      {props.after}
    </div>
  );
};

export default React.memo(Markdown);
