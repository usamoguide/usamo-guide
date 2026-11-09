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
import { IcoExternal } from '../components/ug/icons';
import { AppPageHead } from '../components/ug/pages/AppPage';

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

/** "https://www.example.com/path" -> "example.com" */
function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch (e) {
    return href;
  }
}

/** One link, drawn like a module row on the track page (`.tr-mod`). */
function ResourceRow({ link }: { link: ResourceLink }) {
  return (
    <li>
      <a className="ap-res" href={link.href} target="_blank" rel="noreferrer">
        <span className="ap-res-main">
          <span className="ap-res-t">{link.name}</span>
          <span className="ap-res-d">{link.description}</span>
          <span className="ap-res-h">{hostOf(link.href)}</span>
        </span>
        <IcoExternal />
      </a>
    </li>
  );
}

function TopicSection({ topic, intro, links }: TopicResources) {
  const id = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section className="ap-sec" id={id} aria-labelledby={`${id}-h`}>
      <div className="ap-sec-h">
        <p className="k-label">
          {links.length} {links.length === 1 ? 'resource' : 'resources'}
        </p>
        <h2 className="ap-sec-t" id={`${id}-h`}>
          {topic}
        </h2>
        <p className="ap-sec-d">{intro}</p>
      </div>
      <ul className="ap-res-list">
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
      <TopNavigationBar />

      <main className="wrap ap-page">
        <AppPageHead
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Other useful resources' },
          ]}
          k="Community-curated links"
          title="Other useful resources"
          lede="This page collects strong external resources for specific contest math topics. Use it as a companion to USAMO Guide when you want extra explanations, alternate problem sets, or deeper dives."
          meta={
            <>
              <span>
                <b>{RESOURCES.length}</b> topics
              </span>
              <span>
                <b>{RESOURCES.reduce((n, t) => n + t.links.length, 0)}</b> links
              </span>
            </>
          }
          pose="panda-read"
        >
          <nav className="ap-jump" aria-label="Topics">
            {RESOURCES.map(t => (
              <a
                key={t.topic}
                href={`#${t.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                {t.topic}
              </a>
            ))}
          </nav>
        </AppPageHead>

        <div className="ap-body">
          {RESOURCES.map(topic => (
            <TopicSection key={topic.topic} {...topic} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
