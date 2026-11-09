import React from 'react';
import TextTooltip from '../../Tooltip/TextTooltip';

export interface LeaderboardTableProps {
  columns?: {
    id: string;
    tooltip: string;
  }[];
  rows?: {
    id: string;
    name: string;
    points: number;
    items: {
      id: string;
      value: string;
      payload?: unknown;
    }[];
  }[];
  onCellClick?: (personIndex: number, payload: unknown) => void;
}

export const LeaderboardTable = (
  props: LeaderboardTableProps
): JSX.Element | null => {
  const problemCellStyles =
    'w-16 text-center border-l border-gray-200 dark:border-[var(--border)] px-3';

  if (!props.rows || !props.columns) return null;

  return (
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-transparent">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border)]">
            <thead className="bg-gray-50 dark:bg-[var(--bg-surface-alt)]">
              <tr>
                <th
                  scope="col"
                  className="w-16 border-r border-gray-200 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:border-[var(--border)] dark:text-[var(--text-secondary)]"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-[var(--text-secondary)]"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-[var(--text-secondary)]"
                >
                  Points
                </th>
                {/*<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wider">*/}
                {/*  Last Submission Time*/}
                {/*</th>*/}
                {props.columns.map(({ id, tooltip }, index) => (
                  <th
                    scope="col"
                    className={
                      problemCellStyles +
                      ' py-3 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-[var(--text-secondary)]'
                    }
                    key={id}
                  >
                    <TextTooltip content={tooltip}>P{index}</TextTooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.map((person, idx) => (
                <tr
                  className={
                    idx % 2 === 0
                      ? 'bg-white dark:bg-[var(--bg-surface)]'
                      : 'bg-gray-50 dark:bg-[var(--bg-surface-alt)]'
                  }
                  key={person.id}
                >
                  <td className="w-16 border-r border-gray-200 py-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 dark:border-[var(--border)] dark:text-[var(--text-primary)]">
                    {idx + 1}
                  </td>
                  <td className="max-w-[10rem] overflow-hidden px-6 py-4 text-sm font-medium text-ellipsis whitespace-nowrap text-gray-900 dark:text-[var(--text-primary)]">
                    {person.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-[var(--text-primary)]">
                    {Math.round(person.points)}
                  </td>
                  {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-secondary)]">*/}
                  {/*  MMMM Do YYYY, h:mm:ss a*/}
                  {/*</td>*/}
                  {person.items.map(({ id, value, payload }, idx) => (
                    <td
                      className={
                        problemCellStyles +
                        ' py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-[var(--text-primary)]' +
                        (payload
                          ? ' cursor-pointer hover:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)]'
                          : '')
                      }
                      key={id}
                      onClick={() =>
                        payload &&
                        props.onCellClick &&
                        props.onCellClick(idx, payload)
                      }
                    >
                      {Math.round(parseFloat(value))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
