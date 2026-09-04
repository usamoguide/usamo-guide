import classNames from 'classnames';
import * as React from 'react';

export default function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  labelMap,
  disabled,
}: {
  options: T[];
  value: T | null;
  onChange: (newValue: T) => void;
  labelMap?: { [key in T]: string };
  disabled?: boolean;
}): JSX.Element {
  const leftButtonClasses = 'rounded-l-md';
  const middleButtonClasses = '-ml-px';
  const rightButtonClasses = '-ml-px rounded-r-md';
  const baseClasses =
    'relative inline-flex items-center px-4 py-2 border text-sm leading-5 font-medium focus:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] focus:border-[var(--focus)] dark:focus:border-[var(--focus)] focus:shadow-outline-blue transition ease-in-out duration-150';
  const activeClasses = 'border-[var(--focus)] bg-[var(--accent-fill)] text-[var(--accent-fill-text)]';
  const inactiveClasses =
    'border-[var(--border)] dark:border-[var(--border)] bg-white dark:bg-[var(--bg-surface-alt)] text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-primary)] active:bg-[var(--bg-surface-alt)] active:text-[var(--text-muted)]';

  return (
    <span className="relative z-0 inline-flex rounded-md">
      {options.map((option, index) => (
        <button
          type="button"
          className={classNames(baseClasses, {
            [leftButtonClasses]: index === 0,
            [middleButtonClasses]: index !== 0 && index !== options.length - 1,
            [rightButtonClasses]: index === options.length - 1,
            [activeClasses]: option === value,
            [inactiveClasses]: option !== value,
          })}
          disabled={disabled}
          onClick={() => onChange(option)}
          key={option}
        >
          {labelMap ? labelMap[option] : option}
        </button>
      ))}
    </span>
  );
}
