import type { ReactNode } from 'react';
import { Sidebar }       from './Sidebar';

export function ModuleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
