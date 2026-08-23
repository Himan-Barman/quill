'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { GlobalSearch } from './GlobalSearch';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login' && pathname !== '/auth/callback') {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>
    );
  }

  // If on login page or auth callback, don't show sidebar
  if (pathname === '/login' || pathname === '/auth/callback') {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Only render children if authenticated (or will redirect shortly)
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Fixed Floating Search Bar on Home */}
        {pathname === '/' && (
          <div className="fixed top-3 left-0 right-0 md:left-64 z-50 pointer-events-none flex justify-center">
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex justify-center">
              <div className="pointer-events-auto w-full max-w-2xl flex justify-center">
                <GlobalSearch />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
