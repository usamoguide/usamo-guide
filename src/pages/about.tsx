import { PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

export default function AboutPage(props: PageProps) {
  return (
    <Layout>
      <SEO
        title="About"
        description="Learn what USAMO Guide is, why it exists, and how we help students prepare for AMC, AIME, and USAMO."
        image={null}
        pathname={props.path}
      />

      <TopNavigationBar />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <main className="mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-[var(--text-primary)]">
              Umm, so what is this "USAMO Guide" that everyone is talking about?
            </h1>
            <p className="mt-3 text-lg text-[var(--text-secondary)]">
              USAMO Guide is a free, structured learning platform that helps
              students progress from early contest problem solving to
              Olympiad-level proof writing.
            </p>
          </header>

          <section className="space-y-4 text-lg text-[var(--text-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Why do we exist / Our Philosophy
            </h2>
            <p>
              What we do at USAMO Guide is take away the barriers of learning
              Math. <br />
              We have a chance to change the way all of us think about preparing
              for math olympiads. <br />
              Gatekept Resources, Unstructured Learning and Online Courses that
              cost $$$ have kept Learning Olympiad maths restricted away from
              the rest of us. <br />
              We think we have a chance to make a difference. <br />
            </p>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[var(--text-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Okayyyy! I see y'all are ambitious, but what have you actually
              achieved till now?
            </h2>
            <p>
              Well, we have helped 130k+ students with getting all the resources
              they would ever need!, Here's a small list of what we give!
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Structured learning tracks for AMC 8, AMC 10/12, AIME, and
                USAMO.
              </li>
              <li>Curated resources, explanations, and topic guidance.</li>
              <li>Extensive problem sets with full solutions and hints.</li>
              <li>Mock exams and contests through our contests platform.</li>
              <li>Progress tracking and study planning tools.</li>
            </ul>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[var(--text-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              What makes us different
            </h2>
            <p>
              USAMO Guide is made by HIGHSCHOOLERS. <br />
              Ones that have went through the experience how it felt to try
              prepare for olympiads without any resources, Ones that did so
              super recently. <br />
              The adults who are in teaching do so for profit, They gotta earn
              some way or the other, don't they? We dont. We have no intention
              to make money off of you, We couldn't possibly gain anything by
              doing so. The only reason we exist is to help promote equity in
              learning math.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Clear roadmaps that connect foundational topics to proof
                writing.
              </li>
              <li>Community-driven updates and feedback loops.</li>
              <li>Free access to the full curriculum.</li>
              <li>
                Biweekly Contests that make sure you are preppared on test day.
              </li>
            </ul>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[var(--text-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Our aims</h2>
            <p>
              We aim to make olympiad preparation less intimidating by breaking
              it into achievable steps, helping students build confidence, and
              supporting long-term mathematical growth.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[var(--text-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Get involved</h2>
            <p>
              Spot a gate we missed? Help us break it. <br />
              Open a PR on GitHub, DM the admins on Discord, or email
              team@usamoguide.com. However you reach us, It's fine! You're not
              just giving feedback, you're holding the door open for another
              kid!
            </p>
          </section>
        </main>
      </div>
    </Layout>
  );
}
