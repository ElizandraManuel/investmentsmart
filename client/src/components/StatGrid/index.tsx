import type { ReactNode } from 'react';
import './style.css';

export default function StatGrid({ children }: { children: ReactNode }) {
  return <div className="stat-grid">{children}</div>;
}
