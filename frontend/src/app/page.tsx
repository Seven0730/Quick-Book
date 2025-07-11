'use client';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { userRole, isAuthenticated } = useUserContext();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (isAuthenticated && userRole) {
      router.push(`/${userRole}`);
    }
    // If no role selected, ModuleLayout will handle showing role selection
  }, [userRole, isAuthenticated, router]);

  // This page will only show briefly during redirects
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
