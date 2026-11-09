import * as React from 'react';
import { TROPHY_CUP } from './paths';
import { css, cx, IcoOut, rung } from './util';

const RUNGS = [
  {
    exam: 'AMC 8',
    format: '25 questions · multiple choice',
    level: 'Middle school',
    body: "25 multiple-choice questions, and day one for a lot of people. The Guide starts at the basics, so you don't need a head start.",
  },
  {
    exam: 'AMC 10/12',
    format: '25 questions · multiple choice',
    level: 'High school',
    body: 'Also 25 multiple-choice questions, written for high schoolers. Score well enough and you qualify for the AIME.',
  },
  {
    exam: 'AIME',
    format: '15 questions · numerical answers',
    level: 'Invitational',
    body: "A much harder exam: 15 questions, and every answer is a number. Do well here too and you're in USAMO or USAJMO territory.",
  },
  {
    exam: 'USA(J)MO',
    format: '6 problems · written proofs',
    level: 'Olympiad',
    body: "Six proof problems over two days. Probably the toughest math test most high schoolers will ever take, and the one this Guide's authors medaled on.",
  },
];

export const MAA_URL = 'https://maa.org/student-programs/amc/';

/** "Train with purpose": the four contests as a staircase that climbs while you scroll. */
export default function Ladder({ step }: { step: number }): JSX.Element {
  return (
    <section className="sec ladder" id="path">
      <div className="dz dz-trophy" aria-hidden="true">
        <div className="dd-in rv" style={css({ '--d': '200ms' })}>
          <svg className="dd-svg" viewBox="0 0 180 206">
            <path
              className="cup-fill"
              d="M50 42C50.7 48 50.7 68 54 78C57.3 88 64 96.7 70 102C76 107.3 83.3 110 90 110C96.7 110 104 107.3 110 102C116 96.7 122.7 88 126 78C129.3 68 129.3 48 130 42Z"
            />
            <path
              className="ink dr"
              pathLength={1}
              d="M50 42C50.7 48 50.7 68 54 78C57.3 88 64 96.7 70 102C76 107.3 83.3 110 90 110C96.7 110 104 107.3 110 102C116 96.7 122.7 88 126 78C129.3 68 129.3 48 130 42"
            />
            <path className="ink dr" pathLength={1} d={TROPHY_CUP} />
            <path
              className="ink dr dr2"
              pathLength={1}
              d="M52 54C48.7 53.7 36.3 49.7 32 52C27.7 54.3 25.3 62.7 26 68C26.7 73.3 30.7 80.3 36 84C41.3 87.7 54.3 89 58 90"
            />
            <path
              className="ink dr dr2"
              pathLength={1}
              d="M128 54C131.3 53.7 143.7 49.7 148 52C152.3 54.3 154.7 62.7 154 68C153.3 73.3 149.3 80.3 144 84C138.7 87.7 125.7 89 122 90"
            />
            <path
              className="ink dr"
              pathLength={1}
              d="M83.6 109.8C83.5 118.4 84.1 129.6 83.8 138.5M96.1 110.1C96.3 118.4 96.3 129.6 96.5 138.4"
            />
            <path
              className="ink dr"
              pathLength={1}
              d="M64.4 138.6C79.6 137.6 100.4 137.2 115.4 138.3M115.7 138.4C115.6 143.5 117 150.6 118.3 155.6M117.4 155.8C101.2 155.6 78.8 156.8 61.8 155.9M62.6 156.6C63 150.6 64.3 143.5 64.6 138.3"
            />
            <path
              className="ink dr"
              pathLength={1}
              d="M54.1 156.1C75.6 155.5 104.4 155.1 126.2 155.5M126.1 156.2C127.5 160.1 126.2 166 127.5 169.9M128.6 169.6C105.2 168.9 74.8 169.6 51.9 170.4M52.1 169.5C52.4 165.8 54.2 160.3 53.5 156.6"
            />
            <path
              className="spk"
              d="M90 57Q91.3 68.7 103 70Q91.3 71.3 90 83Q88.7 71.3 77 70Q88.7 68.7 90 57Z"
            />
            <text className="dd-n" x="90" y="200">
              the finish line
            </text>
          </svg>
        </div>
      </div>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="h2 rv" style={css({ '--d': '60ms' })}>
            Train with purpose, not guesswork.
          </h2>
          <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
            Curated topics run from AMC foundations to olympiad depth, organized
            into battle-tested problem-solving tracks. Jump in wherever you
            actually are.
          </p>
        </div>
        <div className="lad-grid">
          <div className="lad-pinwrap">
            <div className="lad-pin" aria-hidden="true">
              <div className="pin-top">
                <span className="lbl pin-k">Rung 0{step + 1} / 04</span>
                <span className="segs">
                  {RUNGS.map((r, i) => (
                    <span key={r.exam} className={cx('seg', rung(i, step))} />
                  ))}
                </span>
              </div>
              <div className="rn-box">
                {RUNGS.map((r, i) => (
                  <div key={r.exam} className={cx('rn', rung(i, step))}>
                    {r.exam}
                  </div>
                ))}
              </div>
              <div className="rd-box lbl">
                {RUNGS.map((r, i) => (
                  <div key={r.exam} className={cx('rd', rung(i, step))}>
                    {r.format}
                  </div>
                ))}
              </div>
              <div className="stair" data-s={String(step)}>
                <div className="bars">
                  {RUNGS.map((r, i) => (
                    <span key={r.exam} className={cx('bar', rung(i, step))} />
                  ))}
                </div>
                <span className="mk" />
              </div>
              <div className="bar-labels lbl">
                {RUNGS.map(r => (
                  <span key={r.exam}>{r.exam}</span>
                ))}
              </div>
              <div className="pin-prog" />
            </div>
          </div>
          <div className="lad-steps">
            {RUNGS.map((r, i) => (
              <article key={r.exam} className={cx('lstep', rung(i, step))}>
                <div className="lstep-in">
                  <p className="lstep-k lbl">
                    <span className="lstep-n">0{i + 1}</span>
                    <span>{r.level}</span>
                  </p>
                  <h3 className="lstep-t">{r.exam}</h3>
                  <p className="lstep-p">{r.body}</p>
                </div>
              </article>
            ))}
            <p className="lad-foot rv">
              Official dates and registration live on the{' '}
              <a href={MAA_URL} target="_blank" rel="noreferrer">
                MAA competitions page
                <IcoOut />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
