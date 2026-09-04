import * as React from 'react';
import { ProblemDifficulty } from '../models/problem';
import TextTooltip from './Tooltip/TextTooltip';

/**
 * Difficulty is ordinal, so it reads as one ramp rather than seven unrelated
 * hues. Ink weight carries the low end; colour appears only at Hard and above,
 * where it is a genuine warning rather than decoration.
 *
 * Replaces a grey/green/blue/purple/orange/red rainbow that shared no vocabulary
 * with anything else in the product. Every step is paired with its label, so
 * removing colour entirely leaves the scale fully readable.
 */
export const difficultyClasses = {
  'N/A': 'difficulty--na',
  'Very Easy': 'difficulty--very-easy',
  Easy: 'difficulty--easy',
  Normal: 'difficulty--normal',
  Hard: 'difficulty--hard',
  'Very Hard': 'difficulty--very-hard',
  Insane: 'difficulty--insane',
};
export default function DifficultyBox({
  difficulty,
}: {
  difficulty: ProblemDifficulty;
}) {
  return (
    <span
      className={
        'difficulty-chip ' +
        difficultyClasses[difficulty]
      }
    >
      {difficulty === 'N/A' ? (
        <TextTooltip
          content={
            'This problem was added automatically; if you want to suggest a difficulty, feel free to make a pull request!'
          }
        >
          {difficulty}
        </TextTooltip>
      ) : (
        difficulty
      )}
    </span>
  );
}
