import { PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

type ResourceLink = {
  name: string;
  href: string;
  description: string;
};

type TopicResources = {
  topic: string;
  intro: string;
  links: ResourceLink[];
};

const RESOURCES: TopicResources[] = [
  {
    topic: 'Combinatorics',
    intro:
      'Counting, casework, generating functions, and olympiad combinatorics training.',
    links: [
      {
        name: 'AoPS Intermediate Counting Course',
        href: 'https://artofproblemsolving.com/school/course/intermediatecounting',
        description:
          'Structured lessons and practice for permutations, combinations, and bijections.',
      },
      {
        name: 'Yufei Zhao - Enumerative Combinatorics Notes',
        href: 'https://yufeizhao.com/olympiad/',
        description:
          'High-quality olympiad notes with clear combinatorial arguments and examples.',
      },
      {
        name: 'Brilliant - Combinatorics Wiki',
        href: 'https://brilliant.org/wiki/combinatorics/',
        description:
          'Quick refreshers and concept overviews for counting fundamentals and beyond.',
      },
    ],
  },
  {
    topic: 'Algebra and Functional Equations',
    intro:
      'Polynomials, identities, inequalities, and functional equation techniques.',
    links: [
      {
        name: 'AoPS Intermediate Algebra Course',
        href: 'https://artofproblemsolving.com/school/course/intermediatealgebra',
        description:
          'Strong foundation for transformations, equations, and contest-level manipulations.',
      },
      {
        name: 'Cut-the-Knot Algebra Collection',
        href: 'https://www.cut-the-knot.org/algebra.shtml',
        description:
          'A deep archive of algebra techniques, identities, and problem discussions.',
      },
      {
        name: 'IMOmath - Functional Equations',
        href: 'https://www.imomath.com/index.cgi?page=functionalEquations',
        description:
          'Olympiad-style functional equation problems sorted for focused practice.',
      },
    ],
  },
  {
    topic: 'Geometry',
    intro:
      'Synthetic geometry, coordinate methods, and olympiad geometry problem solving.',
    links: [
      {
        name: 'Evan Chen - Euclidean Geometry in Mathematical Olympiads',
        href: 'https://web.evanchen.cc/geombook.html',
        description:
          'One of the best references for olympiad geometry with modern techniques.',
      },
      {
        name: 'AoPS Intro/Intermediate Geometry',
        href: 'https://artofproblemsolving.com/school/course/introductiongeometry',
        description:
          'Progressive geometry curriculum from foundational theorems to hard problems.',
      },
      {
        name: 'Geometry Revisited (Coxeter-Greitzer)',
        href: 'https://archive.org/details/geometryrevisite0000coxe',
        description:
          'Classic book that builds geometric intuition and proof-writing habits.',
      },
    ],
  },
  {
    topic: 'Number Theory',
    intro:
      'Divisibility, modular arithmetic, diophantine equations, and prime techniques.',
    links: [
      {
        name: 'AoPS Number Theory Course',
        href: 'https://artofproblemsolving.com/school/course/numbertheory',
        description:
          'A systematic path through foundational and advanced contest number theory.',
      },
      {
        name: 'Paul Zeitz - Number Theory Handouts',
        href: 'https://web.evanchen.cc/handouts/ZeitzNT/ZeitzNT.pdf',
        description:
          'Excellent olympiad-focused problems and classic methods in one place.',
      },
      {
        name: 'Brilliant - Number Theory Wiki',
        href: 'https://brilliant.org/wiki/number-theory/',
        description: 'Useful concept summaries for quick recall and revision.',
      },
    ],
  },
  {
    topic: 'General Olympiad Training',
    intro:
      'Past papers, solution archives, strategy references, and broad practice sources.',
    links: [
      {
        name: 'AoPS Wiki - AMC/AIME/USAMO Archives',
        href: 'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
        description:
          'Official statements, community solutions, and historical contest collections.',
      },
      {
        name: 'MAA Competitions',
        href: 'https://www.maa.org/math-competitions',
        description:
          'Contest logistics, dates, and official pages for US competition programs.',
      },
      {
        name: 'IMO Official Site - Problem Archive',
        href: 'https://www.imo-official.org/problems.aspx',
        description:
          'International Olympiad problems for stretching proof and strategy skills.',
      },
    ],
  },
];

/** Bare hostname, so each row says where it actually sends you. */
function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * One resource per row.
 *
 * This is a reference index, not a gallery: the reader is scanning fifteen
 * links for the one they want, so every row is the same height and the eye
 * only has to travel down a single column of names. The destination host is
 * shown because "is this the AoPS one or the Evan Chen one" is the actual
 * question being asked.
 */
function ResourceRow({ link }: { link: ResourceLink }) {
  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className="resource-row group"
      >
        <span className="resource-row__name">{link.name}</span>
        <span className="resource-row__desc">{link.description}</span>
        <span className="resource-row__host">
          {domainOf(link.href)}
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="resource-row__arrow"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4" />
          </svg>
        </span>
      </a>
    </li>
  );
}

function TopicSection({ topic, intro, links }: TopicResources) {
  return (
    <section className="resource-topic">
      <div className="resource-topic__head">
        <h2 className="resource-topic__title">{topic}</h2>
        <p className="resource-topic__intro">{intro}</p>
      </div>
      <ul className="resource-topic__list">
        {links.map(link => (
          <ResourceRow key={link.name} link={link} />
        ))}
      </ul>
    </section>
  );
}

export default function OtherUsefulResourcesPage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Other Useful Resources" pathname={props.path} />

      <div
        data-page-tone="dark"
        className="min-h-screen"
        style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
      >
        <TopNavigationBar linkLogoToIndex={true} redirectToDashboard={false} />

        <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <header className="max-w-2xl">
            <h1
              className="text-4xl font-bold tracking-[-0.03em] text-balance sm:text-5xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Other useful resources
            </h1>
            <p
              className="mt-4 text-base leading-7 text-pretty"
              style={{ color: 'var(--text-secondary)' }}
            >
              External material worth your time, grouped by topic. Everything
              here is maintained by someone else — we just vouch for it.
            </p>
          </header>

          <div className="mt-14 space-y-14">
            {RESOURCES.map(topic => (
              <TopicSection key={topic.topic} {...topic} />
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
