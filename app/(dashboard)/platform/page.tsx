// app/(dashboard)/platform/page.tsx
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Clock,
  School,
  Settings,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPlatformStats, getPendingApplications } from '@/lib/services/adminService';

interface Stats {
  totalSchools: number;
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  pendingSchools: number;
  activeSchools: number;
  suspendedSchools: number;
  totalClasses: number;
  attendanceRate: number;
  studentTeacherRatio: number;
  growthPercent?: number;
}

interface PendingSchool {
  id: string;
  name: string;
  type: string;
  district: string;
  region: string;
  appliedBy: string;
  appliedByEmail: string;
  appliedByPhone: string;
  submittedAt: string;
}

interface Activity {
  id: string;
  type: 'school' | 'user' | 'curriculum' | 'system';
  message: string;
  time: string;
  timestamp: string;
}

export default function PlatformDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingSchools, setPendingSchools] = useState<PendingSchool[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch stats - if it fails, use mock data
      try {
        const statsData = await getPlatformStats();
        setStats(statsData);
      } catch {
        console.warn('Stats endpoint not available, using mock data');
        // Use mock data as fallback
        setStats({
          totalSchools: 10,
          totalUsers: 1500,
          totalStudents: 1200,
          totalTeachers: 80,
          totalParents: 600,
          pendingSchools: 3,
          activeSchools: 7,
          suspendedSchools: 0,
          totalClasses: 50,
          attendanceRate: 94,
          studentTeacherRatio: 15,
        });
      }

      // Try to fetch pending applications - if it fails, use mock data
      try {
        const pendingData = await getPendingApplications();
        setPendingSchools(pendingData.applications || []);
      } catch {
        console.warn('Pending applications endpoint not available, using mock data');
        setPendingSchools([]);
      }

      // Mock recent activity
      setRecentActivity([
        { 
          id: '1', 
          type: 'school', 
          message: 'Kwame Nkrumah Basic School was approved', 
          time: '2 hours ago',
          timestamp: new Date().toISOString()
        },
        { 
          id: '2', 
          type: 'user', 
          message: 'Ama Mensah registered as a student', 
          time: '3 hours ago',
          timestamp: new Date().toISOString()
        },
        { 
          id: '3', 
          type: 'school', 
          message: 'Excellence International School applied', 
          time: '5 hours ago',
          timestamp: new Date().toISOString()
        },
        { 
          id: '4', 
          type: 'user', 
          message: 'Kofi Asare joined as a teacher', 
          time: '1 day ago',
          timestamp: new Date().toISOString()
        },
        { 
          id: '5', 
          type: 'curriculum', 
          message: 'New Ghana National Curriculum 2026 published', 
          time: '2 days ago',
          timestamp: new Date().toISOString()
        },
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set fallback data so the page renders
      setStats({
        totalSchools: 10,
        totalUsers: 1500,
        totalStudents: 1200,
        totalTeachers: 80,
        totalParents: 600,
        pendingSchools: 3,
        activeSchools: 7,
        suspendedSchools: 0,
        totalClasses: 50,
        attendanceRate: 94,
        studentTeacherRatio: 15,
      });
      setPendingSchools([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading platform data...</p>
        </div>
      </div>
    );
  }

  // Stat Cards
  const statCards = [
    {
      title: 'Total Schools',
      value: stats?.totalSchools || 0,
      icon: School,
      color: 'text-akoma-green',
      bg: 'bg-akoma-green/10',
      href: '/platform/schools',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-akoma-green',
      bg: 'bg-akoma-green/10',
      href: '/platform/users',
    },
    {
      title: 'Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/platform/users?role=student',
    },
    {
      title: 'Teachers',
      value: stats?.totalTeachers || 0,
      icon: UserPlus,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/platform/users?role=teacher',
    },
    {
      title: 'Parents',
      value: stats?.totalParents || 0,
      icon: Users,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      href: '/platform/users?role=parent',
    },
    {
      title: 'Classes',
      value: stats?.totalClasses || 0,
      icon: BookOpen,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/platform/schools',
    },
    {
      title: 'Active Schools',
      value: stats?.activeSchools || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/platform/schools?status=active',
    },
    {
      title: 'Pending Schools',
      value: stats?.pendingSchools || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      href: '/platform/applications/pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Platform Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back, {user?.firstName}! Here&apos;s the overview of the entire Akoma Edu platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/platform/applications/pending">
            <button className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Applications {pendingSchools.length > 0 && `(${pendingSchools.length})`}
            </button>
          </Link>
          <Link href="/platform/curriculum/create">
            <button className="px-4 py-2 text-sm bg-akoma-green hover:bg-akoma-dark text-white rounded-lg transition-colors">
              + Create Curriculum
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-bold text-text mt-0.5">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              href="/platform/applications/pending"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Applications</p>
                <p className="text-xs text-text-secondary">{pendingSchools.length} pending</p>
              </div>
            </Link>
            <Link
              href="/platform/schools"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                <School className="h-4 w-4 text-akoma-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Schools</p>
                <p className="text-xs text-text-secondary">{stats?.totalSchools || 0} total</p>
              </div>
            </Link>
            <Link
              href="/platform/users"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-akoma-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Users</p>
                <p className="text-xs text-text-secondary">{stats?.totalUsers || 0} total</p>
              </div>
            </Link>
            <Link
              href="/platform/curriculum"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-akoma-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Curriculum</p>
                <p className="text-xs text-text-secondary">National & School</p>
              </div>
            </Link>
            <Link
              href="/platform/analytics"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-akoma-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Analytics</p>
                <p className="text-xs text-text-secondary">Platform insights</p>
              </div>
            </Link>
            <Link
              href="/platform/settings"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-akoma-green/5 transition-colors border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Settings</p>
                <p className="text-xs text-text-secondary">Configure system</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-text mb-4">Platform Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">System Status</span>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Attendance Rate</span>
              <span className="text-sm font-medium text-akoma-green">
                {stats?.attendanceRate || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Student-Teacher Ratio</span>
              <span className="text-sm font-medium text-akoma-green">
                {stats?.studentTeacherRatio || 0}:1
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Active Schools</span>
              <span className="text-sm font-medium text-akoma-green">
                {stats?.activeSchools || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Last Updated</span>
              <span className="text-sm text-text-secondary">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">Recent Activity</h3>
          <Link href="/platform/activity" className="text-sm text-akoma-green hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 bg-background rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activity.type === 'school' ? 'bg-akoma-green/10' : 
                activity.type === 'user' ? 'bg-blue-100' :
                activity.type === 'curriculum' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                {activity.type === 'school' && <School className="h-4 w-4 text-akoma-green" />}
                {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                {activity.type === 'curriculum' && <BookOpen className="h-4 w-4 text-purple-600" />}
                {activity.type === 'system' && <Settings className="h-4 w-4 text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">{activity.message}</p>
                <p className="text-xs text-text-secondary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}