import * as React from 'react';

const ForumCTA = (): JSX.Element => {
  return (
    <div
      className="mx-auto mb-6 max-w-3xl rounded-2xl"
      style={{
        background: 'var(--card-bg)',
      }}
    >
      <div className="px-4 py-5 text-center sm:p-6">
        <h3
          className="font-mono text-lg leading-6 font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Join the Discord Community!
        </h3>
        <div
          className="mx-auto mt-2 max-w-xl text-sm leading-5"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>
            Stuck on a problem, or don't understand a module? Join the Discord
            and get help with your doubts while making more math friends.
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <a
            href="https://discord.gg/X2zx6u53XH"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForumCTA;
