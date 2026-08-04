import * as React from 'react';

const ForumCTA = (): JSX.Element => {
  return (
    <div
      className="mx-auto mb-6 max-w-3xl rounded-2xl"
      style={{
        background: 'rgba(43, 30, 57, 0.92)',
      }}
    >
      <div className="px-4 py-5 text-center sm:p-6">
        <h3
          className="font-mono text-lg leading-6 font-semibold"
          style={{ color: '#F4EDEA' }}
        >
          Join the Discord Community!
        </h3>
        <div
          className="mx-auto mt-2 max-w-xl text-sm leading-5"
          style={{ color: 'rgba(244,237,234,0.72)' }}
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
            className="purple-motion-effect inline-flex items-center justify-center rounded-full px-6 py-2.5 font-mono text-sm leading-tight font-bold"
            style={
              {
                border: '1px solid rgba(240, 194, 255, 0.34)',
                background: '#6D3B9F',
                boxShadow: 'none',
                '--pme-color': '#F4EDEA',
                '--pme-hover-color': '#201C36',
                '--pme-wipe-bg': '#F0C2FF',
              } as React.CSSProperties
            }
          >
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForumCTA;
