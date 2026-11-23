import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import { Octokit } from 'octokit';
import { fetchFileContent } from '../components/Editor/editorUtils';
import { AlgoliaEditorSolutionFile } from '../models/algoliaEditorFile';
import { formatProblems } from '../utils/prettierFormatter';

export type EditorFile = {
  path: string;
  markdown: string;
  problems?: string;
};

export const filesFamily = atomFamily((path: string) => {
  return atomWithStorage<EditorFile>(`guide:editor:files:${path}`, {
    path,
    markdown: '',
    problems: '',
  });
});

/**
 * Saves a file atom based on its path as its identifier.
 */
export const saveFileAtom = atom(
  null,
  async (
    get,
    set,
    update:
      | {
          path: string;
          update: (f: EditorFile) => Promise<EditorFile>;
        }
      | EditorFile
  ) => {
    const file = update.hasOwnProperty('update')
      ? await (
          update as { update: (f: EditorFile) => Promise<EditorFile> }
        ).update(get(filesFamily(update.path)))
      : (update as EditorFile);
    set(filesFamily(file.path), file);
  }
);

const baseActiveFileAtom = atomWithStorage(
  'guide:editor:activeFile',
  null as string | null
);
export const branchAtom = atomWithStorage('guide:editor:branch', null);
export const tokenAtom = atom<string | null>(null);
export const octokitAtom = atom(get =>
  get(tokenAtom) === null ? null : new Octokit({ auth: get(tokenAtom) })
);
export const forkAtom = atom<string | undefined>(undefined);
export const baseTabAtom = atom<'content' | 'problems'>('content');
export const editingSolutionAtom = atom(false);
export const tabAtom = atom(get =>
  get(editingSolutionAtom) ? 'content' : get(baseTabAtom)
);
export const trueFilePathAtom = atom(get => {
  const activeFile = get(activeFileAtom);
  return activeFile === null
    ? 'NONE'
    : get(tabAtom) === 'content'
      ? activeFile.path
      : activeFile.path.replace(/\.mdx$/, '.problems.json');
});
export const trueFileAtom = atom(get => {
  const activeFile = get(activeFileAtom);
  return activeFile === null
    ? 'Open a file to begin'
    : get(tabAtom) === 'content'
      ? activeFile.markdown
      : activeFile.problems;
});
export const githubInfoAtom = atom(
  async get => (await get(octokitAtom)?.request('GET /user'))?.data
);
export const activeFileAtom = atom(
  get => {
    const activeFile = get(baseActiveFileAtom);
    return activeFile ? get(filesFamily(activeFile)) : null;
  },
  (get, set, nextActiveFilePath) => {
    set(baseActiveFileAtom, nextActiveFilePath);
  }
);

export const filesListAtom = atomWithStorage<string[]>(
  'guide:editor:filesList',
  []
);

export const openOrCreateExistingFileAtom = atom(
  null,
  async (get, set, filePath: string) => {
    if (get(filesListAtom).find(f => f === filePath)) {
      set(activeFileAtom, filePath);
    } else {
      set(filesListAtom, prev => [...prev, filePath]);
      const data = await fetchFileContent(filePath);
      set(saveFileAtom, {
        path: filePath,
        markdown: data.markdown,
        problems: data.problems,
      });
      set(activeFileAtom, filePath);
    }
  }
);

export const createNewInternalSolutionFileAtom = atom(
  null,
  async (get, set, file: AlgoliaEditorSolutionFile) => {
    const module = file.problemModules[0]?.path.split('/')[1];
    const division =
      file.division ||
      (!module ? 'orphaned' : module.split('_')[1].toLowerCase());
    const newFile: EditorFile = {
      path: `content/${division}/${file.id}.mdx`,
      markdown: `---
id: ${file.id}
source: ${
        file.source
  } (TODO -- convert to something like \`AIME 2022 I\`)
title: ${file.title}
author: TODO -- insert your name here
---

We found the following solution metadata for this problem:
\`\`\`
${JSON.stringify(file.solutions, null, 2)}
\`\`\`

When adding an internal solution, you have to update relevant modules to point to this new internal solution. This process is partially automated; modules containing this problem have been updated in the editor (see file list to the left).

## Explanation

(add explanation here ...)

Use \`\\texttt{}\` around variable names with length *greater than one*, like so. Place long equations on separate lines with display math, and use \`\\cdot\` instead of \`*\` to denote multiplication.

$$
\\texttt{arr}[i]=2\\cdot (a+b+c+d+e)+\\sum_{j=0}^{i-1}\\texttt{arr}[j]
$$

Some additional text styles which you might consider using:

http://latexref.xyz/Font-styles.html

http://applied-r.com/latex-font-styles/

$func(var)$

$\\textit{func(var)}$

$\\textrm{func(var)}$

$\\text{func(var)}$

$\\textsf{func(var)}$

$\\textbf{func(var)}$

$\\texttt{func(var)}$

## Implementation

**Time Complexity:** $\\mathcal{O}(N\\log^2N)$

\`\`\`
// add code here
\`\`\`
`,
      problems: '',
    };

    const updateProblemJSON = (json: string | undefined) => {
      if (!json) return undefined;
      const updated = JSON.parse(json);
      Object.keys(updated).forEach(key => {
        if (key === 'MODULE_ID') return;
        updated[key].forEach(obj => {
          if (obj.uniqueId === file.id) {
            obj.solutionMetadata = {
              kind: 'internal',
            };
          }
        });
      });
      return formatProblems(JSON.stringify(updated, null, 2));
    };

    await Promise.all(
      file.problemModules.map(async module => {
        if (get(filesListAtom).find(file => file === module.path)) {
          const currentFile = get(filesFamily(module.path));
          const formattedProblems = await updateProblemJSON(
            currentFile.problems
          );
          set(saveFileAtom, {
            ...currentFile,
            problems: formattedProblems,
          });
          return;
        }
        const data = await fetchFileContent(module.path);
        const formattedProblems = await updateProblemJSON(data.problems);
        set(saveFileAtom, {
          path: module.path,
          markdown: data.markdown,
          problems: formattedProblems,
        });
      })
    );

    set(filesListAtom, prev => [
      ...new Set([
        ...prev,
        newFile.path,
        ...file.problemModules.map(module => module.path),
      ]),
    ]);
    set(saveFileAtom, newFile);
    set(activeFileAtom, newFile.path);
  }
);

type NewPagePayload = {
  path: string;
  title?: string;
  id?: string;
  description?: string;
  author?: string;
  prerequisites?: string[];
  chapterName?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const orderingFilePath = 'content/ordering.ts';
const sectionFolderMap: Record<string, string> = {
  'content/0_General': 'general',
  'content/1_Foundations': 'foundations',
  'content/2_Intermediate': 'intermediate',
  'content/3_Advanced': 'advanced',
  'content/4_USAMO': 'usamo',
};

const findMatchingBracket = (value: string, startIndex: number) => {
  let depth = 0;
  for (let i = startIndex; i < value.length; i += 1) {
    const char = value[i];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
};

const insertModuleIntoOrdering = (
  content: string,
  sectionId: string,
  moduleId: string,
  chapterName?: string
) => {
  const sectionKey = `${sectionId}: [`;
  const sectionStart = content.indexOf(sectionKey);
  if (sectionStart === -1) return null;
  const sectionArrayStart = content.indexOf('[', sectionStart);
  if (sectionArrayStart === -1) return null;
  const sectionArrayEnd = findMatchingBracket(content, sectionArrayStart);
  if (sectionArrayEnd === -1) return null;

  const sectionSlice = content.slice(sectionStart, sectionArrayEnd + 1);

  const insertIntoItemsArray = (itemsArrayStart: number, itemsArrayEnd: number) => {
    const arrayText = sectionSlice.slice(itemsArrayStart, itemsArrayEnd + 1);
    if (arrayText.includes(`'${moduleId}'`)) return null;

    let updatedArray = arrayText;
    const compactArray = arrayText.replace(/\s/g, '');
    if (compactArray === '[]') {
      updatedArray = `['${moduleId}']`;
    } else {
      updatedArray = `${arrayText.slice(0, -1)}, '${moduleId}']`;
    }

    const updatedSectionSlice =
      sectionSlice.slice(0, itemsArrayStart) +
      updatedArray +
      sectionSlice.slice(itemsArrayEnd + 1);

    return (
      content.slice(0, sectionStart) +
      updatedSectionSlice +
      content.slice(sectionArrayEnd + 1)
    );
  };

  if (chapterName) {
    const escapedName = chapterName.replace(/'/g, "\\'");
    const nameToken = `name: '${escapedName}'`;
    const nameIndex = sectionSlice.indexOf(nameToken);
    if (nameIndex !== -1) {
      const itemsIndex = sectionSlice.indexOf('items:', nameIndex);
      if (itemsIndex !== -1) {
        const itemsArrayStart = sectionSlice.indexOf('[', itemsIndex);
        if (itemsArrayStart !== -1) {
          const itemsArrayEnd = findMatchingBracket(sectionSlice, itemsArrayStart);
          if (itemsArrayEnd !== -1) {
            const updated = insertIntoItemsArray(itemsArrayStart, itemsArrayEnd);
            if (updated) return updated;
          }
        }
      }
    }

    const insertionPoint = sectionArrayEnd;
    const newChapterBlock =
      `    {\n` +
      `      name: '${escapedName}',\n` +
      `      items: ['${moduleId}'],\n` +
      `    },\n`;
    return (
      content.slice(0, insertionPoint) +
      newChapterBlock +
      content.slice(insertionPoint)
    );
  }

  const itemsIndex = sectionSlice.lastIndexOf('items:');
  if (itemsIndex === -1) return null;
  const itemsArrayStart = sectionSlice.indexOf('[', itemsIndex);
  if (itemsArrayStart === -1) return null;
  const itemsArrayEnd = findMatchingBracket(sectionSlice, itemsArrayStart);
  if (itemsArrayEnd === -1) return null;
  return insertIntoItemsArray(itemsArrayStart, itemsArrayEnd);
};

export const createNewPageFileAtom = atom(
  null,
  async (get, set, payload: NewPagePayload) => {
    const normalizedPath = payload.path.trim().replace(/^\/+/, '');
    if (!normalizedPath) return;

    const filePath = normalizedPath.endsWith('.mdx')
      ? normalizedPath
      : `${normalizedPath}.mdx`;

    if (get(filesListAtom).find(file => file === filePath)) {
      set(activeFileAtom, filePath);
      return;
    }

    const fileName = filePath.split('/').pop()?.replace(/\.mdx$/, '') ?? '';
    const titleFallback = fileName.replace(/_/g, ' ').trim();
    const title = payload.title?.trim() || titleFallback || 'New Page';
    const id = payload.id?.trim() || slugify(title) || slugify(fileName);
    const author = payload.author?.trim() || 'USAMO Guide Team';
    const description =
      payload.description?.trim() || 'TODO: add a short description.';
    const prerequisites = payload.prerequisites ?? [];
    const isModule = filePath.startsWith('content/');

    const markdown = `---\n` +
      `id: ${id}\n` +
      `title: ${title}\n` +
      `author: ${author}\n` +
      `description: ${description}\n` +
      `prerequisites: ${JSON.stringify(prerequisites)}\n` +
      `---\n\n` +
      `## Overview\n\n` +
      `TODO.\n\n` +
      `## Key Ideas\n\n` +
      `- TODO\n` +
      (isModule
        ? `\n## Practice Problems\n\n<Problems problems="practice" />\n`
        : '\n');

    const problems = isModule
      ? await formatProblems(
          JSON.stringify({ MODULE_ID: id, practice: [] }, null, 2)
        )
      : '';

    const newFile: EditorFile = {
      path: filePath,
      markdown,
      problems,
    };

    const updateOrdering = async () => {
      if (!isModule) return;
      const sectionFolder = Object.keys(sectionFolderMap).find(folder =>
        filePath.startsWith(folder)
      );
      if (!sectionFolder) return;
      const sectionId = sectionFolderMap[sectionFolder];
      const orderingInList = get(filesListAtom).find(
        file => file === orderingFilePath
      );
      const orderingSource = orderingInList
        ? get(filesFamily(orderingFilePath)).markdown
        : (await fetchFileContent(orderingFilePath)).markdown;
      const updated = insertModuleIntoOrdering(
        orderingSource,
        sectionId,
        id,
        payload.chapterName?.trim()
      );
      if (!updated) return;
      set(saveFileAtom, {
        path: orderingFilePath,
        markdown: updated,
        problems: '',
      });
      set(filesListAtom, prev =>
        prev.includes(orderingFilePath) ? prev : [...prev, orderingFilePath]
      );
    };

    set(filesListAtom, prev => [...new Set([...prev, newFile.path])]);
    set(saveFileAtom, newFile);
    set(activeFileAtom, newFile.path);
    await updateOrdering();
  }
);

export const closeFileAtom = atom(null, (get, set, filePath: string) => {
  set(
    filesListAtom,
    get(filesListAtom).filter(file => file !== filePath)
  );
  if (get(activeFileAtom)?.path === filePath) {
    const remainingFiles = get(filesListAtom);
    set(activeFileAtom, remainingFiles.length > 0 ? remainingFiles[0] : null);
  }
  filesFamily.remove(filePath);
});

const baseMonacoEditorInstanceAtom = atom({ monaco: null as any });
export const monacoEditorInstanceAtom = atom(
  get => get(baseMonacoEditorInstanceAtom),
  (get, _set, val: any) => {
    get(baseMonacoEditorInstanceAtom).monaco = val;
  }
);
