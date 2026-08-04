import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { createNewPageFileAtom } from '../../atoms/editor';
import MODULE_ORDERING from '../../../content/ordering';

const sectionOptions = [
  'content/1_Foundations',
  'content/2_Intermediate',
  'content/3_Advanced',
  'content/4_USAMO',
] as const;

const sectionPathToId: Record<string, keyof typeof MODULE_ORDERING> = {
  'content/1_Foundations': 'foundations',
  'content/2_Intermediate': 'intermediate',
  'content/3_Advanced': 'advanced',
  'content/4_USAMO': 'usamo',
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toFileName = (value: string) => {
  const words = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return 'New_Page';
  return words.map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join('_');
};

export default function AddPageModal(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createPage = useSetAtom(createNewPageFileAtom);
  const [sectionPath, setSectionPath] = useState<string>(sectionOptions[0]);
  const [title, setTitle] = useState('');
  const [pageId, setPageId] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('USAMO Guide Team');
  const [prerequisites, setPrerequisites] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [customChapter, setCustomChapter] = useState('');
  const [path, setPath] = useState('');
  const [pathTouched, setPathTouched] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  const [status, setStatus] = useState<
    'Create Page' | 'Creating Page...'
  >('Create Page');

  useEffect(() => {
    if (idTouched) return;
    setPageId(slugify(title));
  }, [idTouched, title]);

  useEffect(() => {
    if (pathTouched) return;
    const fileName = toFileName(title);
    setPath(`${sectionPath}/${fileName}.mdx`);
  }, [pathTouched, sectionPath, title]);

  useEffect(() => {
    const sectionId = sectionPathToId[sectionPath];
    const chapters = MODULE_ORDERING[sectionId] ?? [];
    if (chapters.length === 0) {
      setSelectedChapter('');
      return;
    }
    setSelectedChapter(chapters[0].name);
  }, [sectionPath]);

  const handleCreate = async () => {
    if (!path.trim()) {
      alert('Please provide a file path.');
      return;
    }
    setStatus('Creating Page...');
    const cleanedPrereqs = prerequisites
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
    const chapterName = customChapter.trim() || selectedChapter.trim();

    await createPage({
      path: path.trim(),
      title: title.trim(),
      id: pageId.trim(),
      description: description.trim(),
      author: author.trim(),
      prerequisites: cleanedPrereqs,
      chapterName,
    });

    setStatus('Create Page');
    props.onClose();
  };

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.onClose}
      className="relative z-10"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in dark:bg-gray-700/75"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <DialogPanel
            transition
            className="flex w-full max-w-xl transform flex-col items-start rounded-lg bg-white p-5 text-left transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 dark:bg-black dark:text-white"
          >
            <h3 className="text-lg font-bold">Create New Page</h3>
            <label className="mt-3 block text-sm font-medium">Title</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="e.g. Geometry Basics"
              onChange={e => setTitle(e.target.value)}
              value={title}
            />

            <label className="mt-3 block text-sm font-medium">Module ID</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="e.g. geometry-basics"
              onChange={e => {
                setPageId(e.target.value);
                setIdTouched(true);
              }}
              value={pageId}
            />

            <label className="mt-3 block text-sm font-medium">Section Folder</label>
            <select
              className="block w-full rounded-md border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              value={sectionPath}
              onChange={e => setSectionPath(e.target.value)}
            >
              {sectionOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm font-medium">Chapter</label>
            <select
              className="block w-full rounded-md border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              value={selectedChapter}
              onChange={e => {
                setSelectedChapter(e.target.value);
                setCustomChapter('');
              }}
            >
              {(MODULE_ORDERING[sectionPathToId[sectionPath]] ?? []).map(
                chapter => (
                  <option key={chapter.name} value={chapter.name}>
                    {chapter.name}
                  </option>
                )
              )}
            </select>
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Or create a new chapter
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="New chapter name"
              onChange={e => setCustomChapter(e.target.value)}
              value={customChapter}
            />

            <label className="mt-3 block text-sm font-medium">File Path</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="content/1_Foundations/New_Page.mdx"
              onChange={e => {
                setPath(e.target.value);
                setPathTouched(true);
              }}
              value={path}
            />

            <label className="mt-3 block text-sm font-medium">Description</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="Short summary for the module"
              onChange={e => setDescription(e.target.value)}
              value={description}
            />

            <label className="mt-3 block text-sm font-medium">Author</label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              onChange={e => setAuthor(e.target.value)}
              value={author}
            />

            <label className="mt-3 block text-sm font-medium">
              Prerequisites (comma separated IDs)
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="algebra-basics, counting-fundamentals"
              onChange={e => setPrerequisites(e.target.value)}
              value={prerequisites}
            />

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Pages under content/ will also get a matching .problems.json file.
            </p>

            <button
              className="btn mt-4"
              disabled={status === 'Creating Page...'}
              onClick={handleCreate}
            >
              {status}
            </button>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
