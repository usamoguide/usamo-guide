import * as React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { figureUrl } from '../../utils/problemFigures';
import Asterisk from '../Tooltip/Asterisk';
import TextTooltip from '../Tooltip/TextTooltip';
import CodeBlock from './CodeBlock/CodeBlock';
import FigureBox from './FigureBox';
import FocusProblem from './FocusProblem';
import HTMLComponents from './HTMLComponents';
import { IncompleteSection } from './IncompleteSection';
import Info from './Info';
import {
  CPPOnly,
  CPPSection,
  JavaOnly,
  JavaSection,
  LanguageSection,
  PyOnly,
  PySection,
} from './LanguageSection';
import Optional from './Optional';
import PrefixSumInteractive from './PrefixSumInteractive';
import { DivisionList } from './ProblemsList/DivisionList/DivisionList';
import { ProblemsList } from './ProblemsList/ProblemsList';
import Quiz from './Quiz';
import { Resource, ResourcesList } from './ResourcesList';
import Spoiler from './Spoiler';
import Warning from './Warning';
import YouTube from './YouTube';

const MATHDIV = props => {
  return (
    <div
      className={props.className}
      data-latex={`$$${props.latex}$$`}
      dangerouslySetInnerHTML={{ __html: props.children }}
    />
  );
};
const MATHSPAN = props => {
  return (
    <span
      className={props.className}
      data-latex={`$${props.latex}$`}
      dangerouslySetInnerHTML={{ __html: props.children }}
    />
  );
};

/**
 * Renders an [asy]...[/asy] block from module MDX.
 *
 * The SVG is compiled offline by scripts/compile-figures.mjs and committed
 * under static/generated/figures/, so the URL is derived from a content hash
 * of the source with no manifest lookup (see src/utils/problemFigures.js).
 * When the image is missing — a figure authored but not yet compiled, or the
 * live editor preview — we fall back to showing the source, which is more
 * useful than a broken-image icon. Compiled figures draw in dark ink on a
 * transparent background, hence the white backing card in dark mode.
 */
const AsyDiagram = ({ code }: { code?: string }) => {
  const isDarkMode = useDarkMode();
  const [failed, setFailed] = React.useState(false);
  const source = (code ?? '').trim();

  if (!source) return null;

  if (!failed) {
    return (
      <img
        src={figureUrl('asy', source)}
        alt="Asymptote diagram"
        onError={() => setFailed(true)}
        className="mx-auto my-6 max-w-full rounded-md dark:bg-white dark:p-2"
      />
    );
  }

  return (
    <div className="my-6 rounded-md bg-gray-50 dark:bg-gray-900/40">
      <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300">
        Asymptote diagram source — not compiled yet (run{' '}
        <code>yarn compile:figures</code>)
      </div>
      <div className="p-4">
        <CodeBlock
          className="language-asy"
          copyButton={true}
          isDarkMode={isDarkMode}
        >
          {source}
        </CodeBlock>
      </div>
    </div>
  );
};

export const components = {
  Spoiler,
  Info,
  Warning,
  Optional,
  Problems: ProblemsList,
  FocusProblem,
  Resources: ResourcesList,
  DivisionList,
  Resource,
  TextTooltip,
  CPPOnly,
  JavaOnly,
  PyOnly,
  LanguageSection,
  CPPSection,
  JavaSection,
  PySection,
  IncompleteSection,
  Asterisk,
  YouTube,
  PrefixSumInteractive,
  Quiz,
  FigureBox,
  MATHDIV,
  MATHSPAN,
  AsyDiagram,

  ...HTMLComponents,
};
