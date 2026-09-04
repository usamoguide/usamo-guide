import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import React from 'react';

export default function RadioList({
  name,
  options,
  value,
  onChange,
  labelMap,
  descriptionMap,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (string) => void;
  labelMap: { [key: string]: string };
  descriptionMap: { [key: string]: string };
}) {
  return (
    <RadioGroup value={value} onChange={onChange}>
      <div className="-space-y-px rounded-md bg-[var(--bg-surface)]">
        {options.map((option, idx) => (
          <RadioGroup.Option
            key={option}
            value={option}
            className={({ checked }) =>
              classNames(
                'relative flex cursor-pointer border p-4 focus:outline-hidden',
                idx === 0 && 'rounded-tl-md rounded-tr-md',
                idx === options.length - 1 && 'rounded-br-md rounded-bl-md',
                checked
                  ? 'z-10 border-[var(--border)] bg-[rgba(112,66,138,0.25)]'
                  : 'border-[var(--border)]'
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className={classNames(
                    checked
                      ? 'border-transparent bg-[var(--accent-fill)]'
                      : 'border-[var(--border)] bg-[var(--bg-surface)]',
                    active
                      ? 'ring-2 ring-[var(--accent-fill)] ring-offset-2 ring-offset-[var(--bg-page)]'
                      : '',
                    'mt-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border'
                  )}
                  aria-hidden="true"
                >
                  {checked && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <div className="ml-3 flex flex-col">
                  {/* On: "text-blue-900", Off: "text-gray-900" */}
                  <RadioGroup.Label
                    as="span"
                    className={classNames(
                      'block text-sm font-medium',
                      checked ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                    )}
                  >
                    {labelMap[option]}
                  </RadioGroup.Label>
                  {descriptionMap[option] && (
                    <RadioGroup.Description
                      as="span"
                      className={classNames(
                        'block text-sm',
                        checked
                          ? 'text-[var(--border-strong)]'
                          : 'text-[var(--text-muted)]'
                      )}
                    >
                      {descriptionMap[option]}
                    </RadioGroup.Description>
                  )}
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
