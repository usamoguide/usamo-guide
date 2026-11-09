import * as React from 'react';
import { useSetProgressOnProblem } from '../../context/UserDataContext/properties/userProgress';
import { ProblemInfo } from '../../models/problem';
import Btn from '../ug/Btn';
import { IcoCheck, IcoClose } from '../ug/icons';
import { useProblemStatus } from '../ug/ProblemStatusMenu';
import ProblemStatementMarkdown from './ProblemStatementMarkdown';

function answersMatch(user: string, correct: string): boolean {
  const u = user.trim();
  const c = correct.trim();
  if (u === c) return true;
  const nu = Number(u);
  const nc = Number(c);
  if (!Number.isNaN(nu) && !Number.isNaN(nc) && nu === nc) return true;
  return false;
}

const LETTERS = 'ABCDEFGHIJ';

/**
 * Answer checking for problems with a known answer: a number field or a list of
 * choices, then Check. A right answer offers to mark the problem solved.
 */
export default function ProblemAnswer({
  problem,
}: {
  problem: ProblemInfo;
}): JSX.Element | null {
  const [integerInput, setIntegerInput] = React.useState('');
  const [mcqIndex, setMcqIndex] = React.useState<number | null>(null);
  const [checkResult, setCheckResult] = React.useState<
    'idle' | 'correct' | 'incorrect' | 'empty'
  >('idle');
  const status = useProblemStatus(problem.uniqueId);
  const setProgress = useSetProgressOnProblem();
  const interaction = problem.interaction;

  if (interaction.type === 'none') return null;

  const runCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (interaction.type === 'integer') {
      if (!integerInput.trim()) {
        setCheckResult('empty');
        return;
      }
      setCheckResult(
        answersMatch(integerInput, interaction.correct)
          ? 'correct'
          : 'incorrect'
      );
    } else if (interaction.type === 'mcq') {
      if (mcqIndex === null) {
        setCheckResult('empty');
        return;
      }
      setCheckResult(
        mcqIndex === interaction.correctIndex ? 'correct' : 'incorrect'
      );
    }
  };

  const result =
    checkResult === 'correct' ? (
      <p className="prb-res ok" role="status">
        <span className="prb-res-ic" aria-hidden="true">
          <IcoCheck />
        </span>
        <span>Correct. Nice work.</span>
        {status !== 'Solved' ? (
          <button
            type="button"
            className="prb-linkbtn"
            onClick={() => setProgress(problem.uniqueId, 'Solved')}
          >
            Mark as solved
          </button>
        ) : (
          <span className="prb-res-note">Marked as solved.</span>
        )}
      </p>
    ) : checkResult === 'incorrect' ? (
      <p className="prb-res no" role="status">
        <span className="prb-res-ic" aria-hidden="true">
          <IcoClose />
        </span>
        <span>Not quite. Try again.</span>
      </p>
    ) : checkResult === 'empty' ? (
      <p className="prb-res no" role="status">
        <span>
          {interaction.type === 'mcq'
            ? 'Pick an answer first.'
            : 'Enter an answer first.'}
        </span>
      </p>
    ) : null;

  if (interaction.type === 'integer') {
    return (
      <form
        className="prb-ans"
        onSubmit={runCheck}
        aria-label="Check your answer"
      >
        <label className="prb-ans-k" htmlFor="prb-answer">
          Your answer
        </label>
        <div className="prb-field">
          <input
            id="prb-answer"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={integerInput}
            onChange={e => {
              setIntegerInput(e.target.value);
              setCheckResult('idle');
            }}
            className="prb-in"
            placeholder="Enter a number"
          />
          <Btn kind="p" size="sm" type="submit">
            Check
          </Btn>
        </div>
        {result}
      </form>
    );
  }

  return (
    <form
      className="prb-ans"
      onSubmit={runCheck}
      aria-label="Check your answer"
    >
      <p className="prb-ans-k" id="prb-choices-k">
        Pick an answer
      </p>
      <div
        className="prb-choices"
        role="radiogroup"
        aria-labelledby="prb-choices-k"
      >
        {interaction.choices.map((choice, i) => {
          const on = mcqIndex === i;
          const right = checkResult === 'correct' && on;
          return (
            <label
              key={i}
              className={['prb-ch', on ? 'on' : '', right ? 'right' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <input
                type="radio"
                name="prb-mcq"
                checked={on}
                onChange={() => {
                  setMcqIndex(i);
                  setCheckResult('idle');
                }}
              />
              <span className="prb-ch-k" aria-hidden="true">
                {right ? <IcoCheck /> : (LETTERS[i] ?? i + 1)}
              </span>
              <span className="prb-ch-t">
                <ProblemStatementMarkdown inline>
                  {choice}
                </ProblemStatementMarkdown>
              </span>
            </label>
          );
        })}
      </div>
      <div className="prb-ans-go">
        <Btn kind="p" size="sm" type="submit">
          Check
        </Btn>
      </div>
      {result}
    </form>
  );
}
