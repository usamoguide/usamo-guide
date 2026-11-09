import { InformationCircleIcon } from '@heroicons/react/outline';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { activeFileAtom, saveFileAtom } from '../../atoms/editor';
import { useDarkMode } from '../../context/DarkModeContext';
import { useSetThemeSetting } from '../../context/UserDataContext/properties/simpleProperties';
import LogoSquare from '../LogoSquare';
import AddFileModal from './AddFileModal';
import AddPageModal from './AddPageModal';
import { fetchFileContent } from './editorUtils';

export const EditorTopNav = (): JSX.Element => {
  const activeFile = useAtomValue(activeFileAtom);
  const saveFile = useSetAtom(saveFileAtom);
  const isDarkMode = useDarkMode();
  const setTheme = useSetThemeSetting();
  const [addFileOpen, setAddFileOpen] = React.useState(false);
  const [addPageOpen, setAddPageOpen] = React.useState(false);

  const handleReloadContent = async () => {
    if (!activeFile) return;
    if (confirm('Reload file from GitHub? Your local changes will be lost.')) {
      const data = await fetchFileContent(activeFile.path);
      // note: we can't use setMarkdown / setProblems in sequence because setProblems would override setMarkdown
      saveFile({
        ...activeFile,
        markdown: data.markdown,
        problems: data.problems,
      });
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 dark:border-[var(--border)] dark:bg-[var(--bg-surface)]">
      <div className="flex items-center space-x-4">
        <div className="mr-8 flex flex-nowrap items-center space-x-2 py-2 whitespace-nowrap">
          <div className="h-8 w-8 shrink-0">
            <LogoSquare />
          </div>
          <span className="text-xl font-medium tracking-tight">
            Guide Editor
          </span>
        </div>
        {activeFile?.path && (
          <button
            className="inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300"
            onClick={handleReloadContent}
          >
            Reload Content from GitHub
          </button>
        )}
        {activeFile?.path && (
          <a
            href={`https://github.com/usamoguide/usamo-guide/blob/main/${encodeURI(
              activeFile?.path
            )}`}
            target="_blank"
            className="inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300"
            rel="noreferrer"
          >
            View File on GitHub &rarr;
          </a>
        )}
        <button
          className="inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300"
          onClick={() => setAddPageOpen(true)}
        >
          New Page
        </button>
        <button
          className="inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-hidden dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300"
          onClick={() => setAddFileOpen(true)}
        >
          New Problem
        </button>
      </div>
      <div className="flex items-center">
        <a
          href="https://github.com/usamoguide/usamo-guide/blob/main/docs/Math_Topic_Template.md"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center space-x-2 text-sm font-medium text-gray-600 transition hover:text-black dark:text-[var(--text-secondary)] dark:hover:text-gray-200"
        >
          <InformationCircleIcon className="h-6 w-6 text-gray-400 transition group-hover:text-gray-500 dark:group-hover:text-gray-300" />
          <span>Documentation</span>
        </a>

        <div className="mx-4 block h-6 self-center border-l border-gray-200 dark:border-[var(--border)]" />

        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="dark:hover:text-dark-high-emphasis -mx-1 rounded-full border-2 border-transparent p-1 text-gray-400 transition hover:text-gray-300 focus:bg-gray-100 focus:text-gray-500 focus:outline-hidden dark:text-[var(--text-secondary)] dark:focus:bg-gray-700"
        >
          {isDarkMode ? (
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
      <AddFileModal
        isOpen={addFileOpen}
        onClose={() => setAddFileOpen(false)}
      />
      <AddPageModal
        isOpen={addPageOpen}
        onClose={() => setAddPageOpen(false)}
      />
    </div>
  );
};
