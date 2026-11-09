import * as React from 'react';
import { MARK_PATHS, MARK_VIEWBOX } from './markPaths';

/** The <symbol id="ug-mark"> every .mark <use> points at. Rendered once per page by Layout. */
export default function MarkDefs(): JSX.Element {
  return (
    <svg className="ug-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="ug-mark" viewBox={MARK_VIEWBOX}>
          {MARK_PATHS.map(([fill, d]) => (
            <path key={fill} style={{ fill: `var(${fill})` }} d={d} />
          ))}
        </symbol>
      </defs>
    </svg>
  );
}

export function Mark(): JSX.Element {
  return (
    <svg className="mark" viewBox="0 0 100 100" aria-hidden="true">
      <use className="mark-spin" href="#ug-mark" width="100" height="100" />
    </svg>
  );
}
