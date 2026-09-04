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
      ? 'underline text-[var(--text-primary)] dark:text-dark-high-emphasis'
      : 'text-[var(--text-primary)] hover:underline hover:text-[var(--text-primary)] dark:text-dark-med-emphasis');
  const links = genLinksFromTOCHeadings(tableOfContents, getLinkStyles);

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl bg-[var(--card-bg)] p-6">
      <LinksToEdit className="group mb-4 inline-flex items-center rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--accent-soft)]" />
      {tableOfContents.length > 1 && (
        <>
          <h2 className="dark:text-dark-med-emphasis mb-4 text-sm font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            Table of Contents
          </h2>
          {links}
        </>
      )}
    </div>
  );
};

export default TableOfContentsSidebar;
