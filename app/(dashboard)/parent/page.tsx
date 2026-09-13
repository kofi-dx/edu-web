/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ArrowRight,
  School,
  GraduationCap,
  User,
  TrendingUp,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getParentDashboard } from '@/lib/services/schoolAdminService';

interface ChildStats {
  id: string;
  admissionNumber: string;
  name: string;
  class: string;
  school: string;
  teacher: string;
}

interface DashboardData {
  parent: any;
  user: any;
  stats: {
    totalChildren: number;
    children: ChildStats[];
  };
}

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await getParentDashboard();
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const children = data?.stats?.children || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-akoma-green to-akoma-dark rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome, {user?.firstName}! 👋
            </h1>
            <p className="text-white/80 mt-1">
              {children.length > 0
                ? `Monitoring ${children.length} ${children.length === 1 ? 'child' : 'children'}`
                : 'No children linked yet'}
            </p>
          </div>
          <Link href="/parent/children">
            <Button className="bg-white text-akoma-green hover:bg-white/90 gap-2">
              <Users className="h-4 w-4" />
              View Children
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Children</p>
              <p className="text-xl font-bold text-text">{children.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <School className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Schools</p>
              <p className="text-xl font-bold text-text">
                {new Set(children.map(c => c.school)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Classes</p>
              <p className="text-xl font-bold text-text">
                {new Set(children.map(c => c.class)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Linked</p>
              <p className="text-xl font-bold text-text">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Children Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Users className="h-5 w-5 text-akoma-green" />
            My Children
          </h2>
          {children.length > 0 && (
            <Link href="/parent/children" className="text-sm text-akoma-green hover:underline">
              View all
            </Link>
          )}
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
            <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary mb-4">No children linked yet</p>
            <p className="text-xs text-text-secondary">
              Contact your school administrator to link your children
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/parent/children/${child.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-full bg-akoma-green/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-akoma-green" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                </div>

                <h3 className="font-semibold text-text mb-1">{child.name}</h3>
                <p className="text-xs text-text-secondary font-mono mb-2">
                  {child.admissionNumber}
                </p>

                <div className="space-y-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{child.class}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5" />
                    <span className="truncate">{child.school}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/parent/children"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-akoma-green" />
              <span className="text-sm font-medium text-text">My Children</span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/parent/profile"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-akoma-green" />
              <span className="text-sm font-medium text-text">My Profile</span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/parent/settings"
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              <span className="text-sm font-medium text-text">Settings</span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}