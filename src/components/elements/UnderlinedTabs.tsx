import * as React from 'react';

export default function UnderlinedTabs({
  options,
  labelMap,
  value,
  onChange,
}: {
  options: string[];
  labelMap?: { [key: string]: string };
  value: string;
  onChange: (newValue: string) => void;
}) {
  return (
    <>
      <div className="sm:hidden">
        <label htmlFor="selected-tab" className="sr-only">
          Select a tab
        </label>
        <select
          id="selected-tab"
          name="selected-tab"
          className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--bg-surface)] py-2 pr-10 pl-3 text-base text-[var(--text-primary)] focus:border-[var(--accent-fill)] focus:ring-[var(--accent-fill)] focus:outline-hidden sm:text-sm"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(option => (
            <option value={option} key={option}>
              {labelMap ? labelMap[option] : option}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-[var(--border)]">
          <nav className="-mb-px flex space-x-8">
            {options.map(option => (
              <button
                key={option}
                onClick={() => onChange(option)}
                className={
                  (value === option
                    ? 'border-[var(--accent-fill)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]') +
                  ' border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap focus:outline-hidden'
                }
              >
                {labelMap ? labelMap[option] : option}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
