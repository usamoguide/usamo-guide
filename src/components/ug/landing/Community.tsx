import * as React from 'react';
import Btn from '../Btn';
import { UG_LINKS } from '../links';
import { css, IcoCode } from './util';

/** The team, with their photos (face-centred squares in static/ug/img/team). */
const TEAM: {
  name: string;
  role: string;
  photo: string;
  style: React.CSSProperties;
}[] = [
  {
    name: 'Pranav Ramesh',
    role: 'Founder & CEO',
    photo: '/ug/img/team/pranav.webp',
    style: css({ '--pk': 0 }),
  },
  {
    name: 'Spursh Deshpande',
    role: 'CTO',
    photo: '/ug/img/team/spursh.webp',
    style: css({ '--pk': 40, '--d': '80ms' }),
  },
  {
    name: 'Siddhant Arora',
    role: 'COO',
    photo: '/ug/img/team/siddhant.webp',
    style: css({ '--pk': 0, '--d': '160ms' }),
  },
  {
    name: 'Daniel Liao',
    role: 'CMO',
    photo: '/ug/img/team/daniel.webp',
    style: css({ '--pk': 40, '--d': '240ms' }),
  },
];

/** "Write the lesson you wish you'd had": contributing, and the team. */
export default function Community(): JSX.Element {
  return (
    <section className="sec community" id="community">
      <div className="dz dz-os" aria-hidden="true">
        <div className="dd-in rv" style={css({ '--d': '300ms' })}>
          <span className="stk taped">every line open source</span>
        </div>
      </div>
      <div className="wrap com-grid">
        <div className="com-copy">
          <h2 className="h2 rv" style={css({ '--d': '60ms' })}>
            Write the lesson you wish you&apos;d had.
          </h2>
          <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
            USAMO Guide is a student-run community for olympiad mathematics.
            Join us to write lessons, curate problem sets, and grow as a mentor
            alongside other contest students.
          </p>
          <div className="cta-row rv" style={css({ '--d': '180ms' })}>
            <Btn kind="p" href={UG_LINKS.github} target="_blank">
              <IcoCode />
              Contribute on GitHub
            </Btn>
            <Btn kind="s" href={UG_LINKS.discord} target="_blank">
              Join the Discord
            </Btn>
          </div>
          <p className="os-note rv" style={css({ '--d': '240ms' })}>
            <span className="os-dot" aria-hidden="true" />
            <span>
              Fully open source. Fork it, build on it, see how it works.
              Attribution required, commercial use not allowed.
            </span>
          </p>
        </div>
        <div className="team">
          <p className="team-k lbl rv">The team</p>
          <div className="team-grid">
            {TEAM.map(p => (
              <div key={p.name} className="person rv" style={p.style}>
                <img
                  className="p-photo"
                  src={p.photo}
                  alt={p.name}
                  width="64"
                  height="64"
                  loading="lazy"
                />
                <span className="p-name">{p.name}</span>
                <span className="p-role lbl">{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
