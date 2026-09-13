'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-text">Analytics Dashboard</h1>
      <p className="text-text-secondary">Welcome, {user?.firstName}! Platform analytics.</p>
    </div>
  );
}