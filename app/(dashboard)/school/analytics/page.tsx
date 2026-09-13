/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSchoolAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function SchoolAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const result = await getSchoolAnalytics(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Analytics not available</p>
      </div>
    );
  }

  const school = data.school || {};
  const students = data.students || {};
  const teachers = data.teachers || {};
  const classes = data.classes || {};
  const attendance = data.attendance || {};
  const assessments = data.assessments || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">School Analytics</h1>
          <p className="text-text-secondary">
            Performance overview for {school.name}
          </p>
        </div>

        {/* Range Picker */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7 days' },
            { value: '30d', label: '30 days' },
            { value: '90d', label: '90 days' },
            { value: '1y', label: '1 year' },
            { value: 'all', label: 'All time' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                range === opt.value
                  ? 'bg-akoma-green text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row — 4 primary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/school/students"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-text">{students.total || 0}</p>
          <p className="text-sm text-text-secondary mt-1">Students</p>
          <p className="text-xs text-text-secondary mt-2">
            {students.active || 0} active
            {students.pending > 0 && ` • ${students.pending} pending`}
          </p>
        </Link>

        <Link
          href="/school/teachers"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-text">{teachers.total || 0}</p>
          <p className="text-sm text-text-secondary mt-1">Teachers</p>
          <p className="text-xs text-text-secondary mt-2">
            {teachers.active || 0} active
          </p>
        </Link>

        <Link
          href="/school/classes"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-text">{classes.total || 0}</p>
          <p className="text-sm text-text-secondary mt-1">Classes</p>
          <p className="text-xs text-text-secondary mt-2">
            {students.total > 0 && classes.total > 0
              ? `avg ${Math.round(students.total / classes.total)} per class`
              : 'no classes yet'}
          </p>
        </Link>

        <div className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">{attendance.attendanceRate || 0}%</p>
          <p className="text-sm text-white/80 mt-1">Attendance Rate</p>
          <p className="text-xs text-white/60 mt-2">
            {attendance.totalRecords || 0} records
          </p>
        </div>
      </div>

      {/* Second Row — Attendance + Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <Calendar className="h-5 w-5 text-akoma-green" />
              Attendance
            </h2>
            <Link href="/school/analytics/attendance">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View details
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Overall Rate</span>
              <span className={`text-lg font-bold ${getScoreColor(attendance.attendanceRate || 0)}`}>
                {attendance.attendanceRate || 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (attendance.attendanceRate || 0) >= 80 ? 'bg-green-500' :
                  (attendance.attendanceRate || 0) >= 60 ? 'bg-blue-500' :
                  (attendance.attendanceRate || 0) >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${attendance.attendanceRate || 0}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {attendance.present || 0}
              </p>
              <p className="text-xs text-green-600">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">
                {attendance.late || 0}
              </p>
              <p className="text-xs text-yellow-600">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">
                {attendance.absent || 0}
              </p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
        </div>

        {/* Assessments Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              Assessments
            </h2>
            <Link href="/school/analytics/assessments">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View details
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Pass Rate</span>
              <span className={`text-lg font-bold ${getScoreColor(assessments.passRate || 0)}`}>
                {assessments.passRate || 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (assessments.passRate || 0) >= 80 ? 'bg-green-500' :
                  (assessments.passRate || 0) >= 60 ? 'bg-blue-500' :
                  (assessments.passRate || 0) >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${assessments.passRate || 0}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {assessments.total || 0}
              </p>
              <p className="text-xs text-blue-600">Assessments</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-700">
                {assessments.totalAttempts || 0}
              </p>
              <p className="text-xs text-purple-600">Attempts</p>
            </div>
            <div className="text-center p-3 bg-akoma-green/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-akoma-green mx-auto mb-1" />
              <p className={`text-lg font-bold ${getScoreColor(assessments.averageScore || 0)}`}>
                {assessments.averageScore || 0}%
              </p>
              <p className="text-xs text-akoma-green">Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Detailed Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/school/analytics/attendance"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">Attendance</p>
              <p className="text-xs text-text-secondary truncate">
                Daily trends & breakdown
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/school/analytics/assessments"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">Assessments</p>
              <p className="text-xs text-text-secondary truncate">
                Subject & test performance
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/school/analytics/teachers"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">Teachers</p>
              <p className="text-xs text-text-secondary truncate">
                Individual performance
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          <Link
            href="/school/analytics/students"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">Students</p>
              <p className="text-xs text-text-secondary truncate">
                Top & at-risk tracking
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}