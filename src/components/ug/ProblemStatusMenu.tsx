import * as React from 'react';
import {
  useSetProgressOnProblem,
  useUserProgressOnProblems,
} from '../../context/UserDataContext/properties/userProgress';
import { PROBLEM_PROGRESS_OPTIONS, ProblemProgress } from '../../models/problem';
import { closeMenu } from './hooks';
import { IcoCheck } from './icons';

/** Labels as the redesign writes them, in PROBLEM_PROGRESS_OPTIONS order (p0..p5). */
export const PROBLEM_STATUS_LABELS: Record<ProblemProgress, string> = {
  'Not Attempted': 'Not attempted',
  Solving: 'Solving',
  Solved: 'Solved',
  Reviewing: 'Reviewing',
  Skipped: 'Skipped',
  Ignored: 'Ignored',
};

/** `.ps-ic` modifier for a status: p0 empty ring ... p5 struck through. */
export function problemStatusIc(status: ProblemProgress): string {
  return 'p' + Math.max(0, PROBLEM_PROGRESS_OPTIONS.indexOf(status));
}

export function StatusIc({ status }: { status: ProblemProgress }): JSX.Element {
  return (
    <span className={`ps-ic ${problemStatusIc(status)}`} aria-hidden="true">
      <IcoCheck />
    </span>
  );
}

/** Read one problem's status. */
export function useProblemStatus(uniqueId: string): ProblemProgress {
  const progress = useUserProgressOnProblems();
  return progress?.[uniqueId] ?? 'Not Attempted';
}

/**
 * The problem status control: an empty ring that fills as you go, with a menu of
 * every status. Writes through to the user's progress (local or synced).
 */
export default function ProblemStatusMenu({
  uniqueId,
  name,
  alignRight = false,
  className,
}: {
  uniqueId: string;
  /** problem name, for the accessible label */
  name: string;
  /** `.ps-menu.r`: open the menu leftwards from the right edge */
  alignRight?: boolean;
  className?: string;
}): JSX.Element {
  const status = useProblemStatus(uniqueId);
  const setProgress = useSetProgressOnProblem();
  return (
    <details className={['ps', className || ''].filter(Boolean).join(' ')} data-dismiss="">
      <summary
        className="ps-btn"
        aria-label={`Status: ${PROBLEM_STATUS_LABELS[status]}. Change the status of ${name}`}
      >
        <StatusIc status={status} />
      </summary>
      <div className={alignRight ? 'ps-menu r' : 'ps-menu'} role="menu" aria-label="Problem status">
        {PROBLEM_PROGRESS_OPTIONS.map(opt => (
          <button
            key={opt}
            className={opt === status ? 'ps-opt on' : 'ps-opt'}
            type="button"
            role="menuitemradio"
            aria-checked={opt === status ? 'true' : 'false'}
            onClick={e => {
              setProgress(uniqueId, opt);
              closeMenu(e);
            }}
          >
            <StatusIc status={opt} />
            {PROBLEM_STATUS_LABELS[opt]}
          </button>
        ))}
      </div>
    </details>
  );
}
