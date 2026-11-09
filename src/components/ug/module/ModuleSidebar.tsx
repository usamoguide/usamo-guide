import { Link } from 'gatsby';
import * as React from 'react';
import { SectionID } from '../../../../content/ordering';
import { ModuleProgress } from '../../../models/module';
import { IcoChev, IcoGear } from '../icons';
import { UG_LINKS, UG_TRACKS } from '../links';
import SettingsMenu from '../SettingsMenu';
import {
  MODULE_STATUS,
  moduleStatusIndex,
  NavChapter,
  sidebarStatusCls,
} from './track';

const IcoList = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" />
  </svg>
);

const IcoMail = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
  </svg>
);

/**
 * The whole track in a sidebar (`.sb`): the track switcher, progress, every
 * chapter and module with its status, and settings and contact at the foot.
 * Below 760px it folds into a panel at the top of the page.
 */
export default function ModuleSidebar({
  division,
  chapters,
  currentId,
  progress,
  trackCounts,
}: {
  division: SectionID;
  chapters: NavChapter[];
  currentId: string;
  progress: { [moduleId: string]: ModuleProgress };
  /** number of modules in each track, for the switcher */
  trackCounts: { [division: string]: number };
}): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);
  const track = UG_TRACKS.find(t => t.id === division);
  const trackLabel = track?.label ?? division;

  const total = chapters.reduce((n, ch) => n + ch.modules.length, 0);
  const done = chapters.reduce(
    (n, ch) => n + ch.modules.filter(m => progress[m.id] === 'Complete').length,
    0
  );
  const pct = total ? Math.round((100 * done) / total) : 0;

  // keep the current module in view inside the sidebar's own scroll
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const cur = nav.querySelector<HTMLElement>('.sb-m.cur');
    if (!cur) return;
    const n = nav.getBoundingClientRect();
    const c = cur.getBoundingClientRect();
    if (c.top < n.top || c.bottom > n.bottom) {
      nav.scrollTop += c.top - n.top - nav.clientHeight / 3;
    }
  }, [currentId]);

  return (
    <aside className="sb" aria-label="Track navigation">
      <div className={open ? 'sb-fold open' : 'sb-fold'}>
        <button
          className="sb-sum"
          type="button"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls="sb-in"
          onClick={() => setOpen(o => !o)}
        >
          <IcoList />
          <span className="sb-sum-t">{trackLabel}</span>
          <span className="sb-sum-p">
            {done} of {total} done
          </span>
          <IcoChev />
        </button>
        <div className="sb-in" id="sb-in">
          <details className="sb-track" data-dismiss="">
            <summary className="sb-track-btn">
              <span className="sb-track-k">Track</span>
              <b>{trackLabel}</b>
              <IcoChev />
            </summary>
            <div
              className="sb-track-menu"
              role="menu"
              aria-label="Switch track"
            >
              {UG_TRACKS.map(t => (
                <Link
                  key={t.id}
                  className={t.id === division ? 'on' : undefined}
                  to={`/${t.id}`}
                  role="menuitemradio"
                  aria-checked={t.id === division ? 'true' : 'false'}
                >
                  <span>{t.label}</span>
                  <small>{trackCounts[t.id] ?? 0} modules</small>
                </Link>
              ))}
            </div>
          </details>
          <div className="sb-prog">
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <p>
              <b>{done}</b> of {total} modules done
            </p>
          </div>
          <nav
            className="sb-nav"
            aria-label={`Modules in ${trackLabel}`}
            ref={navRef}
          >
            {chapters.map(ch => {
              const here = ch.modules.some(m => m.id === currentId);
              const chDone = ch.modules.filter(
                m => progress[m.id] === 'Complete'
              ).length;
              return (
                <details
                  key={ch.n}
                  className={here ? 'sb-sec here' : 'sb-sec'}
                  open
                >
                  <summary>
                    <span className="sb-sec-t">{ch.name}</span>
                    <span className="sb-cnt">
                      {chDone}/{ch.modules.length}
                    </span>
                    <IcoChev className="chev" />
                  </summary>
                  <ol className="sb-ol">
                    {ch.modules.map(m => {
                      const st = progress[m.id];
                      const cur = m.id === currentId;
                      const cls = [
                        'sb-m',
                        cur ? 'cur' : '',
                        sidebarStatusCls(st),
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return (
                        <li key={m.id}>
                          <Link
                            className={cls}
                            to={m.url}
                            aria-current={cur ? 'page' : undefined}
                          >
                            <span
                              className="sd"
                              role="img"
                              aria-label={
                                MODULE_STATUS[moduleStatusIndex(st)].label
                              }
                            />
                            <span className="sb-m-t">{m.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              );
            })}
          </nav>
          <div className="sb-foot">
            <SettingsMenu
              up
              summaryContent={
                <summary className="sb-foot-a">
                  <IcoGear />
                  <span>Settings</span>
                </summary>
              }
            />
            <Link className="sb-foot-a" to={UG_LINKS.contact}>
              <IcoMail />
              <span>Contact us</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
