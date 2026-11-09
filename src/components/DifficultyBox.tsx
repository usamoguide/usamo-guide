import * as React from 'react';
import { ProblemDifficulty } from '../models/problem';

/** Legacy Tailwind colours per difficulty (still read by the old landing feature card). */
export const difficultyClasses = {
  'N/A': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  'Very Easy': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  Easy: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  Normal: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  Hard: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
  'Very Hard':
    'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
  Insane: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
};

/**
 * The redesign's difficulty pill (`.diff.d-*` in app.css): one purple that gets
 * heavier as problems get harder. Maps the content's difficulty strings
 * (Very Easy ... Insane, plus a few legacy spellings) onto the export's scale.
 * Returns null when there's no difficulty to show.
 */
export function diffPill(
  difficulty: string | null | undefined
): { label: string; cls: string } | null {
  const d = (difficulty || '').trim().toLowerCase();
  switch (d) {
    case 'very easy':
      return { label: 'Very easy', cls: 'd-easy' };
    case 'easy':
    case 'medium-easy':
      return { label: 'Easy', cls: 'd-easy' };
    case 'normal':
    case 'medium':
      return { label: 'Medium', cls: 'd-med' };
    case 'hard':
      return { label: 'Hard', cls: 'd-hard' };
    case 'very hard':
      return { label: 'Very hard', cls: 'd-vhard' };
    case 'insane':
      return { label: 'Insane', cls: 'd-insane' };
    case 'olympiad':
      return { label: 'Olympiad', cls: 'd-insane' };
    default:
      return null;
  }
}

/** Sort key for a difficulty: easiest first, unknown last. */
export function diffRank(difficulty: string | null | undefined): number {
  const order = [
    'very easy',
    'easy',
    'medium-easy',
    'normal',
    'medium',
    'hard',
    'very hard',
    'insane',
    'olympiad',
  ];
  const i = order.indexOf((difficulty || '').trim().toLowerCase());
  return i < 0 ? order.length : i;
}

/**
 * A problem's difficulty as the redesign's pill. Same props as before; an
 * unknown difficulty ("N/A") shows as a quiet pill with an explanation.
 */
export default function DifficultyBox({
  difficulty,
}: {
  difficulty: ProblemDifficulty;
}): JSX.Element {
  const pill = diffPill(difficulty);
  if (!pill) {
    return (
      <span
        className="diff d-easy"
        title="This problem was added automatically; if you want to suggest a difficulty, feel free to make a pull request!"
      >
        {difficulty || 'N/A'}
      </span>
    );
  }
  return <span className={`diff ${pill.cls}`}>{pill.label}</span>;
}
