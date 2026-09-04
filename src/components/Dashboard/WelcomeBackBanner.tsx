import { Link } from 'gatsby';
import * as React from 'react';

export default function WelcomeBackBanner({
  lastViewedModuleURL,
  lastViewedModuleLabel,
}) {
  return (
    <div
      className="w-full lg:rounded-2xl"
      style={{
        background: 'var(--card-bg)',
      }}
    >
      <Link
        className="block px-4 py-6 sm:flex sm:items-center sm:justify-between sm:p-8"
        to={lastViewedModuleURL || '/foundations'}
      >
        <div>
          <h3
            className="text-xl leading-7 font-medium sm:text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {lastViewedModuleURL
              ? 'Welcome Back!'
              : 'Welcome to the USAMO Guide!'}
          </h3>
          <div className="mt-2 font-medium" style={{ color: 'var(--accent)' }}>
            <p>
              {lastViewedModuleURL
                ? `Pick up where you left off. Your last viewed module was "${lastViewedModuleLabel}."`
                : 'Start your Journey!'}
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center lg:mr-2">
          <span className="inline-flex rounded-md">
            <span
              className="btn btn-primary"
            >
              {lastViewedModuleURL
                ? `Continue: ${lastViewedModuleLabel}`
                : 'Explore Your First topic'}
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
