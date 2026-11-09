import { Link } from 'gatsby';
import * as React from 'react';
import { ModuleProgress } from '../../../models/module';
import Btn from '../Btn';
import { IcoCheck, IcoChevLeft, IcoChevRight } from '../icons';
import { UG_LINKS } from '../links';
import ModuleStatusMenu from './ModuleStatusMenu';
import { NavModule } from './track';

const IcoPen = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M14.5 7.5l2 2" />
  </svg>
);
const IcoOut = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);
const IcoFlag = (): JSX.Element => (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 21V4M6 4.5c4-2 7 2 12 0v9c-5 2-8-2-12 0" />
  </svg>
);

/**
 * The end of the module: progress (status menu + Mark complete, the cheering
 * panda once it's complete), edit/report links, previous/next, and the
 * Discord band.
 */
export default function ModuleEnd({
  status,
  onStatus,
  hasProblems,
  prev,
  next,
  githubEditUrl,
  editorUrl,
  reportUrl,
  updated,
}: {
  status: ModuleProgress;
  onStatus: (s: ModuleProgress) => void;
  hasProblems: boolean;
  prev: NavModule | null;
  next: NavModule | null;
  githubEditUrl: string;
  editorUrl: string;
  reportUrl: string;
  updated: string | null;
}): JSX.Element {
  const complete = status === 'Complete';
  const title = complete
    ? 'Module complete'
    : hasProblems
      ? 'Finished the practice set?'
      : 'Finished this module?';
  const text = complete
    ? next
      ? `Next up is ${next.title}. Your dashboard has it ready.`
      : "That's the last module in this track. Your dashboard keeps your progress."
    : 'Set your progress here, or mark the module complete and your dashboard moves you on to the next one.';

  return (
    <section className="md-end" aria-label="Finish this module">
      <div className={complete ? 'md-done complete' : 'md-done'}>
        {complete ? (
          <img
            className="cele-pose"
            src="/ug/img/panda-cheer.webp"
            alt=""
            width={300}
            height={245}
          />
        ) : null}
        <div className="md-done-t">
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
        <div className="md-done-ctl">
          <p className="md-done-k">Module progress</p>
          <div className="md-done-row">
            <ModuleStatusMenu status={status} onChange={onStatus} up />
            {!complete ? (
              <Btn
                kind="p"
                size="sm"
                className="md-done-b"
                onClick={() => onStatus('Complete')}
              >
                <IcoCheck />
                Mark complete
              </Btn>
            ) : null}
          </div>
        </div>
      </div>
      <div className="md-edit-row">
        <a
          className="md-edit"
          href={githubEditUrl}
          target="_blank"
          rel="noreferrer"
        >
          <IcoPen />
          Edit this page on GitHub
          <IcoOut />
        </a>
        <Link className="md-edit" to={editorUrl}>
          Open in the editor
        </Link>
        <Link className="md-edit" to={reportUrl}>
          <IcoFlag />
          Report an issue
        </Link>
        {updated ? <span className="md-upd">Updated {updated}</span> : null}
      </div>
      <nav className="md-pn" aria-label="Other modules">
        {prev ? (
          <Link className="pn" to={prev.url}>
            <span className="pn-k">
              <IcoChevLeft />
              Previous
            </span>
            <b>{prev.title}</b>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        {next ? (
          <Link className="pn pn-next" to={next.url}>
            <span className="pn-k">
              Next
              <IcoChevRight />
            </span>
            <b>{next.title}</b>
          </Link>
        ) : null}
      </nav>
      <div className="md-help">
        <img
          className="help-fox"
          src="/ug/img/panda-stuck.webp"
          alt=""
          width={450}
          height={464}
        />
        <div className="md-help-t">
          <h3>Join the Discord community</h3>
          <p>
            Stuck on a problem? Post it with what you&apos;ve tried so far and
            someone will help you get unstuck.
          </p>
        </div>
        <Btn kind="w" size="sm" href={UG_LINKS.discord} target="_blank">
          Join the Discord
        </Btn>
      </div>
    </section>
  );
}
