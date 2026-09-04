import { Link } from 'gatsby';
import * as React from 'react';

/**
 * The paired gloss panels: one bright, one deep.
 *
 * Both are opaque with a single specular top edge rather than blurred glass,
 * so they keep the depth of the reference without the translucency that makes
 * stacked panels turn to mud.
 */

const SAMPLE_PROBLEMS = [
  { name: 'Shoelace Theorem', track: 'INTERMEDIATE', level: 'Easy' },
  { name: 'Vieta Jumping', track: 'ADVANCED', level: 'Normal' },
  { name: 'Stars and Bars', track: 'INTERMEDIATE', level: 'Easy' },
  { name: 'Power of a Point', track: 'ADVANCED', level: 'Normal' },
  { name: 'Generating Functions', track: 'ADVANCED', level: 'Hard' },
  { name: 'Extremal Principle', track: 'OLYMPIAD', level: 'Hard' },
  { name: 'AIME Mock I', track: 'PRACTICE', level: 'Contest' },
];

const PROGRESS = [
  { label: 'Complete', pct: 46, ink: 'var(--heatmap-4)' },
  { label: 'In progress', pct: 24, ink: 'var(--heatmap-3)' },
  { label: 'Skipped', pct: 12, ink: 'var(--heatmap-2)' },
  { label: 'Not started', pct: 18, ink: 'var(--heatmap-empty)' },
];

const THREADS = [
  { q: 'How do I know when to try Vieta jumping?', n: 14 },
  { q: 'Cleanest proof of the Shoelace formula?', n: 9 },
  { q: 'AIME geometry: when is coordinates the wrong call?', n: 23 },
];

export default function GlossPanels(): JSX.Element {
  return (
    <section className="gloss-section">
      <div className="gloss-section__inner">
        <h2 className="gloss-section__heading">Read it, then solve it.</h2>

        <div className="gloss-section__grid">
          {/* ── Bright panel ── */}
          <article className="gloss gloss-light gloss-section__card">
            <div className="gloss-section__pad">
              <h3 className="gloss-section__title">
                Thousands of problems,
                <br />
                tagged by track.
              </h3>
              <p className="gloss-muted gloss-section__lede">
                Past AMC, AIME and olympiad rounds, each mapped to the module
                that teaches it and ordered by difficulty.
              </p>

              <div className="gloss-inner gloss-section__list">
                <div className="gloss-section__list-head">
                  <span className="gloss-section__mono">problems.by(track)</span>
                </div>
                {SAMPLE_PROBLEMS.map(p => (
                  <div key={p.name} className="gloss-row gloss-section__item">
                    <span className="gloss-section__item-name">{p.name}</span>
                    <span className="gloss-section__mono gloss-muted gloss-section__item-track">
                      {p.track}
                    </span>
                    <span className="gloss-tag">{p.level}</span>
                  </div>
                ))}
              </div>

              <Link to="/problems/" className="gloss-section__link">
                Browse the problem set
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </article>

          {/* ── Deep panel ── */}
          <article className="gloss gloss-dark gloss-section__card">
            <div className="gloss-section__pad">
              <h3 className="gloss-section__title">
                Know exactly
                <br />
                where you stopped.
              </h3>
              <p className="gloss-muted gloss-section__lede">
                Every module and problem carries a status, synced across your
                devices.
              </p>

              <div
                className="gloss-section__bar"
                role="img"
                aria-label="Example progress: 46% complete, 24% in progress, 12% skipped, 18% not started."
              >
                {PROGRESS.map(p => (
                  <span
                    key={p.label}
                    style={{ width: `${p.pct}%`, background: p.ink }}
                  />
                ))}
              </div>
              <dl className="gloss-section__legend">
                {PROGRESS.map(p => (
                  <div key={p.label}>
                    <dt className="gloss-muted">
                      <span
                        aria-hidden="true"
                        className="progress-swatch"
                        style={{ background: p.ink }}
                      />
                      {p.label}
                    </dt>
                    <dd className="gloss-section__mono">{p.pct}%</dd>
                  </div>
                ))}
              </dl>

              <h3 className="gloss-section__title gloss-section__title--second">
                Ask when you get stuck.
              </h3>

              <div className="gloss-section__threads">
                {THREADS.map(t => (
                  <div key={t.q} className="gloss-inner gloss-section__thread">
                    <span className="gloss-section__thread-q">{t.q}</span>
                    <span className="gloss-section__mono gloss-muted">
                      {t.n}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="https://discord.gg/WZge4DWUuy"
                target="_blank"
                rel="noopener noreferrer"
                className="gloss-section__link"
              >
                Join the Discord
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
