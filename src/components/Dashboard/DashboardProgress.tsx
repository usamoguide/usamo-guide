import * as React from 'react';

/**
 * Progress readouts shared by the syllabus, the module headers, and the
 * dashboard.
 *
 * The four states are separated by ink weight rather than by hue. The palette
 * has one accent and three status colours, and none of them mean "skipped" —
 * so spending colour here would either invent meanings or reuse the error red
 * for a neutral state. Weight carries the ordering instead, and every figure
 * is labelled, so the readout still works with colour removed.
 */
const STATE_INK = {
  completed: 'var(--heatmap-4)',
  inProgress: 'var(--heatmap-3)',
  skipped: 'var(--heatmap-2)',
  notStarted: 'var(--heatmap-empty)',
} as const;

const trackColor = 'var(--heatmap-empty)';
const mutedText = 'var(--text-muted)';

type ProgressCounts = {
  completed: number;
  inProgress: number;
  skipped: number;
  notStarted: number;
  total: number;
};

const Bar = ({
  completed,
  inProgress,
  skipped,
  className = '',
  height = 'h-1.5',
  label,
}: {
  completed: number;
  inProgress: number;
  skipped: number;
  className?: string;
  height?: string;
  label: string;
}) => (
  <div
    className={`flex ${height} overflow-hidden rounded-full ${className}`}
    style={{ background: trackColor }}
    role="img"
    aria-label={label}
  >
    <div
      style={{ width: `${completed}%`, background: STATE_INK.completed }}
      className="h-full"
    />
    <div
      style={{ width: `${inProgress}%`, background: STATE_INK.inProgress }}
      className="h-full"
    />
    <div
      style={{ width: `${skipped}%`, background: STATE_INK.skipped }}
      className="h-full"
    />
  </div>
);

const Figure = ({
  number,
  text,
  ink,
}: {
  number: number;
  text: string;
  ink: string;
}) => (
  <div className="flex flex-col gap-1">
    <span
      className="flex items-center gap-1.5 text-xs"
      style={{ color: mutedText }}
    >
      <span
        aria-hidden="true"
        className="progress-swatch"
        style={{ background: ink }}
      />
      {text}
    </span>
    <span
      className="font-mono text-lg tabular-nums"
      style={{ color: 'var(--text-primary)' }}
    >
      {number}
    </span>
  </div>
);

export default function DashboardProgress({
  completed,
  inProgress,
  skipped,
  notStarted,
  total,
}: ProgressCounts): JSX.Element {
  const pct = (value: number) => (total === 0 ? 0 : (value / total) * 100);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Figure number={completed} text="Completed" ink={STATE_INK.completed} />
        <Figure
          number={inProgress}
          text="In progress"
          ink={STATE_INK.inProgress}
        />
        <Figure number={skipped} text="Skipped" ink={STATE_INK.skipped} />
        <Figure
          number={notStarted}
          text="Not started"
          ink={STATE_INK.notStarted}
        />
      </div>
      <Bar
        completed={pct(completed)}
        inProgress={pct(inProgress)}
        skipped={pct(skipped)}
        label={`${completed} of ${total} completed, ${inProgress} in progress, ${skipped} skipped, ${notStarted} not started`}
      />
      <p
        className="mt-2 text-right font-mono text-xs tabular-nums"
        style={{ color: mutedText }}
      >
        {total} total
      </p>
    </div>
  );
}

export function DashboardProgressSmall({
  completed,
  inProgress,
  skipped,
  notStarted,
  total,
}: ProgressCounts): JSX.Element {
  const pct = (value: number) => (total === 0 ? 0 : (value / total) * 100);

  return (
    <div className="inline-flex items-center gap-2">
      <Bar
        className="w-24"
        height="h-1.5"
        completed={pct(completed)}
        inProgress={pct(inProgress)}
        skipped={pct(skipped)}
        label={`${completed} of ${total} completed, ${inProgress} in progress, ${skipped} skipped, ${notStarted} not started`}
      />
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: mutedText }}
      >
        {completed}/{total}
      </span>
    </div>
  );
}
