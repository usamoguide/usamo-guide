import { graphql, PageProps } from 'gatsby';
import React, { useState } from 'react';
import { Chapter } from '../../content/ordering';

import {
  HitsPerPage,
  InstantSearch,
  Pagination,
  PoweredBy,
} from 'react-instantsearch';

import SECTIONS from '../../content/ordering';
import BlindModeToggle from '../components/BlindModeToggle';
import Layout from '../components/layout';
import ProblemHits from '../components/ProblemsPage/ProblemHits';
import SearchBox from '../components/ProblemsPage/SearchBox';
import Selection, {
  SelectionProps,
} from '../components/ProblemsPage/Selection';
import TagsRefinementList from '../components/ProblemsPage/TagsRefinementList';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import { useUserProgressOnProblems } from '../context/UserDataContext/properties/userProgress';
import { searchClient } from '../utils/algoliaSearchClient';

const indexName = `${process.env.GATSBY_ALGOLIA_INDEX_NAME ?? 'dev'}_problems`;

// Style constants aligned with homepage
const VANILLA = '#F4EDEA';
const PAGE_BG = 'var(--bg-page)';
const PLUM_MID = '#2A1C37';
const pageBackgroundClasses = 'min-h-screen transition-colors duration-500';
const heroCardClasses =
  'relative overflow-hidden rounded-3xl p-8 transition-all duration-500';
const toolbarCardClasses = 'mb-5 rounded-2xl p-4';
const heroCardStyle: React.CSSProperties = {
  background: 'rgba(48, 32, 67, 0.91)',
};
const toolbarCardStyle: React.CSSProperties = {
  background: 'rgba(43, 30, 57, 0.92)',
};

type DataProps = {
  allProblemInfo: {
    nodes: {
      uniqueId: string;
    }[];
  };
};

export default function ProblemsPage(props: PageProps<DataProps>) {
  const {
    allProblemInfo: { nodes: problems },
  } = props.data;
  const problemIds = problems.map(problem => problem.uniqueId);
  const userProgress = useUserProgressOnProblems();
  const [shuffle, sendShuffle] = useState(0);
  const [random, sendRandom] = useState(0);
  const selectionMetadata: SelectionProps[] = [
    {
      attribute: 'problemModules.title',
      limit: 500,
      placeholder: 'Modules',
      searchable: true,
      isMulti: true,
    },
    {
      attribute: 'problemModules.id',
      limit: 500,
      placeholder: 'Section',
      searchable: false,
      isMulti: true,
      items: (
        [
          ['Foundations (AMC 8)', SECTIONS.foundations],
          ['Intermediate (AMC 10-12)', SECTIONS.intermediate],
          ['Advanced (AIME)', SECTIONS.advanced],
          ['Olympiad (USA(J)MO)', SECTIONS.usamo],
        ] as unknown as [string, Chapter[]][]
      ).map(([section, chapters]) => ({
        label: section,
        value: chapters.map(chapter => chapter.items).flat(),
      })),
    },
    {
      attribute: 'objectID',
      limit: 500,
      placeholder: 'Status',
      searchable: false,
      isMulti: true,
      items: [
        'Not Attempted',
        'Solving',
        'Reviewing',
        'Skipped',
        'Ignored',
        'Solved',
      ].map(label => ({
        label,
        value: problemIds.filter(
          id => (userProgress[id] ?? 'Not Attempted') == label
        ),
      })),
    },
  ];
  return (
    <Layout>
      <SEO title="All Problems" image={null} pathname={props.path} />

      <div
        className={`problems-page ui-page ${pageBackgroundClasses}`}
        style={
          {
            background: PAGE_BG,
            color: VANILLA,
            '--select-bg': '#0D0D0D',
            '--select-menu-bg': '#0D0D0D',
            '--select-border': 'rgba(240, 194, 255, 0.26)',
            '--select-text': '#F4EDEA',
            '--select-option-hover': 'rgba(240, 194, 255, 0.16)',
            '--select-option-selected': 'rgba(240, 194, 255, 0.24)',
            '--accent-soft': 'rgba(101, 86, 141, 0.22)',
            '--accent-soft-strong': 'rgba(101, 86, 141, 0.34)',
          } as React.CSSProperties
        }
      >
        <TopNavigationBar />

        <InstantSearch
          searchClient={searchClient}
          indexName={indexName}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <div className="grid grid-cols-12 gap-x-6 px-6 pb-6 lg:px-9">
            <aside className="col-span-12 hidden pt-6 sm:col-span-4 sm:block md:col-span-3 lg:col-span-2 xl:col-span-2">
              <div className="mb-4">
                <BlindModeToggle />
              </div>
              <TagsRefinementList />
            </aside>
            <main className="col-span-12 sm:col-span-8 md:col-span-9 lg:col-span-10 xl:col-span-10">
              <div className={`${heroCardClasses} ui-card-dark`}>
                <img
                  src="https://i.ibb.co/GQqCH4T2/fox-2.png"
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-8 h-[92%] w-auto object-contain object-bottom select-none"
                />
                <div className="relative mx-auto mb-6 max-w-3xl">
                  <h1
                    className="mb-6 text-center text-3xl font-bold sm:text-5xl"
                    style={{ color: VANILLA }}
                  >
                    Problems
                  </h1>
                  <div className="mx-auto max-w-md">
                    <SearchBox />
                  </div>
                </div>
              </div>
              <div className="mt-4 mb-1 flex justify-center">
                <PoweredBy />
              </div>
              <div className="px-1 py-0.5">
                <div
                  className={`${toolbarCardClasses} ui-card-dark`}
                  style={toolbarCardStyle}
                >
                  <div className="grid grid-cols-1 items-center gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-6">
                    {selectionMetadata.map(props => (
                      <div
                        className="tw-forms-disable-all-descendants col-span-2 sm:col-span-3 md:col-span-1 lg:col-span-2"
                        key={props.attribute}
                      >
                        <Selection {...props} />
                      </div>
                    ))}
                  </div>
                  <div className="mb-5 pt-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => sendShuffle(shuffle + 1)}
                        className="purple-motion-effect inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold"
                        style={
                          {
                            border: '1px solid rgba(240, 194, 255, 0.34)',
                            background: '#6D3B9F',
                            '--pme-color': '#F4EDEA',
                            '--pme-hover-color': '#201C36',
                            '--pme-wipe-bg': '#F0C2FF',
                          } as React.CSSProperties
                        }
                        title={'Shuffle problems'}
                      >
                        <svg
                          className={'mr-2 h-5 w-5 text-gray-200'}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Shuffle
                      </button>
                      <button
                        onClick={() => sendRandom(random + 1)}
                        className="purple-motion-effect inline-flex items-center justify-center rounded-full px-5 py-2 font-mono text-sm leading-tight font-bold"
                        style={
                          {
                            border: '1px solid rgba(240, 194, 255, 0.34)',
                            background: '#EFE3FF',
                            '--pme-color': '#2C1842',
                            '--pme-hover-color': '#201C36',
                            '--pme-wipe-bg': '#F0C2FF',
                          } as React.CSSProperties
                        }
                        title={'Go to a random unsolved problem'}
                      >
                        <svg
                          className={'mr-2 h-5 w-5 text-[#2C1842]'}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8" cy="8" r="1" />
                          <circle cx="16" cy="8" r="1" />
                          <circle cx="8" cy="16" r="1" />
                          <circle cx="16" cy="16" r="1" />
                          <circle cx="12" cy="12" r="1" />
                        </svg>
                        Random
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <ProblemHits shuffle={shuffle} random={random} />
              <div className="mt-3 flex flex-wrap justify-center">
                <Pagination
                  showLast={true}
                  className="problems-pagination pr-4"
                />
                <HitsPerPage
                  items={[
                    { label: '24 hits per page', value: 24, default: true },
                    { label: '32 hits per page', value: 32 },
                    { label: '48 hits per page', value: 48 },
                  ]}
                  className="mt-1 lg:mt-0"
                />
              </div>
            </main>
          </div>
        </InstantSearch>
      </div>
    </Layout>
  );
}

export const pageQuery = graphql`
  query {
    allProblemInfo {
      nodes {
        uniqueId
      }
    }
  }
`;
