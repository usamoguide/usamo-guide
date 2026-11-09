import * as React from 'react';
import { wrapRootElement as wrap } from './root-wrapper';

export const wrapRootElement = wrap;

// https://joshwcomeau.com/gatsby/dark-mode/
const MagicScriptTag = () => {
  // Light is the default. A saved dark theme (see src/context/DarkModeProvider.tsx)
  // is applied before first paint so the page doesn't flash light: `ug-dark` for
  // the redesign tokens, `dark` for Tailwind's dark: variants.
  const codeToRunOnClient = `
  (function(){
    try {
      var t = JSON.parse(localStorage.getItem('guide:userData:theme'));
      if (t === 'dark') {
        document.documentElement.classList.add('dark', 'ug-dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    } catch (e) {}
  })()
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
};

// The redesign's type: Bricolage Grotesque (display), Instrument Sans (text),
// Instrument Serif (math italics), Shadows Into Light (handwritten notes),
// Noto Sans Bengali (the landing page's languages strip).
const UG_FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Instrument+Sans:wdth,wght@75..100,400..700&family=Instrument+Serif:ital@1&family=Noto+Sans+Bengali:wght@500&family=Shadows+Into+Light&display=swap';

export const onRenderBody = ({ setPreBodyComponents, setHeadComponents }) => {
  setHeadComponents([
    <link key="ug-gf-pre" rel="preconnect" href="https://fonts.googleapis.com" />,
    <link
      key="ug-gf-pre2"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link key="ug-gf" rel="stylesheet" href={UG_FONTS} />,
  ]);
  setPreBodyComponents(<MagicScriptTag key="magic-script-tag" />);
};

// Gatsby inlines the entire global CSS bundle (~400KB) into the <head> of
// every generated HTML page, which multiplies across thousands of problem
// pages into gigabytes of build output. Swap the inlined <style data-href>
// back to a <link> so the stylesheet is fetched once and cached.
export const onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  if (process.env.NODE_ENV !== 'production') return;
  const headComponents = getHeadComponents().map((component: any) => {
    if (
      component?.type === 'style' &&
      component.props?.['data-href'] &&
      component.props?.['data-identity'] === 'gatsby-global-css'
    ) {
      return (
        <link
          key={component.props['data-href']}
          rel="stylesheet"
          href={component.props['data-href']}
        />
      );
    }
    return component;
  });
  replaceHeadComponents(headComponents);
};
