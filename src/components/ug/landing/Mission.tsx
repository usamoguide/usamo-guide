import * as React from 'react';
import { css } from './util';

const MANIFESTO =
  "Gatekept resources, unstructured learning, and courses that cost hundreds have kept olympiad math away from the rest of us. We're high schoolers who went through that ourselves. We have no intention of making money off you. We exist to promote equity in learning math.";

const WORDS = MANIFESTO.split(' ');

/** The deep purple manifesto; its words sharpen one by one as it scrolls up (--mp). */
export default function Mission(): JSX.Element {
  return (
    <section className="sec mission" id="mission">
      <div className="mi-geo" aria-hidden="true">
        <span className="mi-circle" />
      </div>
      <div className="dz dz-free" aria-hidden="true">
        <div className="dd-in rv" style={css({ '--d': '300ms' })}>
          <span className="stk taped">free, forever</span>
        </div>
      </div>
      <div className="wrap">
        <p className="mf" style={css({ '--n': WORDS.length })}>
          {WORDS.map((w, i) => (
            <React.Fragment key={i}>
              {i ? ' ' : null}
              <span className="w" style={css({ '--i': i })}>
                {w}
              </span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
