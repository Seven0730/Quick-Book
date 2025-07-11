'use client';
import type { ReactNode } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { Sidebar } from './Sidebar';
import { RoleSelectionPage } from './RoleSelectionPage';

export function ModuleLayout({ children }: { children: ReactNode }) {
  const { userRole, isAuthenticated } = useUserContext();

  // If no role is selected, show role selection
  if (!userRole) {
    return <RoleSelectionPage />;
  }

  // If provider is not authenticated, don't show sidebar (they should be on login page)
  if (userRole === 'provider' && !isAuthenticated) {
    return <>{children}</>;
  }

  // For authenticated users, show sidebar layout
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
