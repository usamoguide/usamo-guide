import { Link, PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

type Principle = {
  title: string;
  body: string;
  accent: string;
};

const principles: Principle[] = [
  {
    title: 'The door should be open.',
    body: 'Olympiad mathematics should not depend on knowing the right person, finding the right paywall, or starting with the right vocabulary. We collect the map, explain the landmarks, and keep the route free.',
    accent: '#ec3750',
  },
  {
    title: 'A path beats a pile.',
    body: 'A thousand problems are not a plan. Our tracks connect foundations to deeper ideas so every topic has a reason to be there and every next step feels possible.',
    accent: '#cf2de4',
  },
  {
    title: 'Struggle is part of the proof.',
    body: 'Hints, solutions, and worked examples are here to make effort productive, not to make every problem instant. The goal is a stronger solver, not a longer answer key.',
    accent: '#732de4',
  },
  {
    title: 'Students know the route.',
    body: 'USAMO Guide is shaped by people who have recently lived this preparation: the dead ends, the breakthroughs, and the difference one clear explanation can make.',
    accent: '#338eda',
  },
  {
    title: 'Competition can stay human.',
    body: 'Contests are useful when they create focus and community, not when they turn curiosity into a scoreboard. We make room for ambition and for learning at your own pace.',
    accent: '#5bc0de',
  },
  {
    title: 'Progress compounds quietly.',
    body: 'A new lemma, a cleaner proof, or one more attempt is real progress. We build tools and resources for the long arc from first ideas to confident mathematical writing.',
    accent: '#33d6a6',
  },
];

export default function PhilosophyPage(props: PageProps): JSX.Element {
  return (
    <Layout>
      <SEO
        title="Our Philosophy"
        description="Why USAMO Guide exists: to make olympiad mathematics structured, free, and open to every student."
        pathname={props.path}
      />

      <main className="philosophy-page">
        <section className="philosophy-hero">
          <div className="philosophy-navigation">
            <TopNavigationBar />
          </div>

          <div className="philosophy-shell philosophy-hero__inner">
            <h1 className="ultraline">MAKE</h1>
            <h1 className="ultraline ultraline--indent">THE HARD</h1>
            <h1 className="ultraline ultraline--center">THING</h1>
            <h1 className="ultraline ultraline--highlight">FINDABLE.</h1>
          </div>

          <div className="philosophy-seal">
            <span>USAMO GUIDE</span>
            <strong>AMC 8 → USAMO</strong>
          </div>

          <div className="philosophy-hero__grain" aria-hidden="true" />
        </section>

        <section className="philosophy-shell philosophy-content">
          <div className="philosophy-section__header">
            <p className="philosophy-kicker">A FEW THINGS WE KEEP IN MIND</p>
            <h2>Preparation is more than getting answers right.</h2>
          </div>

          <div className="philosophy-grid">
            {principles.map((principle, index) => (
              <article className="philosophy-card" key={principle.title}>
                <span
                  className="philosophy-card__num"
                  style={{ color: principle.accent }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 style={{ color: principle.accent }}>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>

          <div className="philosophy-cta">
            <div className="philosophy-cta__copy">
              <p className="philosophy-kicker philosophy-kicker--dark">
                YOUR NEXT STEP
              </p>
              <h3>Start where you are.</h3>
              <p>
                Pick a track, try a problem, or join the people building a more
                open math community.
              </p>
            </div>
            <div className="philosophy-cta__actions">
              <Link
                to="/foundations"
                className="philosophy-btn philosophy-btn--red"
              >
                Explore the tracks
              </Link>
              <a
                href="https://discord.gg/WZge4DWUuy"
                target="_blank"
                rel="noreferrer"
                className="philosophy-btn philosophy-btn--ghost"
              >
                Join the Discord
              </a>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .philosophy-page {
          background:
            radial-gradient(circle at 5% 8%, rgba(236, 55, 80, 0.12), transparent 34%),
            radial-gradient(circle at 95% 0%, rgba(255, 140, 55, 0.18), transparent 32%),
            var(--bg-page);
          color: var(--text-primary);
        }

        .philosophy-shell {
          width: min(960px, calc(100vw - 48px));
          margin: 0 auto;
        }

        .philosophy-hero {
          position: relative;
          overflow: hidden;
          color: #f4edea;
          background:
            radial-gradient(circle at 10% 8%, rgba(255, 255, 255, 0.22), transparent 34%),
            radial-gradient(circle at 90% 0%, rgba(255, 140, 55, 0.3), transparent 35%),
            linear-gradient(140deg, #17131b 0%, #201c36 55%, #ff3764 100%);
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%);
          padding: 122px 0 118px;
        }

        .philosophy-navigation {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          z-index: 4;
        }

        .philosophy-hero__inner {
          position: relative;
          z-index: 2;
        }

        .philosophy-hero__grain {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.05) 0,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 3px
          );
          opacity: 0.35;
          pointer-events: none;
        }

        .ultraline {
          margin: 0;
          font-family: var(--font-phantom);
          font-size: clamp(3.15rem, 7vw, 5rem);
          font-weight: 400;
          line-height: 0.9;
          letter-spacing: 0.015em;
          text-transform: uppercase;
        }

        .ultraline + .ultraline {
          margin-top: 0.08em;
        }

        .ultraline--indent {
          padding-left: clamp(1.4rem, 6vw, 6.2rem);
        }

        .ultraline--center {
          text-align: center;
        }

        .ultraline--highlight {
          position: relative;
          z-index: 1;
          padding-right: 0.2rem;
          text-align: right;
        }

        .ultraline--highlight::before {
          content: "";
          position: absolute;
          top: 52%;
          right: -0.3rem;
          z-index: -1;
          width: clamp(11.5rem, 30vw, 25rem);
          height: clamp(2.8rem, 6vw, 7.2rem);
          background: rgba(252, 252, 252, 0.34);
          clip-path: polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%);
          mix-blend-mode: screen;
          transform: translateY(-50%);
        }

        .philosophy-seal {
          position: absolute;
          bottom: calc(8% - 120px);
          left: 0;
          z-index: 3;
          display: flex;
          width: 220px;
          height: 220px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-top: 10px;
          padding-bottom: 100px;
          border-radius: 50%;
          background: #f4edea;
          color: #be1e3a;
          text-align: center;
          transform: rotate(2.3deg);
          transform-origin: left bottom;
        }

        .philosophy-seal span {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1;
        }

        .philosophy-seal strong {
          margin-top: 0.38rem;
          font-size: 1.3rem;
          font-weight: 800;
          line-height: 0.9;
        }

        .philosophy-content {
          width: min(1120px, calc(100vw - 48px));
          padding: 80px 0 96px;
        }

        .philosophy-kicker {
          margin: 0 0 12px;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .philosophy-section__header {
          margin-bottom: 36px;
        }

        .philosophy-section__header h2,
        .philosophy-cta__copy h3 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 400;
          line-height: 0.96;
        }

        .philosophy-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .philosophy-card {
          display: grid;
          gap: 14px;
          align-content: start;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--bg-surface);
          box-shadow: 0 18px 38px rgba(91, 52, 18, 0.1);
        }

        .philosophy-card__num {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .philosophy-card h3 {
          margin: 0;
          font-size: clamp(1.9rem, 2.6vw, 2.5rem);
          font-weight: 400;
          line-height: 0.98;
        }

        .philosophy-card p,
        .philosophy-cta__copy p {
          margin: 0;
          color: var(--text-muted);
          font-size: 1.05rem;
          line-height: 1.65;
        }

        .philosophy-cta {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 32px;
          align-items: center;
          margin-top: 18px;
          padding: 32px;
          border: 1px solid var(--border);
          border-radius: 32px;
          background: var(--bg-surface);
          box-shadow: 0 24px 60px rgba(91, 52, 18, 0.12);
        }

        .philosophy-cta__copy h3 {
          margin-bottom: 12px;
        }

        .philosophy-cta__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .philosophy-btn {
          display: inline-flex;
          min-height: 50px;
          align-items: center;
          justify-content: center;
          padding: 0 22px;
          border-radius: 999px;
          font-size: 1.05rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.15s ease;
        }

        .philosophy-btn:hover {
          transform: translateY(-2px);
        }

        .philosophy-btn--red {
          background: #ff3764;
          color: #f4edea;
        }

        .philosophy-btn--ghost {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-primary);
        }

        @media (max-width: 899px) {
          .philosophy-hero {
            padding: 108px 0 96px;
          }

          .philosophy-shell {
            width: calc(100vw - 36px);
          }

          .philosophy-seal {
            bottom: calc(8% - 93px);
            width: 170px;
            height: 170px;
            padding-top: 8px;
            padding-bottom: 77px;
            transform: rotate(2deg);
          }

          .philosophy-seal span {
            font-size: 0.72rem;
          }

          .philosophy-seal strong {
            font-size: 1.2rem;
          }

          .philosophy-content {
            padding: 58px 0 72px;
          }

          .philosophy-grid {
            grid-template-columns: 1fr;
          }

          .philosophy-cta {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 24px;
            border-radius: 24px;
          }

          .philosophy-card {
            padding: 22px;
          }
        }

        @media (max-width: 640px) {
          .ultraline {
            line-height: 1;
          }

          .ultraline--indent {
            padding-left: 1rem;
          }

          .philosophy-btn {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}
