import 'katex/dist/katex.min.css';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const Inline = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

/**
 * A module description from the frontmatter. Most are plain text; a few carry
 * inline math (`$e^{i\theta}$`) or Markdown, which render inline here. It sits
 * inside a link, so nested links render as plain text.
 */
export default function ModuleDesc({ text }: { text: string }): JSX.Element {
  if (!/[$*_`[\\]/.test(text)) return <>{text}</>;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath] as any}
      rehypePlugins={[rehypeKatex] as any}
      components={{ p: Inline, a: Inline } as any}
    >
      {text}
    </ReactMarkdown>
  );
}
