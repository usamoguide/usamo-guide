import * as React from 'react';
// eslint-disable-next-line
// @ts-ignore
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import NotSignedInWarning from '../MarkdownLayout/NotSignedInWarning';
import { components } from './MDXComponents';

const Markdown = (props: { body: string }) => {
  const mdxComponent = new Function(props.body)({
    Fragment,
    jsx,
    jsxs,
  }).default({ components });

  // The sign-in prompt sits at the top of the module, not spliced into the
  // middle of the reading flow. Interrupting someone mid-derivation to ask them
  // to sign in is the worst possible moment; at the top it is a header they can
  // take or ignore before they start.
  return (
    <div className="markdown">
      <NotSignedInWarning />
      {mdxComponent}
    </div>
  );
};

export default React.memo(Markdown);
