import * as React from 'react';

export default function DashboardCard(props) {
  return (
    <div
      className="rounded-2xl p-0 transition"
      style={{
        background: 'rgba(43, 30, 57, 0.92)',
      }}
      {...props}
    />
  );
}
