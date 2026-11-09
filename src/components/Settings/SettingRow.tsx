import * as React from 'react';

/**
 * One switch in a settings list: the export's `.set-row` with its `.sw`
 * (the rows in the nav's gear menu), as a real switch.
 */
export default function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      className="set-row ap-setrow"
      onClick={() => onChange(!checked)}
    >
      <span className="set-t">
        {title}
        {description ? <small>{description}</small> : null}
      </span>
      <span className="sw" aria-hidden="true" />
    </button>
  );
}

/** The heading over a group of settings. */
export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <section className="ap-set">
      <div className="ap-set-h">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
