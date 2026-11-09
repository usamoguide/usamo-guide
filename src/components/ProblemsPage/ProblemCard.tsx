import { Link } from 'gatsby';
import * as React from 'react';
import { moduleIDToURLMap } from '../../../content/ordering';
import { useHideModulesSetting } from '../../context/UserDataContext/properties/simpleProperties';
import { AlgoliaProblemInfo, getProblemURL } from '../../models/problem';
import { cleanTex, diffOf } from '../ug/problems/facets';
import ProblemStatusMenu, { useProblemStatus } from '../ug/ProblemStatusMenu';

export type ProblemHit = AlgoliaProblemInfo & { objectID: string };

/** Where a module listed under "Appears in" lives, pointing at the problem's row. */
function moduleHref(
  m: ProblemHit['problemModules'][number],
  objectID: string
): string | null {
  const base = m.section ? `/${m.section}/${m.id}` : moduleIDToURLMap[m.id];
  return base ? `${base.replace(/\/$/, '')}/#problem-${objectID}` : null;
}

function hostOf(url: string): string {
  try {
    return ' on ' + new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

/** One problem in the results grid (`.pc`). */
export default function ProblemCard({
  hit,
  showTags,
  showDiff,
}: {
  hit: ProblemHit;
  showTags: boolean;
  showDiff: boolean;
}): JSX.Element {
  const status = useProblemStatus(hit.objectID);
  const hideModules = useHideModulesSetting();
  const name = cleanTex(hit.name);
  const src = cleanTex(hit.source);
  const diff = diffOf(hit.difficulty);
  const mods = hit.problemModules ?? [];
  const cls =
    status === 'Solved'
      ? 'pc solved'
      : status === 'Ignored'
        ? 'pc ignored'
        : 'pc';
  const url = getProblemURL({
    source: hit.source,
    name: hit.name,
    uniqueId: hit.objectID,
  });

  return (
    <article className={cls}>
      <div className="pc-top">
        {hit.url ? (
          <a
            className="pc-src"
            href={hit.url}
            target="_blank"
            rel="noreferrer"
            title={`Open the original problem${hostOf(hit.url)}`}
          >
            {src}
          </a>
        ) : (
          <span className="pc-src">{src}</span>
        )}
        {hit.isStarred ? (
          <span className="pc-feat">
            <svg
              className="ico-star"
              viewBox="-10 -10 20 20"
              aria-hidden="true"
            >
              <path d="M0-7C.7-1.8 1.8-.7 7 0C1.8.7.7 1.8 0 7C-.7 1.8-1.8.7-7 0C-1.8-.7-.7-1.8 0-7Z" />
            </svg>
            Featured
          </span>
        ) : null}
        <ProblemStatusMenu uniqueId={hit.objectID} name={name} alignRight />
      </div>
      <h3 className="pc-t">
        <Link to={url}>{name}</Link>
      </h3>
      {mods.length > 0 && !hideModules ? (
        <div className="pc-in">
          <p className="pc-in-k">Appears in</p>
          <ul className="pc-mods">
            {mods.map(m => {
              const href = moduleHref(m, hit.objectID);
              return (
                <li key={m.id}>
                  {href ? (
                    <Link to={href}>{cleanTex(m.title)}</Link>
                  ) : (
                    cleanTex(m.title)
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <div className="pc-foot">
        {showDiff && diff ? (
          <span className={`diff ${diff.cls}`}>{diff.label}</span>
        ) : null}
        {showTags
          ? (hit.tags ?? []).map(t => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))
          : null}
      </div>
    </article>
  );
}
