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
            <h1 className="text-4xl font-extrabold text-[#F4EDEA]">
              About USAMO Guide
            </h1>
            <p className="mt-3 text-lg text-[rgba(244,237,234,0.80)]">
              USAMO Guide is a free, structured learning platform that helps
              students progress from early contest problem solving to
              Olympiad-level proof writing.
            </p>
          </header>

          <section className="space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <h2 className="text-2xl font-bold text-[#F4EDEA]">Our mission</h2>
            <p>
              We believe every motivated student should have access to
              high-quality olympiad preparation. USAMO Guide organizes the best
              resources, problem sets, and solutions into a single learning
              path.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <h2 className="text-2xl font-bold text-[#F4EDEA]">What we offer</h2>
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

          <section className="mt-10 space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <h2 className="text-2xl font-bold text-[#F4EDEA]">
              What makes us different
            </h2>
            <p>
              USAMO Guide is built by olympiad veterans and educators who care
              about clarity, accessibility, and progression. We focus on
              sequencing topics, highlighting common pitfalls, and giving
              students the right practice at the right time.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Clear roadmaps that connect foundational topics to proof
                writing.
              </li>
              <li>Community-driven updates and feedback loops.</li>
              <li>Free access to the full curriculum.</li>
            </ul>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <h2 className="text-2xl font-bold text-[#F4EDEA]">Our aims</h2>
            <p>
              We aim to make olympiad preparation less intimidating by breaking
              it into achievable steps, helping students build confidence, and
              supporting long-term mathematical growth.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-lg text-[rgba(244,237,234,0.80)]">
            <h2 className="text-2xl font-bold text-[#F4EDEA]">Get involved</h2>
            <p>
              We welcome feedback, suggestions, and community contributions. If
              you want to help improve the guide or share resources, reach out
              through our contact page or join the community discussions.
            </p>
          </section>
        </main>
      </div>
    </Layout>
  );
}
