import { Link } from 'gatsby';
import * as React from 'react';

/**
 * The four tracks as tactile plates.
 *
 * Each is a physical object standing on the page, tilted slightly back with a
 * cast shadow, and each is a link through to its track. So the section is
 * navigation that happens to be pleasant, rather than an illustration with a
 * link bolted on.
 *
 * The tilt is fixed; only the lift and the shadow respond to hover. A plate
 * that rotates under the pointer stops reading as an object sitting on a
 * surface and starts reading as a card doing a trick.
 */

const TRACKS = [
  {
    path: '/foundations',
    face: 'F',
    name: 'Foundations',
    contest: 'AMC 8',
  },
  {
    path: '/intermediate',
    face: 'I',
    name: 'Intermediate',
    contest: 'AMC 10/12',
  },
  {
    path: '/advanced',
    face: 'A',
    name: 'Advanced',
    contest: 'AIME',
  },
  {
    path: '/usamo',
    face: 'O',
    name: 'Olympiad',
    contest: 'USA(J)MO',
  },
];

export default function TrackPlates(): JSX.Element {
  return (
    <section className="plates">
      <div className="plates__inner">
        <h2 className="plates__heading">Four tracks. Start anywhere.</h2>
        <p className="plates__lede">
          Each one assumes the one before it, and says so on every module.
        </p>

        <ul className="plates__row">
          {TRACKS.map((track, i) => (
            <li
              key={track.path}
              className="plates__item"
              style={{ ['--i' as string]: i }}
            >
              <Link to={track.path} className="plates__link">
                <span className="plates__key" aria-hidden="true">
                  <span className="plates__face">{track.face}</span>
                </span>
                <span className="plates__name">{track.name}</span>
                <span className="plates__contest">{track.contest}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
