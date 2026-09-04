import * as React from 'react';

export default function DashboardCard(props) {
  return (
    <div
      className="rounded-xl border p-0"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
      {...props}
    />
  );
}
