import * as React from 'react';
import Btn from '../Btn';
import { UG_LINKS } from '../links';
import { css, IcoChat } from './util';

const Word = ({ i, children }: { i: number; children: string }) => (
  <span className="hw" style={css({ '--i': i })}>
    {children}
  </span>
);

/** The headline, the waving panda, and the two calls to action. */
export default function Hero({
  hookRef,
}: {
  hookRef: React.RefObject<HTMLElement>;
}): JSX.Element {
  return (
    <section className="hero" id="top" ref={hookRef}>
      <div className="hero-doodles" aria-hidden="true">
        <div className="dd dd-sparks" style={css({ '--bd': '1.55s' })}>
          <svg className="dd-svg" viewBox="0 0 130 110">
            <path
              className="spk spk1"
              d="M44 26Q46.6 49.4 70 52Q46.6 54.6 44 78Q41.4 54.6 18 52Q41.4 49.4 44 26Z"
            />
            <path
              className="spk spk2"
              d="M98 9Q99.3 20.7 111 22Q99.3 23.3 98 35Q96.7 23.3 85 22Q96.7 20.7 98 9Z"
            />
            <path
              className="spk spk3"
              d="M102 75Q102.9 83.1 111 84Q102.9 84.9 102 93Q101.1 84.9 93 84Q101.1 83.1 102 75Z"
            />
          </svg>
        </div>
      </div>
      <div className="wrap hero-in">
        <h1 className="h1">
          <span className="h1-l1">
            <Word i={0}>Free,</Word> <Word i={1}>structured</Word>{' '}
            <Word i={2}>prep</Word>
            <span className="hero-fox" aria-hidden="true">
              <img
                className="hf-img"
                src="/ug/img/panda-wave.webp"
                alt=""
                width="450"
                height="464"
              />
              <span className="fox-bubble">hi! try a problem ↓</span>
            </span>
          </span>
          <br /> <Word i={3}>from</Word> <Word i={4}>AMC</Word>{' '}
          <Word i={5}>to</Word> <Word i={6}>USAMO.</Word>
        </h1>
        <p className="h-sub h-in" style={css({ '--d': '640ms' })}>
          Contest math without the gatekeeping.
        </p>
        <p className="lede h-in" style={css({ '--d': '800ms' })}>
          Lessons, problem sets and mock contests in one place, and every line
          of it is open source.
        </p>
        <div className="cta-row h-in" style={css({ '--d': '900ms' })}>
          <span className="hand-note" aria-hidden="true">
            <span>start here</span>
            <svg viewBox="0 0 62 42">
              <path d="M4 5C21 3 38 11 51 31" />
              <path d="M41 29l10.5 3.5 1.5-11" />
            </svg>
          </span>
          <Btn kind="p" size="lg" to={UG_LINKS.start} arrow>
            Start learning
          </Btn>
          <Btn kind="s" size="lg" href={UG_LINKS.discord} target="_blank">
            <IcoChat />
            Join the Discord
          </Btn>
        </div>
        <p className="eyebrow-pill h-in" style={css({ '--d': '1080ms' })}>
          Written by USA(J)MO medalists
        </p>
      </div>
    </section>
  );
}
