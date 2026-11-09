import { SearchIcon } from '@heroicons/react/solid';
import React from 'react';
import {
  Highlight,
  InstantSearch,
  PoweredBy,
  useHits,
  useSearchBox,
} from 'react-instantsearch';
import {
  AlgoliaEditorFile,
  AlgoliaEditorFileHit,
} from '../../models/algoliaEditorFile';
import { searchClient } from '../../utils/algoliaSearchClient';

const indexName = `${
  process.env.GATSBY_ALGOLIA_INDEX_NAME ?? 'dev'
}_editorFiles`;

const FileSearch = ({
  onSelect,
  openAddFile,
  openAddPage,
}: {
  onSelect: (file: AlgoliaEditorFile) => void;
  openAddFile: () => void;
  openAddPage: () => void;
}) => {
  const { query, refine: setQuery } = useSearchBox();
  const { hits } = useHits() as { hits: AlgoliaEditorFileHit[] };
  return (
    <div>
      <div className="flex items-center p-2">
        <input
          type="search"
          placeholder="Search"
          className="dark:bg-[var(--bg-page)] flex-1 border-0 text-gray-700 focus:ring-0 focus:outline-hidden dark:text-[var(--text-primary)] dark:placeholder-gray-400"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <span className="p-2">
          <SearchIcon className="h-5 w-5 text-gray-400 dark:text-[var(--text-secondary)]" />
        </span>
      </div>
      <div>
        {query !== '' && (
          <div className="max-h-[20rem] divide-y divide-gray-200 overflow-y-auto border-t border-gray-200 dark:divide-[var(--border)] dark:border-[var(--border)]">
            {hits.map(hit => (
              <button
                className="block w-full px-5 py-3 text-left transition hover:bg-blue-100 focus:outline-hidden dark:hover:bg-[var(--bg-surface-alt)]"
                key={hit.id}
                onClick={() => onSelect(hit)}
              >
                <h3 className="font-medium text-gray-600 dark:text-[var(--text-primary)]">
                  <Highlight hit={hit} attribute="title" /> (
                  {hit.kind === 'module' ? 'Module' : 'Solution'})
                </h3>
                <p
                  className={`text-gray-700 **:text-sm! **:leading-4! dark:text-[var(--text-secondary)]`}
                >
                  <Highlight hit={hit} attribute="id" /> -{' '}
                  <Highlight hit={hit} attribute="path" />
                </p>
              </button>
            ))}
          </div>
        )}
        <div className="border-t border-gray-200 px-5 py-3 dark:border-[var(--border)]">
          <div className="space-y-1">
            <button
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-100 focus:outline-hidden dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-surface-alt)]"
              onClick={openAddPage}
            >
              Create New Page
            </button>
            <button
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-blue-100 focus:outline-hidden dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-surface-alt)]"
              onClick={openAddFile}
            >
              Add New Problem (Solution)
            </button>
          </div>
          <div className="mt-3">
            <div className="hidden dark:block">
              <PoweredBy theme="dark" />
            </div>
            <div className="block dark:hidden">
              <PoweredBy theme="light" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorFileModalInterface: React.FC<{
  onSelect: (file: AlgoliaEditorFile) => void;
  openAddFile: () => void;
  openAddPage: () => void;
}> = ({ onSelect, openAddFile, openAddPage }) => {
  return (
    <InstantSearch
      indexName={indexName}
      searchClient={searchClient}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <FileSearch
        onSelect={onSelect}
        openAddFile={openAddFile}
        openAddPage={openAddPage}
      />
    </InstantSearch>
  );
};

export default EditorFileModalInterface;
