/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  BookMarked,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getStudentDashboard } from '@/lib/services/schoolAdminService';

interface DashboardData {
  student: any;
  user: any;
  class: any;
  school: any;
  teacher: any;
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
  };
  upcomingAssessments: any[];
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await getStudentDashboard();
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

  const attendanceRate = data?.attendance?.attendanceRate || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-akoma-green to-akoma-dark rounded-2xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-white/80 mt-1">
              {data?.class ? `${data.class.name} • ${data.school?.name || ''}` : 'Keep learning and growing'}
            </p>
          </div>
          <Link href="/student/learning">
            <Button className="bg-white text-akoma-green hover:bg-white/90 gap-2">
              <BookOpen className="h-4 w-4" />
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Subjects</p>
              <p className="text-xl font-bold text-text">
                {data?.class ? '—' : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Assessments</p>
              <p className="text-xl font-bold text-text">
                {data?.upcomingAssessments?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Attendance</p>
              <p className="text-xl font-bold text-text">{attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Progress</p>
              <p className="text-xl font-bold text-text">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Class */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <School className="h-5 w-5 text-akoma-green" />
                My Class
              </h2>
            </div>

            {data?.class ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-text-secondary">Class</span>
                  <span className="text-sm font-medium text-text">{data.class.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-text-secondary">Level</span>
                  <span className="text-sm font-medium text-text capitalize">
                    {data.class.level?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-text-secondary">Academic Year</span>
                  <span className="text-sm font-medium text-text">{data.class.academicYear || 'N/A'}</span>
                </div>
                {data.teacher && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-text-secondary">Class Teacher</span>
                    <span className="text-sm font-medium text-text">
                      {data.teacher.firstName} {data.teacher.lastName}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <School className="h-10 w-10 text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Not enrolled in any class yet</p>
              </div>
            )}
          </div>

          {/* Upcoming Assessments */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-akoma-green" />
                Upcoming Assessments
              </h2>
              <Link href="/student/assessments" className="text-sm text-akoma-green hover:underline">
                View all
              </Link>
            </div>

            {data?.upcomingAssessments && data.upcomingAssessments.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAssessments.slice(0, 3).map((assessment: any) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-text">{assessment.title}</p>
                      <p className="text-xs text-text-secondary">{assessment.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">Due</p>
                      <p className="text-xs font-medium text-text">{assessment.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No upcoming assessments</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-akoma-green" />
              Attendance
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Present</span>
                <span className="text-sm font-medium text-green-600">
                  {data?.attendance?.presentDays || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Absent</span>
                <span className="text-sm font-medium text-red-600">
                  {data?.attendance?.absentDays || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total</span>
                <span className="text-sm font-medium text-text">
                  {data?.attendance?.totalDays || 0} days
                </span>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Rate</span>
                  <span className="text-xs font-medium text-akoma-green">{attendanceRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-akoma-green rounded-full transition-all"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/student/learning"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-akoma-green" />
                  <span className="text-sm font-medium text-text">My Learning</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/student/progress"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-akoma-green" />
                  <span className="text-sm font-medium text-text">My Progress</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/student/attendance"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-4 w-4 text-akoma-green" />
                  <span className="text-sm font-medium text-text">My Attendance</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}