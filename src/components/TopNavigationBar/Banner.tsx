import * as React from 'react';

export default function Banner({
  text,
  action,
  link,
}: {
  text: string;
  action: string | null;
  link: string | null;
}) {
  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-[var(--banner-bg)] px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-577/310 w-[36.0625rem] bg-[var(--banner-glow-from)] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>
      <div
        className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          className="aspect-577/310 w-[36.0625rem] bg-[var(--banner-glow-from)] opacity-30"
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-gray-900 dark:text-white">
          {text}
        </p>

        {action && link ? (
          <>
            <svg
              viewBox="0 0 2 2"
              className="inline h-0.5 w-0.5 fill-current"
              aria-hidden="true"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>

            <a
              href={link}
              className="accent-button flex-none rounded-full px-3.5 py-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              {action} <span aria-hidden="true">&rarr;</span>
            </a>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-1 justify-end">
        <span className="sr-only">Dismiss</span>
      </div>
    </div>
  );
}
