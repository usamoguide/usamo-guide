import * as React from 'react';
import { DIE1_FILL, DIE1_INK, DIE2_FILL, DIE2_INK } from './paths';
import { css, cx, onIf } from './util';

const STEPS = [
  {
    pose: 'read',
    sticker: 'C(6, 2) = 15',
    k: 'Learn',
    t: 'Read one idea at a time.',
    p: 'Lessons run from AMC basics to olympiad technique. Each one teaches a single idea with worked examples, like the sample above.',
  },
  {
    pose: 'think',
    sticker: 'hmm, case 2?',
    k: 'Practice',
    t: 'Then try it yourself.',
    p: 'Problem-solving tracks climb from warm-ups to olympiad-hard problems, so every session has a direction.',
  },
  {
    pose: 'stuck',
    sticker: 'wait, 31??',
    k: 'Get stuck',
    t: 'Getting stuck is part of it.',
    p: 'Every strong problem solver has stared at one problem for an hour. It means you found the edge of what you know.',
  },
  {
    pose: 'idea',
    sticker: "oh! Pascal's rule",
    k: 'Get unstuck',
    t: 'Ask, and someone answers.',
    p: 'Bring it to the Discord, join a study group, or get paired with a mentor.',
  },
  {
    pose: 'focus',
    sticker: '74:59 left',
    k: 'Compete',
    t: 'Then test it under the clock.',
    p: "Mock AMC and AIME contests run in the real format, and rated contests show how far you've come.",
  },
];

const PIPS: [number, number][] = [
  [48.7, 64.3],
  [66.4, 73.8],
  [83.4, 84.2],
];
const PIPS2: [number, number][] = [
  [135.6, 70.8],
  [160.8, 75.3],
  [130.4, 96.7],
  [156, 101.5],
];

/** "From stuck to solved": the panda acts out each step of the loop as it scrolls past. */
export default function Scene({ sstep }: { sstep: number }): JSX.Element {
  return (
    <section className="sec scene" id="platform" aria-labelledby="ug-scene-h">
      <div className="dz dz-dice" aria-hidden="true">
        <div className="dd-in rv" style={css({ '--d': '200ms' })}>
          <svg className="dd-svg" viewBox="0 0 210 170">
            <path className="die-fill" d={DIE1_FILL} />
            <path className="ink dr" pathLength={1} d={DIE1_INK} />
            {PIPS.map(([x, y]) => (
              <circle key={x} className="pip" cx={x} cy={y} r="5" />
            ))}
            <path className="die-fill" d={DIE2_FILL} />
            <path className="ink dr" pathLength={1} d={DIE2_INK} />
            {PIPS2.map(([x, y]) => (
              <circle key={x} className="pip" cx={x} cy={y} r="5" />
            ))}
            <path
              className="ink dr dr2"
              pathLength={1}
              d="M13.8 57.8C19 56.8 25.4 54.5 30 52.3M10.4 76.4C14.7 74.8 21.2 75 25.4 74.5M16.1 94.5C20.4 94.6 25.9 96.6 29.8 98.5"
            />
            <text className="dd-n" x="105" y="160">
              P(sum = 7) = 1/6
            </text>
          </svg>
        </div>
      </div>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="h2 rv" id="ug-scene-h" style={css({ '--d': '60ms' })}>
            From stuck to solved.
          </h2>
          <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
            The Guide covers the whole loop: learn an idea, practice it, get
            stuck, get help, then test yourself under real contest conditions.
          </p>
        </div>
        <div className="sc-grid">
          <div className="sc-pinwrap" aria-hidden="true">
            <div className="sc-pin">
              <div className="sc-stage">
                <span className="sc-disc" />
                <span className="sc-ground" />
                {STEPS.map((s, i) => (
                  <img
                    key={s.pose}
                    className={cx('sc-fox', onIf(i, sstep))}
                    src={`/ug/img/panda-${s.pose}.webp`}
                    alt=""
                    width="450"
                    height="464"
                  />
                ))}
                {STEPS.map((s, i) => (
                  <span
                    key={s.pose}
                    className={cx('stk sc-stk', onIf(i, sstep))}
                  >
                    {s.sticker}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ol className="sc-steps">
            {STEPS.map((s, i) => (
              <li key={s.pose} className={cx('sc-step rv', onIf(i, sstep))}>
                <div className="sc-in">
                  <img
                    className="sc-mini"
                    src={`/ug/img/panda-${s.pose}.webp`}
                    alt=""
                    width="450"
                    height="464"
                  />
                  <p className="sc-k">
                    <span className="sc-n">0{i + 1}</span>
                    {s.k}
                  </p>
                  <h3 className="sc-t">{s.t}</h3>
                  <p className="sc-p">{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
