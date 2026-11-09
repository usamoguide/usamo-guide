import { Link } from 'gatsby';
import * as React from 'react';
import { getProblemURL } from '../../../models/problem';
import ProblemStatementMarkdown from '../../ProblemPage/ProblemStatementMarkdown';
import Btn from '../Btn';
import { IcoCheck, IcoClose } from '../icons';
import { UG_TRACKS } from '../links';

export type PlacementProblem = {
  uniqueId: string;
  name: string;
  source: string;
  statement: string | null;
  interaction: {
    type: string;
    correct: string | null;
    choices: ReadonlyArray<string> | null;
    correctIndex: number | null;
  };
};

/**
 * Five problems that climb from an easy AMC 8 problem to a mid-paper AIME
 * problem. Each pool comes from the problem data (page query in
 * src/pages/start.tsx); one problem is drawn from each when the panel opens.
 */
export type PlacementPools = ReadonlyArray<ReadonlyArray<PlacementProblem>>;

const LETTERS = 'ABCDE';

/** How many of the five you solved decides the suggestion. */
function levelFor(score: number): number {
  if (score >= 5) return 3;
  if (score === 4) return 2;
  if (score === 3) return 1;
  return 0;
}

const WHY = [
  'Foundations builds the base every later track assumes, so it is the place to start.',
  'AMC 8 problems are comfortable for you, so the AMC 10 and 12 material is the next step.',
  'You can already take on early AIME problems, so start with the AIME track.',
  "AIME problems didn't stop you, so you're ready to start on proofs.",
];

function usable(p: PlacementProblem): boolean {
  const t = p.interaction?.type;
  if (!p.statement) return false;
  if (t === 'mcq') {
    const c = p.interaction.choices || [];
    // some imported problems carry placeholder choices ("Missing A")
    return c.length > 1 && p.interaction.correctIndex != null && !c.some(x => /Missing [A-E]/.test(x));
  }
  if (t === 'integer') return p.interaction.correct != null;
  return false;
}

function draw(pools: PlacementPools): PlacementProblem[] {
  const out: PlacementProblem[] = [];
  pools.forEach(pool => {
    const seen = new Set(out.map(p => p.uniqueId));
    const ok = pool.filter(p => usable(p) && !seen.has(p.uniqueId));
    if (ok.length) out.push(ok[Math.floor(Math.random() * ok.length)]);
  });
  return out;
}

function isRight(p: PlacementProblem, a: string | number | null): boolean {
  if (a === null || a === '') return false;
  if (p.interaction.type === 'mcq') return a === p.interaction.correctIndex;
  const want = Number(String(p.interaction.correct).trim());
  const got = Number(String(a).trim());
  return Number.isFinite(got) && got === want;
}

export function hasPlacement(pools: PlacementPools): boolean {
  return pools.length > 0 && pools.every(pool => pool.some(usable));
}

/**
 * "Try five quick problems": a dialog that asks five real contest problems,
 * then suggests a track and picks it on the page.
 */
export default function Placement({
  pools,
  open,
  onClose,
  onPick,
}: {
  pools: PlacementPools;
  open: boolean;
  onClose: () => void;
  /** pick a level (0-3) on the start page */
  onPick: (level: number) => void;
}): JSX.Element {
  const ref = React.useRef<HTMLDialogElement | null>(null);
  const [set, setSet] = React.useState<PlacementProblem[]>([]);
  const [i, setI] = React.useState(0);
  const [answers, setAnswers] = React.useState<(string | number | null)[]>([]);
  const [draft, setDraft] = React.useState<string | number | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const restart = React.useCallback(() => {
    setSet(draw(pools));
    setI(0);
    setAnswers([]);
    setDraft(null);
  }, [pools]);

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      restart();
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, restart]);

  const finished = set.length > 0 && i >= set.length;
  const p = finished ? null : set[i];
  const score = set.reduce((t, q, k) => t + (isRight(q, answers[k] ?? null) ? 1 : 0), 0);
  const level = levelFor(score);
  const track = UG_TRACKS[level];

  React.useEffect(() => {
    if (p?.interaction.type === 'integer') inputRef.current?.focus();
  }, [p]);

  const answer = (a: string | number | null) => {
    setAnswers(prev => {
      const next = prev.slice();
      next[i] = a;
      return next;
    });
    setDraft(null);
    setI(i + 1);
  };

  const close = () => onClose();

  return (
    <dialog
      ref={ref}
      className="pl-dlg"
      aria-labelledby="pl-h"
      onClose={close}
      onCancel={close}
      onClick={e => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="pl-card">
        <button className="pl-x" type="button" aria-label="Close" onClick={close}>
          <IcoClose />
        </button>
        {p ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (draft !== null && draft !== '') answer(draft);
            }}
          >
            <p className="k-label" id="pl-h">
              Problem {i + 1} of {set.length}
            </p>
            <div className="pl-prog" aria-hidden="true">
              {set.map((q, k) => (
                <span key={q.uniqueId} className={k < i ? 'done' : k === i ? 'now' : ''} />
              ))}
            </div>
            <p className="pl-src">{p.name}</p>
            <ProblemStatementMarkdown className="pl-stmt">{p.statement || ''}</ProblemStatementMarkdown>
            {p.interaction.type === 'mcq' ? (
              <div className="pl-choices" role="radiogroup" aria-label="Answer choices">
                {(p.interaction.choices || []).map((c, k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={draft === k}
                    className={`pl-choice ${draft === k ? 'on' : ''}`}
                    onClick={() => setDraft(k)}
                  >
                    <span className="pl-letter" aria-hidden="true">
                      {LETTERS[k] || k + 1}
                    </span>
                    <ProblemStatementMarkdown inline>{c}</ProblemStatementMarkdown>
                  </button>
                ))}
              </div>
            ) : (
              <label className="pl-int">
                <span>Your answer, a whole number from 0 to 999</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  autoComplete="off"
                  value={draft === null ? '' : String(draft)}
                  onChange={e => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </label>
            )}
            <div className="pl-foot">
              <button className="pl-skip" type="button" onClick={() => answer(null)}>
                I don&apos;t know
              </button>
              <Btn kind="p" size="sm" type="submit" disabled={draft === null || draft === ''} arrow>
                {i + 1 < set.length ? 'Next' : 'See my track'}
              </Btn>
            </div>
          </form>
        ) : finished ? (
          <div className="pl-res">
            <p className="k-label" id="pl-h">
              You solved {score} of {set.length}
            </p>
            <h2 className="pl-h">
              Start with {track.name} <span>({track.exam})</span>
            </h2>
            <p className="pl-why">{WHY[level]}</p>
            <ol className="pl-list">
              {set.map((q, k) => {
                const ok = isRight(q, answers[k] ?? null);
                return (
                  <li key={q.uniqueId} className={ok ? 'ok' : ''}>
                    <span className="pl-mark" aria-label={ok ? 'Solved' : 'Not solved'} role="img">
                      {ok ? <IcoCheck /> : <IcoClose />}
                    </span>
                    <Link to={getProblemURL(q)} onClick={close}>
                      {q.name}
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div className="pl-foot">
              <button className="pl-skip" type="button" onClick={restart}>
                Try five more
              </button>
              <Btn
                kind="p"
                size="sm"
                arrow
                onClick={() => {
                  onPick(level);
                  close();
                }}
              >
                Show my first step
              </Btn>
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
