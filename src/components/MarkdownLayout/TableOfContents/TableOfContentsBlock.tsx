import * as React from 'react';
import { TOCHeading } from '../../../models/module';
import genLinksFromTOCHeadings from './genLinksFromTOCHeadings';

const TableOfContentsBlock = ({
  tableOfContents,
}: {
  tableOfContents: TOCHeading[];
}) => {
  const links = genLinksFromTOCHeadings(
    tableOfContents,
    _ =>
      'block mb-1 text-sm transition hover:underline text-[rgba(244,237,234,0.72)] hover:text-[#F0C2FF]'
  );

  if (tableOfContents.length <= 1) {
    return null;
  }

  return (
    <aside
      className="mb-6 rounded-2xl p-5 lg:float-right lg:mb-4 lg:ml-6 lg:w-72"
      style={{
        background: 'rgba(43, 30, 57, 0.92)',
      }}
    >
      <h2
        className="mb-4 text-sm font-bold tracking-wider uppercase"
        style={{ color: 'rgba(244,237,234,0.6)' }}
      >
        Table of Contents
      </h2>
      {links}
    </aside>
  );
};

export default TableOfContentsBlock;
