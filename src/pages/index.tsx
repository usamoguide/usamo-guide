import { useLocation } from '@gatsbyjs/reach-router';
import classNames from 'classnames';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { Link, navigate } from 'gatsby';
import * as React from 'react';
import { Github, Instagram, Twitter } from 'lucide-react';
import AetherFlowHero from '../components/Index/AetherFlowHero';
import { Feature } from '../components/Index/Feature';
import { ProblemsetsFeature } from '../components/Index/features/ProblemsetsFeature';
import { ProgressTrackingFeature } from '../components/Index/features/ProgressTrackingFeature';
import { ResourcesFeature } from '../components/Index/features/ResourcesFeature';
import LightRays from '../components/Index/LightRays';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../context/UserDataContext/UserDataContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Index-only DARK palette:
 * - Background: midnight navy-ish
 * - Accents/content: vanilla + purple
 *
 * Requested update (image2):
 * - Use the sampled deep purple (~#70428A) for:
 *   - “AMC to Olympiad” text
 *   - “Browse Topics” button background
 * - Remove glow around “Browse Topics” (no GlowingRing wrapper, no shadow)
 */
/* Every page shares one base background; see --bg-page in src/styles/theme.css. */
const PAGE_BG = 'var(--bg-page)';

const VANILLA = '#F4EDEA';
const MAUVE = '#F0C2FF';

const TEXT_PRIMARY = VANILLA;
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.78)';
const TEXT_MUTED = 'rgba(244, 237, 234, 0.62)';
const FAQ_CARD_STYLE: React.CSSProperties = {
  background: 'var(--card-bg)',
  color: TEXT_PRIMARY,
};
const footerSocialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/usamoguide',
    icon: Instagram,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/usamoguide',
    icon: Twitter,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/usamoguide/usamo-guide',
    icon: Github,
  },
] as const;

const containerClasses = 'max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8';

const builderProfiles = [
  { name: 'Pranav Ramesh', role: 'Founder & CEO', imageSrc: 'images/Founder_Pranav.jpg' },
  { name: 'Spursh Deshpande', role: 'CTO', imageSrc: 'images/CTO.jpeg' },
  { name: 'Siddhant Arora', role: 'COO', imageSrc: 'images/COO.png' },
  { name: 'Daniel Liao', role: 'CMO', imageSrc: 'images/CMO.jpeg' },
];

const partners = [
  {
    name: 'YIMO',
    href: 'https://www.yimo-official.org/',
    imageSrc: '/images/yimo-logo.png',
  },
  {
    name: 'Mustang Math',
    href: 'https://www.mustangmath.com/',
    imageSrc: '/images/mustang-math-logo.png',
  },
] as const;

function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.1);
  return (
    <div
      ref={ref}
      className={classNames(
        'transition-all duration-700 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FaqCard({
  id,
  question,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  question: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6 text-left" style={FAQ_CARD_STYLE}>
      <div className="flex items-start justify-between gap-4">
        <dt
          className="text-lg leading-6 font-medium"
          style={{ color: TEXT_PRIMARY }}
        >
          {question}
        </dt>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={onToggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#F0C2FF] transition hover:bg-white/5 hover:text-[#F4EDEA] focus:outline-none focus:ring-2 focus:ring-[#F0C2FF]/60"
        >
          {isOpen ? (
            <ChevronDownIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
          <span className="sr-only">{isOpen ? 'Close answer' : 'Open answer'}</span>
        </button>
      </div>
      {isOpen && (
        <dd id={`${id}-content`} className="mt-2 pr-10">
          {children}
        </dd>
      )}
    </div>
  );
}

export default function IndexPage({ path }): JSX.Element {
  const currentUser = useCurrentUser();
  const loading = useIsUserDataLoaded();
  const location = useLocation();
  const [openFaqs, setOpenFaqs] = React.useState<Record<string, boolean>>({
    amc: true,
    syllabus: true,
    bug: true,
    tutoring: true,
    qualify: true,
    help: true,
    contribute: true,
    source: true,
  });

  React.useEffect(() => {
    try {
      if (currentUser && location.state.redirect) navigate('/dashboard');
    } catch (e) {
      if (currentUser) navigate('/dashboard');
    }
  }, [currentUser, loading, location]);

  React.useEffect(() => {
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const prevHtmlOverscrollY = htmlStyle.overscrollBehaviorY;
    const prevBodyOverscrollY = bodyStyle.overscrollBehaviorY;

    htmlStyle.overscrollBehaviorY = 'none';
    bodyStyle.overscrollBehaviorY = 'none';

    return () => {
      htmlStyle.overscrollBehaviorY = prevHtmlOverscrollY;
      bodyStyle.overscrollBehaviorY = prevBodyOverscrollY;
    };
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const linkStyle: React.CSSProperties = {
    color: MAUVE,
    textDecoration: 'none',
    fontWeight: 700,
  };

  const footerLinkStyle: React.CSSProperties = {
    color: 'rgba(244, 237, 234, 0.84)',
    textDecoration: 'none',
    fontWeight: 500,
  };

  const footerButtonStyle: React.CSSProperties = {
    border: '1px solid rgba(240, 194, 255, 0.34)',
    background: '#EFE3FF',
    boxShadow: 'none',
    '--pme-color': '#2C1842',
    '--pme-hover-color': '#201C36',
    '--pme-wipe-bg': '#F0C2FF',
  } as React.CSSProperties;

  const sectionHeadingClasses =
    'mx-auto flex max-w-4xl flex-col items-center text-center text-4xl font-bold tracking-tight md:text-5xl 2xl:text-6xl';
  const sectionSubtitleClasses =
    'mx-auto max-w-3xl text-center text-lg font-medium leading-relaxed md:text-xl 2xl:text-2xl';

  return (
    <Layout>
      <SEO title={null} image={null} pathname={path} />

      <div className="fixed top-0 z-50 w-full">
        <div className="backdrop-blur-lg">
          <TopNavigationBar hidePromoBar />
        </div>
      </div>

      {/* Begin Hero */}
      <AetherFlowHero />
      {/* End Hero */}

      {/* Wave transition: dark base */}
      <div
        className="pointer-events-none overflow-hidden leading-[0]"
        style={{ backgroundColor: PAGE_BG }}
      >
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="block h-16 w-full md:h-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,80 C300,80 400,0 600,0 C800,0 900,80 1200,80 L1200,0 L0,0 Z"
            style={{ fill: PAGE_BG }}
          />
        </svg>
      </div>

      {/* Below hero: keep dark background but page-owned text stays vanilla/purple */}
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        <div className="h-6 sm:h-10 md:h-16 2xl:h-24"></div>

        <RevealSection className="px-6 sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-6xl items-center justify-center gap-8 pb-3 md:grid-cols-[auto_auto] md:gap-x-10 md:pl-8 lg:gap-x-14 lg:pl-10">
            <div className="flex min-w-0 flex-col items-center">
              <h2
                className="text-center text-5xl font-bold md:text-6xl md:whitespace-nowrap xl:text-7xl"
                style={{ color: TEXT_PRIMARY }}
              >
                Learn Contest Math
              </h2>
              <p
                className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed font-medium md:text-xl 2xl:text-2xl"
                style={{ color: TEXT_SECONDARY }}
              >
                Carefully designed for math contest students - available to
                everyone, for free.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/Lovemascot.png"
                alt="Lovemascot"
                className="h-32 w-auto shrink-0 object-contain md:h-40 lg:h-48 xl:h-56"
              />
            </div>
          </div>
        </RevealSection>

        <div className={containerClasses}>
          <div className="h-12 md:h-20 2xl:h-36"></div>

          {/* Imported components may still have their own colors internally */}
          <RevealSection delay={100}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Feature
                iconSrc="/images/feature-resources.png"
                iconFallbackSrc="https://i.ibb.co/TD2gjPwB/feature-resources.png"
                iconAlt="Resources icon"
                iconClasses="bg-black"
                title="Curated Resources"
                blobClasses="[background-color:rgb(99,84,139)] hidden xl:block"
                feature={<ResourcesFeature />}
                fade="none"
              >
                Learn new topics from a vetted list of high-quality resources.
                If one resource doesn't click, look at another!
                <span className="mt-3 block">
                  <Link to="/foundations" style={linkStyle}>
                    Explore Foundations Resources
                  </Link>
                </span>
              </Feature>

              <Feature
                iconSrc="/images/feature-problemsets.png"
                iconFallbackSrc="https://i.ibb.co/S7mV5P3x/feature-problemsets.png"
                iconAlt="Problemsets icon"
                iconClasses="bg-black"
                title="Extensive Problemsets"
                blobClasses="bg-black"
                feature={<ProblemsetsFeature />}
                fade="none"
              >
                Practice each topic with extensive problemsets and solutions
                covering a wide range of difficulties.
                <span className="mt-3 block">
                  <Link to="/problems" style={linkStyle}>
                    Go to Problems Page
                  </Link>
                </span>
              </Feature>
            </div>
          </RevealSection>

          <div className="h-6 md:h-10 2xl:h-24"></div>

          <RevealSection delay={150}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Feature
                iconSrc="/images/feature-progress.png"
                iconFallbackSrc="https://i.ibb.co/hJbCbhn9/feature-progress.png"
                iconAlt="Progress tracking icon"
                iconClasses="bg-black"
                title="Progress Tracking"
                blobClasses="[background-color:rgb(99,84,139)]"
                feature={<ProgressTrackingFeature />}
                fade="none"
              >
                Use our progress-tracking tools to track your progress in the
                Guide and stay motivated.
                <span className="mt-3 block">
                  <Link to="/dashboard" style={linkStyle}>
                    Open Dashboard
                  </Link>
                </span>
              </Feature>

              <Feature
                iconSrc="/images/feature-community.png"
                iconFallbackSrc="https://i.ibb.co/gLmZWq6n/feature-community.png"
                iconAlt="Community help icon"
                iconClasses="bg-black"
                title="Help when you need it"
                blobClasses="bg-green-200 dark:bg-green-800"
                feature={<div className=""></div>}
                fade="none"
              >
                <span className="mb-4 block md:mb-8">
                  Ask questions, share solutions, and learn from other contest
                  students in our Discord community.
                </span>

                <a
                  href="https://discord.gg/X2zx6u53XH"
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  Visit Discord Community →
                </a>
              </Feature>
            </div>
          </RevealSection>

          <div className="h-16 md:h-20 2xl:h-36"></div>
        </div>
      </div>
      
      {/* Section divider */}
      <div
        className="pointer-events-none mx-auto w-2/3"
        style={{
          height: '1px',
          background: 'rgba(197, 139, 255, 0.45)',
        }}
      />
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        {/* Light rays effect from divider line */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <LightRays
            raysOrigin="top-center"
            raysColor="#bd9ee5"
            raysSpeed={0.8}
            lightSpread={0.5}
            rayLength={2.5}
            pulsating={true}
            fadeDistance={1}
            saturation={0.9}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.05}
            distortion={0.1}
            className="custom-rays"
          />
        </div>
        <div className="relative z-10">
          <div className="h-16 md:h-24"></div>
          <div className={containerClasses}>
            <RevealSection>
              <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 text-center">
                <div className="max-w-4xl">
                  <h2
                    className="text-center text-3xl font-bold tracking-tight md:text-4xl 2xl:text-5xl"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    Contribute to the Community.
                  </h2>
                  <div className="h-5"></div>
                  <p
                    className="mx-auto max-w-2xl text-center text-lg leading-relaxed md:text-xl"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    USAMO Guide is a student-run community dedicated to olympiad
                    mathematics. Join us to write lessons, curate problem sets,
                    and grow as a mentor alongside fellow contest enthusiasts.
                  </p>
                  <div className="h-7 md:h-9"></div>
                  <div className="flex justify-center">
                    <a
                      href="https://docs.google.com/document/d/1AUNOq6OlVcSZN_gUPfvyhimlh9hA4GNvNaLdzyflX_8/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      className="purple-motion-effect inline-flex items-center justify-center rounded-full px-7 py-3 font-mono text-base leading-tight font-bold"
                      style={
                        {
                          border: '1px solid rgba(240, 194, 255, 0.34)',
                          background: '#6D3B9F',
                          '--pme-color': '#F4EDEA',
                          '--pme-hover-color': '#201C36',
                          '--pme-wipe-bg': '#F0C2FF',
                        } as React.CSSProperties
                      }
                    >
                      Get Involved
                    </a>
                  </div>
                </div>

                <div className="w-full max-w-5xl">
                  <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-4 md:gap-x-8 md:gap-y-10">
                    {builderProfiles.map((builder) => (
                      <div
                        key={builder.name}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#DAD7E2] shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:h-28 md:w-28">
                          {builder.imageSrc ? (
                            <img
                              src={builder.imageSrc}
                              alt={builder.name}
                              className="h-full w-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F4EDEA] via-[#D9D2E8] to-[#B89BCF]"
                              aria-hidden="true"
                            >
                              <span className="font-mono text-2xl font-bold tracking-tight text-[#4A345B] md:text-3xl">
                                {builder.name
                                  .split(' ')
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 max-w-[11rem]">
                          <p
                            className="text-sm font-semibold md:text-base"
                            style={{ color: TEXT_PRIMARY }}
                          >
                            {builder.name}
                          </p>
                          <p
                            className="mt-1 text-xs leading-5 md:text-sm"
                            style={{ color: TEXT_MUTED }}
                          >
                            {builder.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-16 md:h-24"></div>
              </div>
            </RevealSection>
          </div>
        </div>
      </div>
      {/* Begin Partners & Sponsorship */}
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        <div className={containerClasses}>
          <RevealSection>
            <h2
              className={sectionHeadingClasses}
              style={{ color: TEXT_PRIMARY }}
            >
              Our Partners
            </h2>
            <p
              className={classNames(sectionSubtitleClasses, 'mt-4')}
              style={{ color: TEXT_SECONDARY }}
            >
              Organizations that help keep USAMO Guide free for every math contest
              student.
            </p>
          </RevealSection>

          <div className="h-10 md:h-14"></div>

          <RevealSection delay={100}>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
              {partners.map(partner => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-[#F0C2FF]/20 transition hover:-translate-y-1 hover:border-[#F0C2FF]/50"
                  style={{ background: 'var(--card-bg)' }}
                >
                  <img
                    src={partner.imageSrc}
                    alt={`${partner.name} logo`}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                  />
                  <span
                    className="font-mono text-sm font-semibold tracking-wide"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    {partner.name}
                  </span>
                </a>
              ))}
            </div>
          </RevealSection>

          <div className="h-14 md:h-20"></div>

          {/* Sponsor / partner with us */}
          <RevealSection delay={150}>
            <div
              className="mx-auto max-w-4xl rounded-3xl px-6 py-10 text-center sm:px-10 md:py-12"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(240, 194, 255, 0.22)',
              }}
            >
              <h3
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{ color: TEXT_PRIMARY }}
              >
                Sponsor USAMO Guide
              </h3>
              <p
                className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
                style={{ color: TEXT_SECONDARY }}
              >
                Want to support free olympiad math education and reach
                thousands of motivated contest students? We'd love to partner
                with you. Reach out at{' '}
                <a href="mailto:team@usamoguide.com" style={linkStyle}>
                  team@usamoguide.com
                </a>{' '}
                and let's talk.
              </p>
              <div className="mt-7 flex justify-center">
                <a
                  href="mailto:team@usamoguide.com"
                  className="purple-motion-effect inline-flex items-center justify-center rounded-full px-7 py-3 font-mono text-base leading-tight font-bold"
                  style={
                    {
                      border: '1px solid rgba(240, 194, 255, 0.34)',
                      background: '#6D3B9F',
                      '--pme-color': '#F4EDEA',
                      '--pme-hover-color': '#201C36',
                      '--pme-wipe-bg': '#F0C2FF',
                    } as React.CSSProperties
                  }
                >
                  Become a Sponsor
                </a>
              </div>
            </div>
          </RevealSection>

          <div className="h-16 md:h-24"></div>
        </div>
      </div>
      {/* End Partners & Sponsorship */}
      {/* Begin FAQ */}
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        <div className="relative z-10 mx-auto max-w-(--breakpoint-xl) px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-28">
          <RevealSection>
            <h2
              className={sectionHeadingClasses}
              style={{ color: TEXT_PRIMARY }}
            >
              Frequently asked questions
            </h2>
            <p
              className={classNames(sectionSubtitleClasses, 'mt-4')}
              style={{ color: TEXT_SECONDARY }}
            >
              The essentials about the competition path, how the Guide works,
              and how to get involved.
            </p>
          </RevealSection>
          <div className="pt-10 md:pt-16">
            <RevealSection delay={100}>
              <dl className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-2 md:gap-8">
                <div>
                  <FaqCard
                    id="amc"
                    question="What are AMC, AIME, and USAMO?"
                    isOpen={openFaqs.amc}
                    onToggle={() => toggleFaq('amc')}
                  >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        These are the three big rungs of the US math competition ladder. 
                      AMC 8 is for middle schoolers, AMC 10/12 for high schoolers. 
                      While both are 25-question multiple choice contests, score well enough on them and you would qualify for AIME, a much harder 15-question numerical exam.
                      Do well on the AIME aswell and you're at the USAMO (or USAJMO) territory.
                      This would probably be the toughest math test most high schoolers will ever take. For official dates and registration, check the{' '}
                        <a
                          href="https://www.maa.org/math-competitions"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          MAA competitions page
                        </a>
                        .
                      </p>
                  </FaqCard>
                  <div className="mt-6">
                    <FaqCard
                      id="syllabus"
                      question="Is this an official syllabus?"
                      isOpen={openFaqs.syllabus}
                      onToggle={() => toggleFaq('syllabus')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Nope. USAMO Guide is built by the community, for the community. It's our best attempt at organizing what actually works for AMC/AIME/USAMO prep, not something blessed by the MAA :/
                        Think of it as notes that are passed down and refined by people who've been through the process, constantly getting better as more people chip in.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="bug"
                      question="I found a bug / typo / confusing explanation, what do I do?"
                      isOpen={openFaqs.bug}
                      onToggle={() => toggleFaq('bug')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Tell us! Hit "Contact Us" at the top of the page, or email{' '}
                        <a
                          href="mailto:contact@usamoguide.com"
                          style={linkStyle}
                        >
                          contact@usamoguide.com
                        </a>
                        . If you're comfortable with GitHub, you can also open an issue directly on our{' '}
                        <a
                          href="https://github.com/usamoguide/usamo-guide"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          GitHub repository
                        </a>
                        {' '}, It's often the fastest way to get something fixed.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="tutoring"
                      question="I want live classes or one-on-one tutoring..."
                      isOpen={openFaqs.tutoring}
                      onToggle={() => toggleFaq('tutoring')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        That's not really what we do.. We're a self-paced resource. For live instruction, AoPS runs solid online classes. If you still want structure and other people around, join one of our study groups or hop into a weekly mock contest for practice under real conditions.
                      </p>
                    </FaqCard>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <FaqCard
                    id="qualify"
                    question="Do I need to already be good at math / qualified for USAMO to use this?"
                    isOpen={openFaqs.qualify}
                    onToggle={() => toggleFaq('qualify')}
                  >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Not even close. Start on day one of AMC 8 prep or show up already grinding toward USAMO, either way, there's a place for you here. The material ramps from the basics up to olympiad-level, so you can jump in wherever you actually are.
                      </p>
                  </FaqCard>
                  <div className="mt-6">
                    <FaqCard
                      id="help"
                      question="Where can I get help when I'm stuck?"
                      isOpen={openFaqs.help}
                      onToggle={() => toggleFaq('help')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Our{' '}
                        <a
                          href="https://discord.gg/X2zx6u53XH"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          Discord
                        </a>{' '}
                        is the best place. People are usually around to help with a specific problem or concept. Beyond that, you can join a study group, get paired with a mentor, or just email us if it's a question about the guide itself.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="contribute"
                      question="How can I contribute?"
                      isOpen={openFaqs.contribute}
                      onToggle={() => toggleFaq('contribute')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Please do. Fix a typo, rewrite a confusing explanation, add a problem, improve a diagram, clean up some code - it all helps. Head to our{' '}
                        <a
                          href="https://github.com/usamoguide/usamo-guide"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          GitHub
                        </a>{' '}
                        for contribution guidelines and open issues.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="source"
                      question="Is this open source?"
                      isOpen={openFaqs.source}
                      onToggle={() => toggleFaq('source')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Yes, all of it! Fork it, build on it, poke around and see how it works. Nothing's hidden. 
                        (Attribution required + Commerical use not allowed.)
                      </p>
                    </FaqCard>
                  </div>
                </div>
              </dl>
            </RevealSection>
          </div>
        </div>
      </div>
      {/*End FAQ*/}
      <footer className="relative bg-[#0F1020] text-[#F4EDEA] overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-10 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.75fr))] lg:gap-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <img
                  src="/images/Test_logo.png"
                  alt="USAMO Guide"
                  className="h-11 w-11 shrink-0 object-cover"
                />
                <span className="text-xl font-semibold tracking-tight text-[#F4EDEA]">
                  USAMO Guide
                </span>
              </div>

              <h2 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-[#F4EDEA] sm:text-5xl">
                Your math contest second home
              </h2>

              <p className="mt-5 max-w-lg text-lg leading-8 text-[#B8B4C5]">
                USAMO Guide brings lessons, resources, problem sets, and
                community support into one place for AMC, AIME, and Olympiad
                prep.
              </p>

              <Link
                to="/foundations"
                className="purple-motion-effect mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
                style={footerButtonStyle}
              >
                Browse topics
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">Menu</h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/" style={footerLinkStyle}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/foundations" style={footerLinkStyle}>
                    Learn Foundations
                  </Link>
                </li>
                <li>
                  <Link to="/problems" style={footerLinkStyle}>
                    Problem Sets
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" style={footerLinkStyle}>
                    Progress Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/other-useful-resources" style={footerLinkStyle}>
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">Community</h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/contact-us" style={footerLinkStyle}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://discord.gg/X2zx6u53XH"
                    target="_blank"
                    rel="noreferrer"
                    style={footerLinkStyle}
                  >
                    Discord Community
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/usamoguide/usamo-guide"
                    target="_blank"
                    rel="noreferrer"
                    style={footerLinkStyle}
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" style={footerLinkStyle}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" style={footerLinkStyle}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">Support</h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/contact-us" style={footerLinkStyle}>
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" style={footerLinkStyle}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" style={footerLinkStyle}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" style={footerLinkStyle}>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-end gap-4 text-sm text-[#8E8AA1]">
            <span>&copy; {new Date().getFullYear()} USAMO Guide - All rights reserved</span>
            <div className="flex items-center gap-2">
              {footerSocialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[#F4EDEA] transition hover:-translate-y-0.5 hover:border-[#F0C2FF]/60 hover:bg-white/5 hover:text-[#F0C2FF]"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Full-bleed wordmark, with tree canopy behind it and grass overlapping in front */}
      <div className="pointer-events-none mt-4 w-screen relative left-1/2 -translate-x-1/2 overflow-hidden">
        <img
          src="images/tree-canopy-pink.png"
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 h-[clamp(8rem,22vw,22rem)] w-auto select-none object-contain"
        />

        <svg
          viewBox="0 0 1200 140"
          preserveAspectRatio="xMidYMax meet"
          className="relative z-10 w-full h-[clamp(5.5rem,18vw,18rem)] block"
        >
          <text
            x="50%"
            y="132"
            textAnchor="middle"
            fontSize="140"
            fontWeight="600"
            letterSpacing="-8"
            fill="#F7F4EC"
            fontFamily="inherit"
          >
            USAMO Guide
          </text>
        </svg>

        <img
          src="images/ground-grass-wide.png"
          alt=""
          className="relative z-20 w-full h-auto select-none block mt-[clamp(-4rem,-8vw,-1.5rem)]"
        />
      </div>
      </footer>
    </Layout>
  );
}
