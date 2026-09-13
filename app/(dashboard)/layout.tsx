// app/(dashboard)/layout.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { roleDashboards } from '@/lib/constants';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const expectedPath = roleDashboards[user.role];
      
      if (path !== expectedPath && !path.startsWith('/api')) {
        const isDashboard = Object.values(roleDashboards).some(r => path.startsWith(r));
        if (isDashboard && path !== expectedPath) {
          router.push(expectedPath);
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <main className="pt-6 min-h-screen bg-background">{children}</main>;
}