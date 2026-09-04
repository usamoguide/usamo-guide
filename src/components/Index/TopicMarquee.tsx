import * as React from 'react';

/**
 * Drifting row of topic names.
 *
 * The track holds the list twice and translates by exactly -50%, so when the
 * animation loops the second copy is sitting where the first one started and
 * the seam is invisible — no measuring, no JS, and it survives any font or
 * viewport width. The duplicate is `aria-hidden` so a screen reader hears the
 * list once.
 */

const TOPICS = [
  'Counting & probability',
  'Number theory',
  'Euclidean geometry',
  'Functional equations',
  'Polynomials',
  'Complex numbers',
  'Inequalities',
  'Generating functions',
  'Combinatorial games',
  'Proof writing',
  'Trigonometry',
  'Modular arithmetic',
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul className="marquee-row" aria-hidden={ariaHidden || undefined}>
      {TOPICS.map(topic => (
        <li key={topic} className="marquee-item">
          <span>{topic}</span>
          <span className="marquee-dot" aria-hidden="true">
            ·
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TopicMarquee(): JSX.Element {
  return (
    <section className="marquee-section">
      <div className="marquee-section__inner">
        <h2 className="marquee-section__heading">Everything the guide covers.</h2>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          <Row />
          <Row ariaHidden />
        </div>
      </div>
    </section>
  );
}
