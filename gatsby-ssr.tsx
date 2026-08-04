import * as React from 'react';
import { wrapRootElement as wrap } from './root-wrapper';

export const wrapRootElement = wrap;

// https://joshwcomeau.com/gatsby/dark-mode/
const MagicScriptTag = () => {
  // Dark mode is forced globally (see src/context/DarkModeProvider.tsx), so apply
  // the class before first paint -- otherwise the light --bg-page shows for a
  // frame on browsers whose system preference is light.
  const codeToRunOnClient = `
  (function(){
    document.documentElement.classList.add('dark');
  })()
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};
export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents(<MagicScriptTag key="magic-script-tag" />);
};
