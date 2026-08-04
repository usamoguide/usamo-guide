import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import {
  FIGURES_URL_PREFIX,
  normalizeTexDelimiters,
  transformFigureBlocks,
} from '../../utils/problemFigures';

import 'katex/dist/katex.min.css';

/**
 * KaTeX config tuned for imported AoPS-style statements: don't be strict
 * about Unicode, and alias macros AoPS uses that KaTeX doesn't ship.
 */
const KATEX_OPTIONS = {
  strict: false,
  errorColor: '#ef4444',
  macros: {
    '\\overarc': '\\overgroup',
    '\\arc': '\\overgroup',
    '\\degree': '^{\\circ}',
    '\\dg': '^{\\circ}',
  },
};

/**
 * Figure/image renderer with a graceful fallback: imported problems can
 * reference figures that were never compiled or extracted (e.g. legacy
 * `attached_image_*.png` refs), and a broken-image icon reads badly.
 * Compiled Asymptote/LaTeX SVGs use dark strokes on a transparent
 * background, so they get a white backing card in dark mode.
 */
function FigureImage({
  src,
  alt,
}: {
  src?: string;
  alt?: string;
}): JSX.Element | null {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) {
    return (
      <span className="my-2 block rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        Figure unavailable
        {src?.startsWith(FIGURES_URL_PREFIX)
          ? ' — diagram not yet compiled (run yarn compile:figures)'
          : ' — see the original problem for the diagram'}
      </span>
    );
  }
  const isGeneratedFigure = src.startsWith(FIGURES_URL_PREFIX);
  return (
    <img
      src={src}
      alt={alt || 'figure'}
      onError={() => setFailed(true)}
      className={`mx-auto my-2 max-w-full ${
        isGeneratedFigure ? 'rounded-md dark:bg-white dark:p-2' : ''
      }`.trim()}
    />
  );
}

/**
 * Renders problem statement / solution snippets from JSON: Markdown + TeX
 * ($...$, $$...$$, \(...\), \[...\]) plus AoPS-style [asy]...[/asy] and
 * [latex]...[/latex] figure blocks (compiled to SVG by
 * scripts/compile-figures.mjs).
 */
export default function ProblemStatementMarkdown({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}): JSX.Element {
  const processed = React.useMemo(
    () => normalizeTexDelimiters(transformFigureBlocks(children ?? '')),
    [children]
  );
  if (!processed?.trim()) return <></>;
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`.trim()}>
      <ReactMarkdown
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- remark/unified version skew
        remarkPlugins={[remarkGfm, remarkMath] as any}
        rehypePlugins={[[rehypeKatex, KATEX_OPTIONS]]}
        components={{
          img: FigureImage,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
