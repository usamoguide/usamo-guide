import * as React from 'react';
import { useMemo } from 'react';
import { useActiveHash } from '../../../hooks/useActiveHash';
import { TOCHeading } from '../../../models/module';
import genLinksFromTOCHeadings from './genLinksFromTOCHeadings';
import LinksToEdit from './LinksToEdit';

const TableOfContentsSidebar = ({
  tableOfContents,
}: {
  tableOfContents: TOCHeading[];
}) => {
  const hashes = useMemo(
    () => tableOfContents.map(heading => heading.slug),
    [tableOfContents]
  );
  const activeHash = useActiveHash(hashes, '10px 0px 0px 0px');

  const getLinkStyles = heading =>
    'block mb-1 text-sm transition ' +
    (activeHash === heading.slug
      ? 'underline text-blue-600 dark:text-dark-high-emphasis'
      : 'text-gray-600 hover:underline hover:text-blue-600 dark:text-dark-med-emphasis');
  const links = genLinksFromTOCHeadings(tableOfContents, getLinkStyles);

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl bg-white/95 p-6 dark:bg-gray-800/90">
      <LinksToEdit className="group mb-4 inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" />
      {tableOfContents.length > 1 && (
        <>
          <h2 className="dark:text-dark-med-emphasis mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
            Table of Contents
          </h2>
          {links}
        </>
      )}
    </div>
  );
};

export default TableOfContentsSidebar;
