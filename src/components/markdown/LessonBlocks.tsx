import * as React from 'react';

/*
 * Lesson blocks from the redesign's module page (module.css), for authors to
 * use in MDX. They render the export's markup; the module page styles them.
 *
 *   <WarmUp question="If 100 machines make 100 donuts in 100 seconds, ...">
 *   100 seconds. Each machine makes one donut every 100 seconds.
 *   </WarmUp>
 *
 *   <Rule>If someone finishes $Y\%$ of a job in $Z$ hours, ...</Rule>
 *
 *   <Formula>$$d = rt$$</Formula>
 */

export function WarmUp({
  question,
  children,
}: {
  question: React.ReactNode;
  /** the answer, behind a "Show answer" reveal */
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="warm">
      <p className="k-label">Warm-up</p>
      <p className="warm-q">{question}</p>
      {children ? (
        <details className="reveal">
          <summary>
            <span className="a-show">Show answer</span>
            <span className="a-hide">Hide answer</span>
          </summary>
          <div className="ans">{children}</div>
        </details>
      ) : null}
      <img
        className="warm-fox"
        src="/ug/img/panda-think.webp"
        alt=""
        width={450}
        height={464}
      />
    </div>
  );
}

export function Rule({
  title = 'Rule',
  children,
}: {
  title?: React.ReactNode;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="rule">
      <p className="k-label">{title}</p>
      {children}
    </div>
  );
}

export function Formula({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element {
  return <div className="formula">{children}</div>;
}
