import { Link } from 'gatsby';
import * as React from 'react';
import DashboardCard from './DashboardCard';

type ActiveItemStatus =
  | 'Skipped'
  | 'Ignored'
  | 'Reading' // only for modules
  | 'Practicing' // only for modules
  | 'Solving' // only for problems
  | 'Reviewing'; // only for problems

export type ActiveItem = {
  label: string;
  status: ActiveItemStatus;
  url: string;
};

/* Status reads from the label first; the fill only separates "in flight" from
   "set aside". Active states share one neutral wash rather than getting a hue
   each, so the row scans as a list instead of a colour key. */
const statusClasses: { [key in ActiveItemStatus]: string } = {
  Skipped: 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]',
  Ignored: 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]',
  Reading: 'bg-[var(--accent-soft)] text-[var(--text-primary)]',
  Practicing: 'bg-[var(--accent-soft)] text-[var(--text-primary)]',
  Solving: 'bg-[var(--accent-soft)] text-[var(--text-primary)]',
  Reviewing: 'bg-[var(--accent-soft-strong)] text-[var(--text-primary)]',
};

export default function ActiveItems({
  type,
  items,
}: {
  type: 'problems' | 'modules';
  items: ActiveItem[];
}): JSX.Element {
  items.sort((a, b) => {
    // sort active modules in order of section
    const strcmp = (x, y) => {
      if (x < y) return -1;
      if (x > y) return 1;
      return 0;
    };
    const statusVal: { [key in ActiveItemStatus]: number } = {
      Reviewing: -1,
      Reading: 0,
      Solving: 1,
      Practicing: 1,
      Skipped: 2,
      Ignored: 3,
    };
    const astatus = statusVal[a.status];
    const bstatus = statusVal[b.status];
    if (astatus != bstatus) return astatus - bstatus;
    const getLabel = x => {
      // put active modules in section order
      const secs = ['Foundations', 'Intermediate', 'Advanced', 'USAMO'];
      for (let i = 0; i < secs.length; ++i) if (x.startsWith(secs[i])) return i;
      return 100;
    };
    const aval = getLabel(a.label);
    const bval = getLabel(b.label);
    if (aval != bval) return aval - bval;
    return strcmp(a.label, b.label);
  });
  return (
    <DashboardCard>
      <div className="px-4 py-5 sm:p-6">
        <h3
          className="text-lg leading-6 font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Active {type === 'problems' ? 'Problems' : 'Modules'}
        </h3>
        <div className="mt-4" style={{ color: 'var(--text-muted)' }}>
          {items.map((item, idx) => (
            <p className={idx === 0 ? '' : 'mt-2'} key={item.url}>
              <Link
                to={item.url}
                className="font-medium transition duration-150 ease-in-out"
                style={{ color: 'var(--accent)' }}
              >
                {item.label}
                <span
                  className={
                    'ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs leading-4 font-medium ' +
                    statusClasses[item.status]
                  }
                >
                  {item.status}
                </span>
              </Link>
            </p>
          ))}
          {/*<p>*/}
          {/*  <a*/}
          {/*    href="#"*/}
          {/*    className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 transition ease-in-out duration-150"*/}
          {/*  >*/}
          {/*    Longest Common Subsequence*/}
          {/*    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium leading-4 bg-gray-100 text-gray-800">*/}
          {/*      Skipped*/}
          {/*    </span>*/}
          {/*  </a>*/}
          {/*</p>*/}
        </div>
      </div>
    </DashboardCard>
  );
}
