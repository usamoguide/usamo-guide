import * as React from 'react';
import { UG_LINKS } from '../links';
import { MAA_URL } from './Ladder';
import { css, Ext, IcoMail } from './util';

export const CONTACT_EMAIL = 'contact@usamoguide.com';

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What are AMC, AIME, and USAMO?',
    a: (
      <>
        These are the big rungs of the US math competition ladder. AMC 8 is for
        middle schoolers and AMC 10/12 is for high schoolers, and both are
        25-question multiple-choice contests. Score well enough and you qualify
        for the AIME, a much harder 15-question exam with numerical answers. Do
        well on the AIME too and you&apos;re in USAMO (or USAJMO) territory,
        probably the toughest math test most high schoolers will ever take. For
        official dates and registration, check the{' '}
        <Ext href={MAA_URL}>MAA competitions page</Ext>.
      </>
    ),
  },
  {
    q: 'Is this an official syllabus?',
    a: (
      <>
        Nope. USAMO Guide is built by the community, for the community.
        It&apos;s our best attempt at organizing what actually works for AMC,
        AIME, and USAMO prep, and it isn&apos;t blessed by the MAA :/ Think of
        it as notes passed down and refined by people who&apos;ve been through
        the process. It keeps getting better as more people chip in.
      </>
    ),
  },
  {
    q: 'I found a bug, typo, or confusing explanation. What do I do?',
    a: (
      <>
        Tell us! Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        If you&apos;re comfortable with GitHub, you can also open an issue on
        our <Ext href={UG_LINKS.githubIssues}>repository</Ext>, which is often
        the fastest way to get something fixed.
      </>
    ),
  },
  {
    q: 'I want live classes or one-on-one tutoring.',
    a: (
      <>
        That&apos;s not really what we do. We&apos;re a self-paced resource, and
        AoPS runs solid online classes if you want live instruction. If you
        still want structure and other people around, join one of our study
        groups or hop into a weekly mock contest to practice under real
        conditions.
      </>
    ),
  },
  {
    q: 'Do I need to be good at math, or qualified for USAMO, to use this?',
    a: (
      <>
        Not even close. Start on day one of AMC 8 prep or show up already
        grinding toward USAMO. Either way there&apos;s a place for you here. The
        material ramps from the basics up to olympiad level, so you can jump in
        wherever you actually are.
      </>
    ),
  },
  {
    q: "Where can I get help when I'm stuck?",
    a: (
      <>
        Our <Ext href={UG_LINKS.discord}>Discord</Ext> is the best place. People
        are usually around to help with a specific problem or concept. Beyond
        that, you can join a study group, get paired with a mentor, or email us
        if it&apos;s a question about the Guide itself.
      </>
    ),
  },
  {
    q: 'How can I contribute?',
    a: (
      <>
        Please do. Fix a typo, rewrite a confusing explanation, add a problem,
        improve a diagram, or clean up some code. It all helps. Our{' '}
        <Ext href={UG_LINKS.github}>GitHub</Ext> has contribution guidelines and
        open issues.
      </>
    ),
  },
  {
    q: 'Is this open source?',
    a: (
      <>
        Yes, all of it! Fork it, build on it, poke around and see how it works.
        Nothing&apos;s hidden. Attribution is required, and commercial use
        isn&apos;t allowed.
      </>
    ),
  },
];

/** Frequently asked questions: native <details>, animated open and closed by CSS. */
export default function Faq(): JSX.Element {
  return (
    <section className="sec faq" id="faq">
      <div className="wrap faq-grid">
        <div className="faq-aside">
          <h2 className="h2 rv" style={css({ '--d': '60ms' })}>
            Frequently asked questions
          </h2>
          <p className="sec-lede rv" style={css({ '--d': '120ms' })}>
            The essentials about the competition path, how the Guide works, and
            how to get involved.
          </p>
          <a
            className="mail rv"
            style={css({ '--d': '180ms' })}
            href={`mailto:${CONTACT_EMAIL}`}
          >
            <IcoMail />
            {CONTACT_EMAIL}
          </a>
          <img
            className="faq-fox rv"
            style={css({ '--d': '240ms' })}
            src="/ug/img/panda-think.webp"
            alt=""
            width="450"
            height="464"
          />
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              className="faq-item rv"
              style={i ? css({ '--d': `${i * 50}ms` }) : undefined}
            >
              <summary>
                <span>{f.q}</span>
                <span className="pm" aria-hidden="true" />
              </summary>
              <div className="ans">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
