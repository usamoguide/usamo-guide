import { Link } from 'gatsby';
import classNames from 'classnames';
import * as React from 'react';

/**
 * A real contest problem, answerable on the landing page.
 *
 * Everything else here describes what the site does; this lets you do it. You
 * pick, you find out, and the explanation appears — which is the whole product
 * in about fifteen seconds.
 *
 * The problem is a genuine AMC-style counting question with a checkable answer
 * and a real explanation, not a mock-up: getting it wrong has to actually mean
 * something or the interaction is theatre.
 */

type Choice = { key: string; label: string };

const CHOICES: Choice[] = [
  { key: 'A', label: '10' },
  { key: 'B', label: '20' },
  { key: 'C', label: '35' },
  { key: 'D', label: '56' },
  { key: 'E', label: '70' },
];

const CORRECT = 'C';

const EXPLANATION =
  'Every path is a sequence of 7 steps: 3 rights and 4 ups, in some order. Choosing which of the 7 steps are the rights fixes the whole path, so the count is C(7,3) = 35.';

export default function TryAProblem(): JSX.Element {
  const [picked, setPicked] = React.useState<string | null>(null);
  const revealed = picked !== null;
  const correct = picked === CORRECT;

  return (
    <section className="tryp">
      <div className="tryp__inner">
        <div className="tryp__panel">
          <h2 className="tryp__heading">Try one.</h2>
          <p className="tryp__lede">
            A real counting problem, at about AMC 10 difficulty. Pick an answer.
          </p>

          <div className="tryp__question">
            <p className="tryp__stem">
              A token starts at the bottom-left corner of a 3&nbsp;&times;&nbsp;4
              grid and moves only right or up along the lines. How many distinct
              paths reach the top-right corner?
            </p>

            <ul className="tryp__choices">
              {CHOICES.map(choice => {
                const isPicked = picked === choice.key;
                const isAnswer = choice.key === CORRECT;
                return (
                  <li key={choice.key}>
                    <button
                      type="button"
                      onClick={() => setPicked(choice.key)}
                      // Locked after the first pick: this is a demonstration,
                      // and letting someone cycle answers until one lights up
                      // green would teach exactly the wrong habit.
                      disabled={revealed}
                      aria-pressed={isPicked}
                      className={classNames(
                        'tryp__choice',
                        revealed && isAnswer && 'is-correct',
                        revealed && isPicked && !isAnswer && 'is-wrong',
                        revealed && !isPicked && !isAnswer && 'is-dim'
                      )}
                    >
                      <span className="tryp__key">{choice.key}</span>
                      <span className="tryp__value">{choice.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Reserved before the reveal so answering does not shift the
                page under the reader's cursor. */}
            <div className="tryp__result" aria-live="polite">
              {revealed && (
                <div className="tryp__result-in">
                  <p
                    className={classNames(
                      'tryp__verdict',
                      correct ? 'is-correct' : 'is-wrong'
                    )}
                  >
                    {correct ? 'Correct.' : `Not quite — it is 35.`}
                  </p>
                  <p className="tryp__explain">{EXPLANATION}</p>
                  <Link
                    to="/intermediate/advanced-counting"
                    className="btn btn-secondary tryp__cta"
                  >
                    Learn this properly
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="tryp__figure" aria-hidden="true">
          <GridFigure />
        </div>
      </div>
    </section>
  );
}

/**
 * The 3×4 lattice the problem describes, with one path traced along it.
 *
 * Drawn from the same numbers the question uses, so the figure cannot drift
 * out of agreement with the text.
 */
const COLS = 3;
const ROWS = 4;
const CELL = 54;
const PAD = 26;

function GridFigure(): JSX.Element {
  const w = COLS * CELL + PAD * 2;
  const h = ROWS * CELL + PAD * 2;
  const x = (c: number) => PAD + c * CELL;
  const y = (r: number) => PAD + (ROWS - r) * CELL;

  /** One monotone staircase: R U U R U R U. */
  const path = [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 2],
    [2, 3],
    [3, 3],
    [3, 4],
  ] as const;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="tryp__svg">
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line
          key={`h${r}`}
          x1={x(0)}
          x2={x(COLS)}
          y1={y(r)}
          y2={y(r)}
          className="tryp__grid"
        />
      ))}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line
          key={`v${c}`}
          x1={x(c)}
          x2={x(c)}
          y1={y(0)}
          y2={y(ROWS)}
          className="tryp__grid"
        />
      ))}

      <polyline
        points={path.map(([c, r]) => `${x(c)},${y(r)}`).join(' ')}
        className="tryp__path"
        fill="none"
      />

      <circle cx={x(0)} cy={y(0)} r="5" className="tryp__node" />
      <circle cx={x(COLS)} cy={y(ROWS)} r="5" className="tryp__node is-end" />
    </svg>
  );
}
