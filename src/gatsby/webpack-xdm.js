/*eslint-disable */

const gfm = require('remark-gfm');
const remarkMath = require('remark-math');
const remarkExternalLinks = require('remark-external-links');
const remarkFrontmatter = require('remark-frontmatter');
const { remarkMdxFrontmatter } = require('remark-mdx-frontmatter');
const customRehypeKatex = require('../mdx-plugins/rehype-math');
const rehypeSnippets = require('../mdx-plugins/rehype-snippets');
const remarkSlug = require('remark-slug');
const remarkAutolinkHeadings = require('remark-autolink-headings');
const { getOptions } = require('loader-utils');
const { compile } = require('xdm');
const preprocessAsyBlocks = require('../mdx-plugins/preprocess-asy');

module.exports = function (code) {
  const callback = this.async();
  compile(
      {
        contents: preprocessAsyBlocks(
          code.replace(/<!--/g, '{/* ').replace(/-->/g, '*/}')
        ),
        path: this.resourcePath,
      },
      {
        remarkPlugins: [
          gfm,
          [remarkMath, { singleDollarTextMath: true }],
          remarkExternalLinks,
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
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
        ],
        rehypePlugins: [customRehypeKatex, rehypeSnippets],
        jsxRuntime: 'classic',
        ...getOptions(this),
      }
    )
    .then(file => {
      callback(null, file.contents, file.map);
      return file;
    }, callback);
};
