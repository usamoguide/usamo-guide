import * as React from 'react';
import { ResourceInfo } from '../../models/resource';
import { books } from '../../utils/books';
import { ListTable } from './ListTable/ListTable';
import ResourcesListItem from './ResourcesListItem';

export function ResourcesList({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <ListTable
      header={
        <>
          <tr>
            <th
              colSpan={6}
              className={`border-b [border-color:var(--border)] px-4 py-3 text-left text-sm font-medium [color:var(--text-secondary)] uppercase [background:var(--bg-surface-alt)] sm:px-6`}
            >
              Resources{title ? `: ${title}` : ''}
            </th>
          </tr>
        </>
      }
    >
      {children}
    </ListTable>
  );
}

const moduleSources = {
  AoPS: ['https://artofproblemsolving.com/', 'Art of Problem Solving'],
  AoPSWiki: ['https://artofproblemsolving.com/wiki/index.php', 'AoPS Wiki'],
  MAA: ['https://www.maa.org/math-competitions', 'MAA Competitions'],
  Khan: ['https://www.khanacademy.org/math', 'Khan Academy'],
  Brilliant: ['https://brilliant.org/courses/', 'Brilliant'],
  AoPSOnline: ['https://artofproblemsolving.com/online', 'AoPS Online'],
};

export function Resource({
  source,
  sourceDescription,
  url,
  starred,
  title,
  children,
}: {
  source?: string;
  sourceDescription?: string;
  url?: string;
  starred?: boolean;
  title?: string;
  children?: React.ReactNode;
}): JSX.Element {
  source = source ?? '';
  sourceDescription = sourceDescription ?? '';
  if (source in books) {
    sourceDescription = books[source][1];
    if (!url) {
      // auto-gen page #
      const getSec = (dictKey, book, title) => {
        const parts = title.split(' ');
        let url = book;
        let sec = parts[0];
        if (sec[sec.length - 1] == ',') sec = sec.substring(0, sec.length - 1);
        if (!/^\d.*$/.test(sec)) return url;
        if (!(sec in PGS[dictKey])) {
          throw `Could not find section ${sec} in source ${dictKey} (title ${title})`;
        }
        url += '#page=' + PGS[dictKey][sec];
        return url;
      };
      url = books[source][0];
    }
  } else if (source in moduleSources) {
    if (!url?.startsWith('http')) url = moduleSources[source][0] + url;
    sourceDescription = moduleSources[source][1];
  } else {
    if (!url?.startsWith('http')) {
      throw `URL ${url} is not valid. Did you make a typo in the source (${source}), or in the URL? Resource name: ${title}`;
    }
  }
  const resource: ResourceInfo = {
    source,
    sourceDescription,
    url,
    starred,
    title,
    children,
  };
  return <ResourcesListItem resource={resource} />;
}
