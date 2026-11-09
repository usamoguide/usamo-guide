import * as React from 'react';
import { IcoCheck, IcoChev } from '../ug/icons';
import { DiffKey, DIFFS, SOURCE_FAMILIES } from '../ug/problems/facets';
import { TOPIC_GROUPS, topicGroupOf } from '../ug/problems/topics';

/** How many topics a group lists before "Show all". */
const TOPICS_SHOWN = 8;

const fmt = (n: number) => n.toLocaleString('en-US');

export type TopicItem = {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
};

function Check({
  checked,
  onToggle,
  children,
  count,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}): JSX.Element {
  return (
    <button
      className="fchk"
      type="button"
      role="checkbox"
      aria-checked={checked ? 'true' : 'false'}
      onClick={onToggle}
    >
      <span className="box" aria-hidden="true">
        <IcoCheck />
      </span>
      {children}
      {count !== undefined ? <span className="cnt">{fmt(count)}</span> : null}
    </button>
  );
}

function TopicGroup({
  name,
  items,
  open,
  onToggle,
}: {
  name: string;
  items: TopicItem[];
  open: boolean;
  onToggle: (value: string) => void;
}): JSX.Element {
  const [all, setAll] = React.useState(false);
  const total = items.reduce((n, t) => n + t.count, 0);
  // the most common topics, plus any you've picked further down the list
  const shown = all
    ? items
    : items.filter((t, i) => i < TOPICS_SHOWN || t.isRefined);
  const more = items.length - shown.length;
  return (
    <details className="fl-topic" open={open}>
      <summary>
        <span>{name}</span>
        <span className="cnt">{fmt(total)}</span>
        <IcoChev />
      </summary>
      <div className="fl-items">
        {shown.map(t => (
          <Check
            key={t.value}
            checked={t.isRefined}
            onToggle={() => onToggle(t.value)}
            count={t.count}
          >
            <span className="fchk-t">{t.label}</span>
          </Check>
        ))}
        {more > 0 || all ? (
          <button
            className="fl-more"
            type="button"
            aria-expanded={all ? 'true' : 'false'}
            onClick={() => setAll(!all)}
          >
            {all ? 'Show fewer' : `Show all ${items.length}`}
          </button>
        ) : null}
      </div>
    </details>
  );
}

/** The sidebar (`.pb-side`): topics, difficulty, source. Folds into a panel on phones. */
export default function FilterSidebar({
  topics,
  onTopic,
  diffs,
  diffCounts,
  onDiff,
  srcs,
  srcCounts,
  onSrc,
  tagsShown,
  onFlipTags,
  activeN,
  onClearAll,
}: {
  topics: TopicItem[];
  onTopic: (value: string) => void;
  diffs: DiffKey[];
  diffCounts: Record<string, number>;
  onDiff: (k: DiffKey) => void;
  srcs: string[];
  srcCounts: Record<string, number>;
  onSrc: (k: string) => void;
  tagsShown: boolean;
  onFlipTags: () => void;
  activeN: number;
  onClearAll: () => void;
}): JSX.Element {
  const [open, setOpen] = React.useState(false);

  const groups = React.useMemo(() => {
    const by: Record<string, TopicItem[]> = {};
    topics.forEach(t => {
      const g = topicGroupOf(t.label);
      by[g] = [...(by[g] ?? []), t];
    });
    return TOPIC_GROUPS.filter(g => by[g]).map(g => ({
      name: g,
      items: by[g].sort(
        (a, b) => b.count - a.count || a.label.localeCompare(b.label)
      ),
    }));
  }, [topics]);

  return (
    <aside className="pb-side" aria-label="Filters">
      <div className={open ? 'pb-fdet open' : 'pb-fdet'}>
        <button
          className="pb-fsum"
          type="button"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls="pb-side-in"
          onClick={() => setOpen(!open)}
        >
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span>Filters</span>
          <span className="pb-fn">{activeN ? `${activeN} on` : 'None on'}</span>
          <IcoChev />
        </button>
        <div className="pb-side-in" id="pb-side-in">
          <button
            className="pb-tagtg"
            type="button"
            aria-pressed={tagsShown ? 'false' : 'true'}
            onClick={onFlipTags}
          >
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="2.8" />
            </svg>
            <span>{tagsShown ? 'Hide tags' : 'Show tags'}</span>
          </button>
          <div className="fl-group">
            <p className="fl-k">Topics</p>
            {groups.map(g => (
              <TopicGroup
                key={g.name}
                name={g.name}
                items={g.items}
                open={TOPIC_GROUPS.indexOf(g.name) < 3}
                onToggle={onTopic}
              />
            ))}
          </div>
          <div className="fl-group">
            <p className="fl-k">Difficulty</p>
            {DIFFS.map(d => (
              <Check
                key={d.key}
                checked={diffs.includes(d.key)}
                onToggle={() => onDiff(d.key)}
                count={diffCounts[d.key] ?? 0}
              >
                <span className={`diff ${d.cls}`}>{d.label}</span>
              </Check>
            ))}
          </div>
          <div className="fl-group">
            <p className="fl-k">Source</p>
            {SOURCE_FAMILIES.filter(
              f => srcCounts[f.key] || srcs.includes(f.key)
            ).map(f => (
              <Check
                key={f.key}
                checked={srcs.includes(f.key)}
                onToggle={() => onSrc(f.key)}
                count={srcCounts[f.key] ?? 0}
              >
                <span className="fchk-t">{f.label}</span>
              </Check>
            ))}
          </div>
          <button className="fl-clear" type="button" onClick={onClearAll}>
            Clear all filters
          </button>
        </div>
      </div>
    </aside>
  );
}
