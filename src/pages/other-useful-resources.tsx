import {
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardListIcon,
  LightBulbIcon,
  TerminalIcon,
} from '@heroicons/react/outline';
import { PageProps } from 'gatsby';
import * as React from 'react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';

type ResourceLink = {
  name: string;
  href: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
};

type TopicResources = {
  topic: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  intro: string;
  imageSrc: string;
  imageAlt: string;
  links: ResourceLink[];
};

const RESOURCES: TopicResources[] = [
  {
    topic: 'Combinatorics',
    icon: ClipboardListIcon,
    intro:
      'Counting, casework, generating functions, and olympiad combinatorics training.',
    imageSrc:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80',
    imageAlt: 'Mathematical symbols and combinatorics notes on a chalkboard.',
    links: [
      {
        name: 'AoPS Intermediate Counting Course',
        href: 'https://artofproblemsolving.com/school/course/intermediatecounting',
        description:
          'Structured lessons and practice for permutations, combinations, and bijections.',
        imageSrc:
          'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Notebook with counting notes and a pen on a desk.',
      },
      {
        name: 'Yufei Zhao - Enumerative Combinatorics Notes',
        href: 'https://yufeizhao.com/olympiad/',
        description:
          'High-quality olympiad notes with clear combinatorial arguments and examples.',
        imageSrc:
          'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1280&q=80',
        imageAlt:
          'Open book and notes representing advanced combinatorics study.',
      },
      {
        name: 'Brilliant - Combinatorics Wiki',
        href: 'https://brilliant.org/wiki/combinatorics/',
        description:
          'Quick refreshers and concept overviews for counting fundamentals and beyond.',
        imageSrc:
          'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Handwritten combinatorics formulas and symbols on paper.',
      },
    ],
  },
  {
    topic: 'Algebra and Functional Equations',
    icon: LightBulbIcon,
    intro:
      'Polynomials, identities, inequalities, and functional equation techniques.',
    imageSrc:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1280&q=80',
    imageAlt: 'Notebook page with equations and algebraic expressions.',
    links: [
      {
        name: 'AoPS Intermediate Algebra Course',
        href: 'https://artofproblemsolving.com/school/course/intermediatealgebra',
        description:
          'Strong foundation for transformations, equations, and contest-level manipulations.',
        imageSrc:
          'https://images.unsplash.com/photo-1509869175650-a1d97972541a?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Math notebook with algebraic expressions.',
      },
      {
        name: 'Cut-the-Knot Algebra Collection',
        href: 'https://www.cut-the-knot.org/algebra.shtml',
        description:
          'A deep archive of algebra techniques, identities, and problem discussions.',
        imageSrc:
          'https://images.unsplash.com/photo-1635070041409-e63e783ce3c1?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Close-up of algebra equations written on a chalkboard.',
      },
      {
        name: 'IMOmath - Functional Equations',
        href: 'https://www.imomath.com/index.cgi?page=functionalEquations',
        description:
          'Olympiad-style functional equation problems sorted for focused practice.',
        imageSrc:
          'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Equation-filled page highlighting functional equation work.',
      },
    ],
  },
  {
    topic: 'Geometry',
    icon: AcademicCapIcon,
    intro:
      'Synthetic geometry, coordinate methods, and olympiad geometry problem solving.',
    imageSrc:
      'https://images.unsplash.com/photo-1509869175650-a1d97972541a?auto=format&fit=crop&w=1280&q=80',
    imageAlt: 'Compass and geometric sketches on paper.',
    links: [
      {
        name: 'Evan Chen - Euclidean Geometry in Mathematical Olympiads',
        href: 'https://web.evanchen.cc/geombook.html',
        description:
          'One of the best references for olympiad geometry with modern techniques.',
        imageSrc:
          'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Geometric diagram sketches and study notes.',
      },
      {
        name: 'AoPS Intro/Intermediate Geometry',
        href: 'https://artofproblemsolving.com/school/course/introductiongeometry',
        description:
          'Progressive geometry curriculum from foundational theorems to hard problems.',
        imageSrc:
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Student materials for geometry practice on a desk.',
      },
      {
        name: 'Geometry Revisited (Coxeter-Greitzer)',
        href: 'https://archive.org/details/geometryrevisite0000coxe',
        description:
          'Classic book that builds geometric intuition and proof-writing habits.',
        imageSrc:
          'https://images.unsplash.com/photo-1456518563096-0ff5ee08204e?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Classic textbook and notebook used for geometry learning.',
      },
    ],
  },
  {
    topic: 'Number Theory',
    icon: TerminalIcon,
    intro:
      'Divisibility, modular arithmetic, diophantine equations, and prime techniques.',
    imageSrc:
      'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1280&q=80',
    imageAlt: 'Page of handwritten equations related to number patterns.',
    links: [
      {
        name: 'AoPS Number Theory Course',
        href: 'https://artofproblemsolving.com/school/course/numbertheory',
        description:
          'A systematic path through foundational and advanced contest number theory.',
        imageSrc:
          'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Notebook with number sequences and arithmetic notes.',
      },
      {
        name: 'Paul Zeitz - Number Theory Handouts',
        href: 'https://web.evanchen.cc/handouts/ZeitzNT/ZeitzNT.pdf',
        description:
          'Excellent olympiad-focused problems and classic methods in one place.',
        imageSrc:
          'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Printed handouts and annotated number theory solutions.',
      },
      {
        name: 'Brilliant - Number Theory Wiki',
        href: 'https://brilliant.org/wiki/number-theory/',
        description: 'Useful concept summaries for quick recall and revision.',
        imageSrc:
          'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Study setup with number theory references and notes.',
      },
    ],
  },
  {
    topic: 'General Olympiad Training',
    icon: ChartBarIcon,
    intro:
      'Past papers, solution archives, strategy references, and broad practice sources.',
    imageSrc:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1280&q=80',
    imageAlt: 'Desk setup with planning sheets and study materials.',
    links: [
      {
        name: 'AoPS Wiki - AMC/AIME/USAMO Archives',
        href: 'https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions',
        description:
          'Official statements, community solutions, and historical contest collections.',
        imageSrc:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Organized contest prep notes and planning documents.',
      },
      {
        name: 'MAA Competitions',
        href: 'https://www.maa.org/math-competitions',
        description:
          'Contest logistics, dates, and official pages for US competition programs.',
        imageSrc:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Calendar and notebook for competition scheduling.',
      },
      {
        name: 'IMO Official Site - Problem Archive',
        href: 'https://www.imo-official.org/problems.aspx',
        description:
          'International Olympiad problems for stretching proof and strategy skills.',
        imageSrc:
          'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1280&q=80',
        imageAlt: 'Olympiad-style problem sheets laid out for training.',
      },
    ],
  },
];

function ResourceCard({
  topic,
  link,
  fallbackImageSrc,
  fallbackImageAlt,
  reverse,
}: {
  topic: string;
  link: ResourceLink;
  fallbackImageSrc: string;
  fallbackImageAlt: string;
  reverse: boolean;
}) {
  const imageSrc = link.imageSrc ?? fallbackImageSrc;
  const imageAlt = link.imageAlt ?? fallbackImageAlt;

  return (
    <article className="overflow-hidden rounded-2xl bg-[rgba(18,15,36,0.70)] backdrop-blur-sm">
      <div
        className={`grid items-start lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
      >
        <div className="relative h-56 max-h-[380px] sm:h-64 lg:h-80 xl:h-[360px]">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/25" />
          <div className="absolute right-3 bottom-3 rounded-md bg-[rgba(10,8,24,0.70)] px-2.5 py-1 text-xs font-medium tracking-wide text-[#F0C2FF] uppercase">
            {topic}
          </div>
        </div>

        <div className="flex flex-col justify-center px-5 py-6 sm:px-7">
          <h3 className="text-2xl font-black tracking-tight text-[#F4EDEA]">
            {link.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[rgba(244,237,234,0.72)] sm:text-base">
            {link.description}
          </p>
          <div className="mt-6">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-[rgba(240,194,255,0.30)] bg-[#70428A] px-4 py-2 text-sm font-semibold text-[#F4EDEA] transition hover:bg-[#8A52AA]"
            >
              Visit resource {'->'}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function TopicSection({
  topic,
  icon: Icon,
  intro,
  imageSrc,
  imageAlt,
  links,
}: TopicResources) {
  return (
    <section className="rounded-3xl bg-[rgba(10,8,24,0.35)] p-4 sm:p-5 lg:p-6">
      <div className="mb-5 rounded-2xl bg-[rgba(18,15,36,0.80)] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[rgba(112,66,138,0.35)] p-2 text-[#F0C2FF]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#F4EDEA] sm:text-5xl">
              {topic}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[rgba(244,237,234,0.72)] sm:text-base">
              {intro}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {links.map((link, index) => (
          <ResourceCard
            key={link.name}
            topic={topic}
            link={link}
            fallbackImageSrc={imageSrc}
            fallbackImageAlt={imageAlt}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}

// And update the header section:
export default function OtherUsefulResourcesPage(props: PageProps) {
  return (
    <Layout>
      <SEO title="Other Useful Resources" pathname={props.path} />

      <div
        data-page-tone="dark"
        className="min-h-screen text-[#F4EDEA]"
        style={{
          background: 'var(--bg-page)',
        }}
      >
        <TopNavigationBar linkLogoToIndex={true} redirectToDashboard={false} />

        <main className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="rounded-2xl bg-[rgba(18,15,36,0.80)] px-6 py-14 text-center backdrop-blur-sm sm:px-10 sm:py-20">
            <p className="text-sm font-semibold tracking-wide text-[#F0C2FF] uppercase">
              Community-curated links
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-[#F4EDEA] sm:text-6xl lg:text-7xl">
              Other Useful Resources
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-[rgba(244,237,234,0.72)] sm:text-lg">
              This page collects strong external resources for specific contest
              math topics. Use it as a companion to USAMO Guide when you want
              extra explanations, alternate problem sets, or deeper dives.
            </p>
          </header>

          <div className="mt-8 space-y-8">
            {RESOURCES.map(topic => (
              <TopicSection key={topic.topic} {...topic} />
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
