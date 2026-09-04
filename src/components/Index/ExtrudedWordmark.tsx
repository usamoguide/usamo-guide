import * as React from 'react';

/**
 * The wordmark, set flat.
 *
 * It previously carried a stack of offset copies behind the face to read as a
 * moulded edge. That extrusion is gone: the type stands on its own weight, and
 * the only thing sitting on it now is the mascot.
 */

export default function ExtrudedWordmark({
  lead,
  trail,
}: {
  lead: string;
  trail: string;
}): JSX.Element {
  return (
    <div className="wordmark">
      <h1 className="wordmark__block">
        <span className="wordmark__face">
          <span className="wordmark__lead">{lead}</span>{' '}
          <span className="wordmark__trail-wrap">
            <span className="wordmark__trail">{trail}</span>
            {/* The site's mascot, perched on the end of the wordmark. Decorative,
                so it stays out of the accessibility tree — the name is already
                read from the face above. */}
            <img
              src="/images/Titlemascot.png"
              alt=""
              aria-hidden="true"
              className="wordmark__pet"
            />
          </span>
        </span>
      </h1>
    </div>
  );
}
