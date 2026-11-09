import { Buffer } from 'buffer';
import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import {
  branchAtom,
  githubInfoAtom,
  octokitAtom,
  saveFileAtom,
  tabAtom,
  trueFileAtom,
  trueFilePathAtom,
} from '../../atoms/editor';
import { useQuizOpen } from '../../context/QuizGeneratorContext';
import AddProblemModal from './AddProblemModal';

export interface EditorTab {
  label: string;
  value: string;
}

export interface EditorTabBarProps {
  tabs: EditorTab[];
  /**
   * Value of the active tab.
   */
  activeTab: string;
  onTabSelect: (tab: EditorTab) => void;
  onFormatCode: () => void;
}

const EditorTabBar: React.FC<EditorTabBarProps> = ({
  tabs,
  activeTab,
  onTabSelect,
  onFormatCode,
}) => {
  const { setOpen } = useQuizOpen();
  const githubInfo = useAtomValue(githubInfoAtom);
  const octokit = useAtomValue(octokitAtom);
  const branch = useAtomValue(branchAtom);
  const [commitState, setCommitState] = useState('Commit Code');
  const [pullState, setPullState] = useState('Pull Code');
  const filePath = useAtomValue(trueFilePathAtom);
  const file = useAtomValue(trueFileAtom);
  const saveFile = useSetAtom(saveFileAtom);
  const tab = useAtomValue(tabAtom);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ensureBranchExists = useCallback(async () => {
    if (!octokit || !githubInfo || !branch) return;
    try {
      await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
        owner: githubInfo.login,
        repo: 'usamo-guide',
        branch,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      return;
    } catch (error) {
      const status = (error as { status?: number })?.status;
      if (status && status !== 404) throw error;
    }

    let baseSha: string | undefined;
    try {
      baseSha = (
        await octokit.request(
          'GET /repos/{owner}/{repo}/git/matching-refs/{ref}',
          {
            owner: githubInfo.login,
            repo: 'usamo-guide',
            ref: 'heads/main',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        )
      ).data[0]?.object?.sha;
    } catch {
      baseSha = undefined;
    }
    if (!baseSha) {
      baseSha = (
        await octokit.request(
          'GET /repos/{owner}/{repo}/git/matching-refs/{ref}',
          {
            owner: 'usamoguide',
            repo: 'usamo-guide',
            ref: 'heads/main',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          }
        )
      ).data[0]?.object?.sha;
    }

    if (!baseSha) {
      throw new Error('Unable to resolve base branch for new branch');
    }

    await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
      owner: githubInfo.login,
      repo: 'usamo-guide',
      ref: `refs/heads/${branch}`,
      sha: baseSha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
  }, [octokit, githubInfo, branch]);
  const updateFile = useCallback(
    async file => {
      if (!octokit || !githubInfo || !branch) return;
      setCommitState('Committing...');
      await ensureBranchExists();
      let fileSha = undefined;
      try {
        fileSha = (
          (await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: githubInfo.login,
            repo: 'usamo-guide',
            path: filePath,
            ref: branch,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          })) as any
        ).data.sha;
      } catch {
        console.log("file doesn't exist yet");
      }
      const response = await octokit.request(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        {
          owner: githubInfo.login,
          repo: 'usamo-guide',
          path: filePath,
          message: `Update ${filePath}`,
          branch: branch,
          sha: fileSha,
          content: Buffer.from(file ?? '').toString('base64'),
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      console.log('response: ', response);
      window.open(response.data.commit.html_url, '_blank');
      setCommitState('Commit Code');
    },
    [octokit, githubInfo, branch, filePath, ensureBranchExists]
  );
  const pullCode = useCallback(async () => {
    if (!octokit || !githubInfo || !branch) return;
    setPullState('Pulling...');
    const response = (
      await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: githubInfo.login,
        repo: 'usamo-guide',
        path: filePath,
        ref: branch,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
    ).data;
    if (!('type' in response) || response.type !== 'file') return; // should not happen
    saveFile({
      path: filePath,
      async update(f) {
        if (tab == 'content') {
          return {
            ...f,
            markdown: Buffer.from(response.content, 'base64').toString('utf-8'),
          };
        } else {
          return {
            ...f,
            problems: Buffer.from(response.content, 'base64').toString('utf-8'),
          };
        }
      },
    });
    setPullState('Pull Code');
  }, [octokit, githubInfo, branch, filePath, tab, saveFile]);
  return (
    <>
      <div className="flex bg-gray-50 dark:bg-gray-950">
        <div className="flex-1">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={classNames(
                tab.value === activeTab
                  ? 'bg-gray-200 text-gray-900 dark:bg-[var(--bg-surface-alt)] dark:text-[var(--text-primary)]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-100 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-400 dark:active:bg-gray-900 dark:text-[var(--text-secondary)]',
                'px-4 py-2 text-sm font-medium transition focus:outline-hidden'
              )}
              onClick={() => onTabSelect(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={
          'flex bg-gray-100 text-gray-600 dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)]'
        }
      >
        <button
          className={classNames(
            'hover:bg-gray-200 hover:text-gray-800 active:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300 dark:active:bg-gray-800',
            'px-3 py-2 text-sm font-medium transition focus:outline-hidden'
          )}
          onClick={() => setOpen(true)}
          type="button"
        >
          Generate Quiz
        </button>
        <button
          className={classNames(
            'hover:bg-gray-200 hover:text-gray-800 active:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300 dark:active:bg-gray-800',
            'px-3 py-2 text-sm font-medium transition focus:outline-hidden'
          )}
          onClick={() => onFormatCode()}
        >
          Format Code
        </button>
        {useAtomValue(tabAtom) === 'problems' && (
          <button
            className={classNames(
              'hover:bg-gray-200 hover:text-gray-800 active:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300 dark:active:bg-gray-800',
              'px-3 py-2 text-sm font-medium transition focus:outline-hidden'
            )}
            onClick={() => setDialogOpen(true)}
          >
            Add Problem
          </button>
        )}
        {githubInfo && octokit && file && branch && (
          <button
            className={classNames(
              'hover:bg-gray-200 hover:text-gray-800 active:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300 dark:active:bg-gray-800',
              'px-3 py-2 text-sm font-medium transition focus:outline-hidden'
            )}
            onClick={() => updateFile(file)}
          >
            {commitState}
          </button>
        )}
        {githubInfo && octokit && file && branch && (
          <button
            className={classNames(
              'hover:bg-gray-200 hover:text-gray-800 active:bg-gray-200 dark:hover:bg-[var(--bg-surface-alt)] dark:hover:text-gray-300 dark:active:bg-gray-800',
              'px-3 py-2 text-sm font-medium transition focus:outline-hidden'
            )}
            onClick={() => pullCode()}
          >
            {pullState}
          </button>
        )}
      </div>
      <AddProblemModal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default EditorTabBar;
