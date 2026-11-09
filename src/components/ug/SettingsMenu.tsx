import * as React from 'react';
import { useUGPrefs } from './hooks';
import { IcoGear } from './icons';

/**
 * The gear: display settings. In the nav it hangs down; `up` opens it upwards
 * (the copy at the foot of the module sidebar).
 */
export default function SettingsMenu({
  up = false,
  className,
  summaryContent,
}: {
  up?: boolean;
  className?: string;
  /** replaces the round gear button, e.g. the sidebar's labelled row */
  summaryContent?: React.ReactNode;
}): JSX.Element {
  const p = useUGPrefs();
  return (
    <details
      className={['set', up ? 'up' : '', className || ''].filter(Boolean).join(' ')}
      data-dismiss=""
    >
      {summaryContent ?? (
        <summary className="set-btn" aria-label="Settings">
          <IcoGear />
        </summary>
      )}
      <div className="set-pop" role="group" aria-label="Settings">
        <p className="set-k">Settings</p>
        <SetRow
          on={p.tags}
          onClick={p.flipTags}
          title="Show problem tags"
          hint="Tags can give away the method"
        />
        <SetRow
          on={p.diff}
          onClick={p.flipDiff}
          title="Show difficulty"
          hint="Hide it to go in without expectations"
        />
        <SetRow
          on={p.ign}
          onClick={p.flipIgn}
          title="Show ignored problems"
          hint="Problems you marked Ignored"
        />
      </div>
    </details>
  );
}

function SetRow({
  on,
  onClick,
  title,
  hint,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      className="set-row"
      type="button"
      role="switch"
      aria-checked={on ? 'true' : 'false'}
      onClick={onClick}
    >
      <span className="set-t">
        {title}
        <small>{hint}</small>
      </span>
      <span className="sw" aria-hidden="true" />
    </button>
  );
}
