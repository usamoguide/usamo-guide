import * as React from 'react';
import Btn from '../Btn';
import { UG_LINKS } from '../links';
import { O4_STEP1, O4_STEP2, O4_STEP3 } from './paths';
import { css, cx } from './util';

/** Olympiad4Everyone sponsorship enquiries. */
const SPONSOR_MAIL = 'mailto:team@usamoguide.com';

/**
 * The crowd that climbs the steps: [x1, y1, i] on the ground, then [x2, y2, j]
 * for the dots that reach stage 2 and [x3, y3, k] for the ones in the finals.
 */
const DOTS: number[][] = [
  [44.5, 378, 0, 456.5, 221, 1, 753, 118, 1],
  [73.5, 378, 1, 485.5, 221, 3, 861, 118, 3],
  [102.5, 378, 2],
  [131.5, 378, 3],
  [160.5, 378, 4],
  [189.5, 378, 5],
  [247.5, 378, 7],
  [276.5, 378, 8],
  [305.5, 378, 9],
  [44.5, 351, 2, 427.5, 248, 5],
  [73.5, 351, 3, 456.5, 248, 6],
  [102.5, 351, 4],
  [131.5, 351, 5],
  [160.5, 351, 6],
  [189.5, 351, 7],
  [218.5, 351, 8],
  [247.5, 351, 9, 543.5, 248, 9],
  [276.5, 351, 10, 572.5, 248, 11],
  [305.5, 351, 11],
  [44.5, 324, 4],
  [73.5, 324, 5],
  [102.5, 324, 6],
  [131.5, 324, 7],
  [160.5, 324, 8],
  [189.5, 324, 9],
  [218.5, 324, 10],
  [247.5, 324, 11],
  [276.5, 324, 12, 572.5, 221, 10],
  [305.5, 324, 13],
  [44.5, 297, 6, 427.5, 221, 2, 789, 118, 2],
  [73.5, 297, 7],
  [102.5, 297, 8],
  [131.5, 297, 9],
  [160.5, 297, 10],
  [189.5, 297, 11, 485.5, 248, 4, 897, 118, 4],
  [218.5, 297, 12, 514.5, 221, 7],
  [247.5, 297, 13, 543.5, 221, 8],
  [276.5, 297, 14],
  [305.5, 297, 15],
];
/** the panda ("you") makes it all the way */
const YOU = [218.5, 374, 6, 514.5, 244, 0, 825, 114, 0];

function dotStyle(d: number[]): React.CSSProperties {
  const v: Record<string, string | number> = {
    '--x1': `${d[0]}px`,
    '--y1': `${d[1]}px`,
    '--i': d[2],
  };
  if (d.length > 3) {
    Object.assign(v, { '--x2': `${d[3]}px`, '--y2': `${d[4]}px`, '--j': d[5] });
  }
  if (d.length > 6) {
    Object.assign(v, { '--x3': `${d[6]}px`, '--y3': `${d[7]}px`, '--k': d[8] });
  }
  return css(v);
}
const dotClass = (d: number[], extra?: string) =>
  cx('o4-d', extra, d.length > 3 && 'a2', d.length > 6 && 'a3');

// The signups marquee: two rows, each index is the country's flag in /ug/img/flags.webp.
const ROWS: string[][] = [
  [
    'Albania',
    'Bangladesh',
    'Canada',
    'Croatia',
    'Finland',
    'Germany',
    'India',
    'Kazakhstan',
    'Malaysia',
    'Morocco',
    'Nigeria',
    'Peru',
    'Rwanda',
    'Sri Lanka',
    'Uganda',
    'United Kingdom',
  ],
  [
    'Azerbaijan',
    'Brazil',
    'Chile',
    'Estonia',
    'Georgia',
    'Hong Kong',
    'Indonesia',
    'Kosovo',
    'Mongolia',
    'Nepal',
    'Pakistan',
    'Portugal',
    'Singapore',
    'Tunisia',
    'United Arab Emirates',
    'United States',
  ],
];

function CountrySet({
  row,
  offset,
  hidden,
}: {
  row: string[];
  offset: number;
  hidden?: boolean;
}) {
  return (
    <span className="o4-set" aria-hidden={hidden ? 'true' : undefined}>
      {row.map((c, i) => (
        <span key={c}>
          <i
            className={cx('fl', c === 'Nepal' && 'fl-np')}
            style={css({ '--f': offset + i })}
          />
          {c}
        </span>
      ))}
    </span>
  );
}

/**
 * Olympiad4Everyone: the night panel with the stamped AMC ticket, the three-stage
 * contest climb (data-climb steps 0..3 as it scrolls into view), and the marquee
 * of countries.
 */
export default function Olympiad4Everyone({
  climb,
}: {
  climb: number;
}): JSX.Element {
  return (
    <section className="sec o4e" id="o4e" aria-labelledby="ug-o4e-h">
      <div className="wrap">
        <div className="o4-head">
          <div className="o4-copy">
            <h2 className="h2 rv" id="ug-o4e-h" style={css({ '--d': '60ms' })}>
              Olympiad math belongs to everyone.
            </h2>
            <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
              Olympiad4Everyone is how USAMO Guide gives back in real life. We
              pay for the AMC at schools that can&apos;t afford it, and we run a
              free, proctored olympiad that anyone in the world can take.
            </p>
            <div className="cta-row rv" style={css({ '--d': '180ms' })}>
              <Btn kind="w" href={UG_LINKS.o4e} target="_blank" arrow>
                Register for the contest
              </Btn>
              <Btn kind="o" href={SPONSOR_MAIL}>
                Become a sponsor
              </Btn>
            </div>
          </div>
          <div className="o4-tk-wrap rv" style={css({ '--d': '160ms' })}>
            <div className="tk" aria-hidden="true">
              <div className="tk-main">
                <p className="tk-k">admit one</p>
                <p className="tk-big">AMC 10</p>
                <p className="tk-row">
                  <span>student</span>
                  <b>you</b>
                  <i />
                </p>
                <p className="tk-row">
                  <span>entry fee</span>
                  <i />
                </p>
              </div>
              <div className="tk-stub">
                <span>No. 0001</span>
              </div>
              <span className="tk-stamp">
                <b>Fee covered</b>
                <i>Olympiad4Everyone</i>
              </span>
              <p className="o4-note">
                <svg viewBox="0 0 64 48">
                  <path d="M58 42C44 44 26 38 16 16" />
                  <path d="M16 16L13.5 29M16 16L27 22.5" />
                </svg>
                we cover this part
              </p>
            </div>
            <p className="o4-cap">
              The AMC is the first olympiad for a lot of students, and a school
              has to pay to offer it. When a school can&apos;t, we raise the
              money so its students still get to sit it.
            </p>
          </div>
        </div>
        <div className="o4-climb-head">
          <div className="o4-climb-copy">
            <h3 className="o4-h3 rv">No AMC at your school? Climb anyway.</h3>
            <p className="o4-sub rv" style={css({ '--d': '60ms' })}>
              Thanksgiving Edition 1 runs over three weekends in November. Stage
              1 is AMC 10 level. The top 30% go on to an AMC 12 round, and the
              best 20 to 50 meet in an AIME-level final. It&apos;s free, and you
              can take it from anywhere.
            </p>
          </div>
          <ul className="o4-facts rv" style={css({ '--d': '120ms' })}>
            <li>
              Every stage runs twice, Saturday and Sunday, so you pick the day.
            </li>
            <li>
              Proctors watch your screen and your desk. They never need to see
              your face.
            </li>
          </ul>
        </div>
        <div className="o4-climb" data-climb={String(climb)}>
          <svg className="o4-svg" viewBox="0 0 1000 580" aria-hidden="true">
            <path
              className="o4-ground"
              d="M0 561C41.7 560.6 163.3 558.5 250 558.5C336.7 558.5 435 561.1 520 561.2C605 561.3 680 559.1 760 559C840 558.9 960 560.5 1000 560.8"
            />
            <g className="o4-steps">
              <path className="o4-step" d={O4_STEP1} />
              <path className="o4-step" d={O4_STEP2} />
              <path className="o4-step" d={O4_STEP3} />
            </g>
            <path
              className="o4-ar o4-ar1"
              pathLength={1}
              d="M300 284C304.3 276.3 314.3 250.7 326 238C337.7 225.3 354.3 213.3 370 208C385.7 202.7 411.7 206.3 420 206"
            />
            <path
              className="o4-ar o4-ah o4-ar1"
              pathLength={1}
              d="M407.5 214.2L420 206L406.8 198.8"
            />
            <path
              className="o4-ar o4-ar2"
              pathLength={1}
              d="M596 196C601 187 611.3 157 626 142C640.7 127 664.3 113.3 684 106C703.7 98.7 734 99.3 744 98"
            />
            <path
              className="o4-ar o4-ah o4-ar2"
              pathLength={1}
              d="M732.3 107.4L744 98L730.2 92"
            />
            <g className="o4-flag">
              <path
                className="o4-pole"
                d="M948 140C948.8 110 947.4 80 948 56"
              />
              <path
                className="o4-cloth"
                d="M948 56C962 51 974 61 988 63C976 70 962 78 948 78Z"
              />
            </g>
            <path
              className="o4-spk s1"
              d="M902 51Q904.7 63.3 917 66Q904.7 68.7 902 81Q899.3 68.7 887 66Q899.3 63.3 902 51Z"
            />
            <path
              className="o4-spk s2"
              d="M744 60Q745.8 68.2 754 70Q745.8 71.8 744 80Q742.2 71.8 734 70Q742.2 68.2 744 60Z"
            />
            <path
              className="o4-spk s3"
              d="M986 17Q987.6 24.4 995 26Q987.6 27.6 986 35Q984.4 27.6 977 26Q984.4 24.4 986 17Z"
            />
            <g className="o4-dots">
              {DOTS.map((d, n) => (
                <circle
                  key={n}
                  className={dotClass(d)}
                  r="10"
                  style={dotStyle(d)}
                />
              ))}
              <g className={dotClass(YOU, 'o4-you')} style={dotStyle(YOU)}>
                <image
                  href="/ug/img/panda-head.webp"
                  x="-24"
                  y="-30"
                  width="48"
                  height="48"
                />
                <text className="o4-you-l" x="0" y="-38">
                  you
                </text>
              </g>
            </g>
          </svg>
          <ol className="o4-stages">
            <li className="o4-st o4-st1">
              <p className="o4-k">Stage 1 · Nov 7 or 8</p>
              <p className="o4-lvl">AMC 10 level</p>
              <p className="o4-meta">
                20 multiple-choice problems in 60 minutes
              </p>
            </li>
            <li className="o4-cut o4-cut1">top 30% move on</li>
            <li className="o4-st o4-st2">
              <p className="o4-k">Stage 2 · Nov 14 or 15</p>
              <p className="o4-lvl">AMC 12 level</p>
              <p className="o4-meta">
                20 problems in 60 minutes, with no answer choices
              </p>
            </li>
            <li className="o4-cut o4-cut2">about 20 to 50 make the finals</li>
            <li className="o4-st o4-st3">
              <p className="o4-k">Finals · Nov 21</p>
              <p className="o4-lvl">AIME level</p>
              <p className="o4-meta">
                11 problems in 2.5 hours, the last one a tiebreaker
              </p>
            </li>
          </ol>
        </div>
        <p className="o4-wk rv">
          Hundreds of students from <b>32 countries</b> have signed up so far.
        </p>
      </div>
      <div className="o4-marq rv" style={css({ '--d': '80ms' })}>
        {ROWS.map((row, r) => (
          <div key={r} className={cx('o4-row', r === 1 && 'rev')}>
            <CountrySet row={row} offset={r * 16} />
            <CountrySet row={row} offset={r * 16} hidden />
          </div>
        ))}
      </div>
    </section>
  );
}
