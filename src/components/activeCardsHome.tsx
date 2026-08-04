import {
  ChevronRightIcon,
  CogIcon,
  UserGroupIcon,
} from '@heroicons/react/solid';
import classNames from 'classnames';
import { CalendarCheck } from 'lucide-react';
import React, { useState } from 'react';

const PAGE_BG = 'var(--bg-page)';
const VANILLA = '#F4EDEA';
const MAUVE = '#F0C2FF';
const PURPLE = '#70428A';
const BORDER_STRONG = 'rgba(240, 194, 255, 0.26)';
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.78)';

const headerClasses =
  'text-4xl md:text-5xl 2xl:text-6xl font-black tracking-tight text-center';
const subtextClasses =
  'text-base md:text-lg 2xl:text-xl font-medium max-w-4xl leading-relaxed text-center';

const projects = [
  {
    title: 'Competition Arena',
    icon: CalendarCheck,
    imageSrc: '/images/weekly_mock_contests.jpg',
    color: 'bg-[#9A6BB7]',
    desc: 'Timed contests modeled after real competitions. Score reflects accuracy and pacing. Detailed solutions and performance analytics after each contest. Track improvement over time.',
    bulletPoints: [
      '• AMC 8, 10/12, and AIME-style contests',
      '• Scored based on correct answers and time',
      '• Real-time pacing and solution feedback',
      '• Performance analytics and weakness detection',
      '• Archive of past contests for practice',
    ],
    url: 'https://contests.usamoguide.com/',
  },
  {
    title: 'Master the Math',
    icon: UserGroupIcon,
    imageSrc: '/images/aops_comm.jpg',
    color: 'bg-[#AA79C4]',
    desc: 'Comprehensive learning materials organized by skill level and topic. From foundations to USAMO-level problems. Each module includes theory, worked examples, and thousands of curated practice problems.',
    bulletPoints: [
      '• 4 difficulty levels: Foundations, Intermediate, Advanced, USAMO',
      '• 8 math topics: Algebra, Geometry, Number Theory, Combinatorics, and more',
      '• Detailed theory explanations with visualizations',
      '• Extensive curated problem sets for every concept',
      '• Progressive structure from basics to Olympiad-level',
    ],
    url: '/problems',
  },
  {
    title: 'Problem Vault',
    icon: CogIcon,
    imageSrc: '/images/mentorship.jpg',
    color: 'bg-[#B98CD1]',
    desc: 'Unlimited problem drilling organized by topic, difficulty, and source. Filter by contest type, focus on weak areas, and build confidence through targeted practice.',
    bulletPoints: [
      '• Thousands of problems across all difficulty levels',
      '• Filter by topic, source (AMC/AIME/USAMO), and difficulty',
      '• Track completion status and progress',
      '• View detailed solutions and official answers',
      '• Create custom problem sets for focused drilling',
    ],
    url: '/problems',
  },
];

const ActiveCardsHome = () => {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <div
      className="relative overflow-x-hidden transition-colors duration-500"
      style={{
        background: PAGE_BG,
        color: VANILLA,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 blur-3xl"
        style={{
          background: 'transparent',
        }}
      />
      <div className="h-16 md:h-20 2xl:h-36"></div>
      <div className="px-4 sm:px-6 lg:px-8 2xl:px-16">
        <h2 className={headerClasses} style={{ color: VANILLA }}>
          Built by the USAMO Guide community.
        </h2>
        <div className="h-2 md:h-4"></div>
        <p
          className={classNames(subtextClasses, 'mx-auto')}
          style={{ color: TEXT_SECONDARY }}
        >
          Free roadmap for AMC 8, AMC 10/12, AIME, and USAMO/USAJMO organized by
          level and difficulty.
        </p>

        <div className="h-12 md:h-16 2xl:h-24"></div>

        <div className="flex flex-col items-start gap-4 overflow-x-hidden md:flex-row">
          <div className="flex w-full flex-shrink-0 flex-col md:w-2/6">
            {projects.map((project, id) => (
              <div
                key={id}
                onClick={() => setActiveCard(id)}
                className={classNames(
                  'group relative cursor-pointer p-1 transition-all duration-300',
                  id === 0 ? 'rounded-t-xl' : '',
                  id === projects.length - 1 ? 'rounded-b-xl' : '',
                  activeCard === id ? '' : ''
                )}
                style={{
                  background:
                    activeCard === id
                      ? 'rgba(50, 32, 75, 0.96)'
                      : 'rgba(43, 30, 57, 0.92)',
                }}
              >
                {activeCard === id && (
                  <div
                    className="absolute top-2 bottom-2 left-0 w-1 rounded-full"
                    style={{ backgroundColor: PURPLE }}
                  />
                )}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={classNames(
                        'flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl',
                        project.imageSrc ? 'bg-transparent p-0' : 'p-2',
                        !project.imageSrc && project.color
                      )}
                    >
                      {project.imageSrc ? (
                        <img
                          src={project.imageSrc}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <project.icon className="size-6 text-[#201C36]" />
                      )}
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: VANILLA }}
                    >
                      {project.title}
                    </span>
                  </div>
                  <ChevronRightIcon
                    className={classNames(
                      'h-5 w-5 transition-transform duration-300',
                      activeCard === id ? 'rotate-90' : ''
                    )}
                    style={{
                      color:
                        activeCard === id ? MAUVE : 'rgba(244, 237, 234, 0.38)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="relative hidden min-w-0 flex-grow md:block">
            <div className="sticky top-24 h-fit min-h-[600px]">
              <div
                className={classNames(
                  'relative h-full w-full max-w-full overflow-hidden rounded-2xl p-12 backdrop-blur-sm md:p-10'
                )}
                style={{
                  background: 'rgba(43, 30, 57, 0.92)',
                }}
              >
                <div className="relative z-10 max-w-2xl">
                  {projects[activeCard].imageSrc ? (
                    <div className="my-4 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
                      <img
                        src={projects[activeCard].imageSrc}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className={classNames(
                        'my-4 inline-block rounded-xl p-3',
                        projects[activeCard].color
                      )}
                    >
                      {React.createElement(projects[activeCard].icon, {
                        className: 'w-8 h-8 text-[#201C36]',
                      })}
                    </div>
                  )}

                  <h3
                    className="text-4xl leading-none font-extrabold tracking-tighter"
                    style={{ color: VANILLA }}
                  >
                    {projects[activeCard].title}
                  </h3>

                  <div
                    className="my-4 h-1 w-20 rounded-full"
                    style={{ backgroundColor: 'rgba(240, 194, 255, 0.34)' }}
                  />

                  <p
                    className="w-full text-xl font-medium"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    {projects[activeCard].desc}
                  </p>

                  {projects[activeCard].bulletPoints && (
                    <div className="mt-6 space-y-2">
                      {projects[activeCard].bulletPoints.map((point, idx) => (
                        <p
                          key={idx}
                          className="text-base"
                          style={{ color: TEXT_SECONDARY }}
                        >
                          {point}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deep Ambient Glow in the bottom right of the panel */}
                <div
                  className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full blur-[100px]"
                  style={{ backgroundColor: 'rgba(112, 66, 138, 0.20)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCardsHome;
