import * as React from 'react';
import Btn from '../Btn';
import { UG_LINKS } from '../links';
import { css } from './util';

/** "Your second home for contest math": the closing purple band. */
export default function ClosingCta(): JSX.Element {
  return (
    <section className="cta" aria-labelledby="ug-cta-h">
      <div className="cta-geo" aria-hidden="true">
        <span className="cg c3" />
        <span className="cg c2" />
        <span className="cg c1" />
      </div>
      <div className="wrap cta-in">
        <div className="cta-art rv">
          <img
            className="cta-fox"
            src="/ug/img/panda-idea.webp"
            alt=""
            width="450"
            height="464"
          />
          <span className="cta-spk" aria-hidden="true">
            <svg className="dd-svg" viewBox="0 0 90 70">
              <path
                className="spk spk1"
                d="M30 20Q31.8 36.2 48 38Q31.8 39.8 30 56Q28.2 39.8 12 38Q28.2 36.2 30 20Z"
              />
              <path
                className="spk spk2"
                d="M70 7Q70.9 15.1 79 16Q70.9 16.9 70 25Q69.1 16.9 61 16Q69.1 15.1 70 7Z"
              />
            </svg>
          </span>
        </div>
        <h2 className="cta-h rv" id="ug-cta-h">
          Your second home for contest math.
        </h2>
        <p className="cta-p rv" style={css({ '--d': '80ms' })}>
          Lessons, resources, problem sets, and community support in one place,
          for AMC, AIME, and olympiad prep.
        </p>
        <div className="cta-row cta-row-c rv" style={css({ '--d': '160ms' })}>
          <Btn kind="w" size="lg" to={UG_LINKS.start} arrow>
            Start learning
          </Btn>
          <Btn kind="o" size="lg" href={UG_LINKS.discord} target="_blank">
            Join the Discord
          </Btn>
        </div>
      </div>
    </section>
  );
}
