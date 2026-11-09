import { createContentDigest } from 'gatsby-core-utils';
import graymatter from 'gray-matter';
import path from 'path';
import rehypeRaw from 'rehype-raw';
import remarkAutolinkHeadings from 'remark-autolink-headings';
import remarkExternalLinks from 'remark-external-links';
import remarkFrontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { remarkMdxFrontmatter } from 'remark-mdx-frontmatter';
import remarkSlug from 'remark-slug';
import remarkExtractAST from '../mdx-plugins/extract-mdast';
import customRehypeKatex from '../mdx-plugins/rehype-math';
import rehypeSnippets from '../mdx-plugins/rehype-snippets';
import remarkToC from '../mdx-plugins/remark-toc';
import preprocessAsyBlocks from '../mdx-plugins/preprocess-asy';
import getGatsbyImage from './wrapped-gatsby-img-plugin';
import { compile } from 'xdm';

// todo: migrate to resolver for even better development performance

/**
 * Rough reading time for a lesson, in minutes: prose words (no frontmatter,
 * imports, code blocks or JSX tags) at 130 words a minute, which allows for
 * worked math being slower to read than plain text. Shown on the track, start
 * and module pages. Exposed as `Xdm.readingMinutes` by a resolver in
 * gatsby-node.ts (a resolver, not a node field, so cached nodes get it too).
 */
export function estimateReadingMinutes(content: string): number {
  const prose = content
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/^(import|export) .*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ');
  const words = (prose.match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(3, Math.round(words / 130));
}

export async function createXdmNode({ id, node, content }, api) {
  let xdmNode: any = {
    id,
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: `Xdm`,
    },
  };

  let compiledResult;
  const tableOfContents = {};
  const mdast = { data: null };

  const gatsbyImage = getGatsbyImage({
    ...api,
    xdmNode,
  });

  try {
    compiledResult = await compile(
      preprocessAsyBlocks(
        content.replace(/<!--/g, '{/* ').replace(/-->/g, '*/}')
      ),
      {
        remarkPlugins: [
          gfm,
          [remarkMath, { singleDollarTextMath: true }],
          remarkFrontmatter,
          remarkMdxFrontmatter,
          [remarkExtractAST, { mdast }],
          remarkExternalLinks,
          [remarkToC, { tableOfContents }],
          remarkSlug,
          [
            remarkAutolinkHeadings,
            {
              linkProperties: {
                ariaHidden: 'true',
                tabIndex: -1,
                className: 'anchor before',
              },
              content: {
                type: 'mdxJsxFlowElement',
                name: 'HeaderLink',
              },
            },
          ],
          gatsbyImage,
        ],
        rehypePlugins: [
          [
            rehypeRaw,
            {
              passThrough: [
                'mdxjsEsm',
                'mdxFlowExpression',
                'mdxTextExpression',
                'mdxJsxFlowElement',
                'mdxJsxTextElement',
              ],
            },
          ],
          customRehypeKatex,
          rehypeSnippets,
        ],
        outputFormat: 'function-body',
      }
    );
    compiledResult = String(compiledResult);
  } catch (e) {
    // add the path of the file to simplify debugging error messages
    e.message += `${node.absolutePath}: ${e.message}`;
    throw e;
  }

  // // extract all the exports
  // const { frontmatter, ...nodeExports } = extractExports(
  //   code,
  //   node.absolutePath
  // )

  const { data: frontmatter } = graymatter(content);
  const fileBaseName = node.absolutePath
    ? path.parse(node.absolutePath).name
    : node.name || 'untitled';
  const normalizeId = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const normalizedFileId = normalizeId(fileBaseName) || 'untitled';

  // Keep schema constraints satisfied even for scratch MDX files.
  if (!frontmatter.title || typeof frontmatter.title !== 'string') {
    frontmatter.title = fileBaseName;
  }
  if (!frontmatter.id || typeof frontmatter.id !== 'string') {
    frontmatter.id = normalizedFileId;
  }

  xdmNode = {
    ...xdmNode,
    body: compiledResult,
    frontmatter,
    isIncomplete: content.indexOf('<IncompleteSection') !== -1,
    toc: tableOfContents,
    mdast: mdast.data,
  };

  // xdmNode.exports = nodeExports

  // Add path to the markdown file path
  if (node.internal.type === `File`) {
    xdmNode.fileAbsolutePath = node.absolutePath;
  }

  xdmNode.internal.contentDigest = createContentDigest(xdmNode);

  return xdmNode;
}
