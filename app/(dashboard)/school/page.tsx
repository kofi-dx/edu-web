/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  QrCode,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Settings,
  BarChart3,
  ClipboardList,
  TrendingUp, 
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getMySchool,
  getSchoolStats,
  getTodayAttendance,
  getPendingStudents,
  getSchoolAnalytics,
  getTeacherPerformance,
} from '@/lib/services/schoolAdminService';

// ============================================
// TYPES
// ============================================

interface School {
  id: string;
  name: string;
  code: string;
  type: string;
  district: string;
  region: string;
  contactEmail: string;
  contactPhone: string;
}

interface Stats {
  students: number;
  teachers: number;
  parents: number;
  classes: number;
}

interface PendingStudent {
  id: string;
  admissionNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

interface AnalyticsSummary {
  students: { total: number; active: number; pending: number };
  teachers: { total: number; active: number };
  classes: { total: number };
  attendance: {
    totalRecords: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  };
  assessments: {
    total: number;
    published: number;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    passRate: number;
  };
}

// ============================================
// COMPONENT
// ============================================

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [, setAttendance] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [topTeachers, setTopTeachers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get school details
      const schoolData = await getMySchool();
      setSchool(schoolData);

      // Fetch core data in parallel
      const [
        statsData,
        attendanceData,
        pendingData,
        analyticsData,
        teacherPerfData,
      ] = await Promise.all([
        getSchoolStats(schoolData.id).catch(() => null),
        getTodayAttendance(schoolData.id).catch(() => []),
        getPendingStudents(schoolData.id).catch(() => ({ students: [] })),
        getSchoolAnalytics('30d').catch(() => null),
        getTeacherPerformance('30d').catch(() => null),
      ]);

      // Set stats
      if (statsData) setStats(statsData.stats);

      // Set attendance
      setAttendance(attendanceData || []);
      if (attendanceData && Array.isArray(attendanceData)) {
        const present = attendanceData.filter((a: any) => a.status === 'present').length;
        const late = attendanceData.filter((a: any) => a.status === 'late').length;
        const absent = attendanceData.filter((a: any) => a.status === 'absent').length;
        setAttendanceStats({
          present,
          late,
          absent,
          total: attendanceData.length || 0,
        });
      }

      // Set pending
      setPendingStudents(pendingData?.students || []);

      // Set analytics
      if (analyticsData) setAnalytics(analyticsData);

      // Set top teachers (only those with activity)
      if (teacherPerfData?.teachers) {
        const active = teacherPerfData.teachers
          .filter((t: any) => t.attemptCount > 0)
          .sort((a: any, b: any) => b.attemptCount - a.attemptCount)
          .slice(0, 3);
        setTopTeachers(active);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Students',
      value: stats?.students || 0,
      subtitle: analytics?.students?.pending
        ? `${analytics.students.pending} pending`
        : undefined,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/school/students',
    },
    {
      title: 'Teachers',
      value: stats?.teachers || 0,
      subtitle: analytics?.teachers?.active
        ? `${analytics.teachers.active} active`
        : undefined,
      icon: GraduationCap,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/school/teachers',
    },
    {
      title: 'Parents',
      value: stats?.parents || 0,
      subtitle: undefined,
      icon: UserPlus,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      href: '/school/parents',
    },
    {
      title: 'Classes',
      value: stats?.classes || 0,
      subtitle: stats?.students && stats?.classes
        ? `avg ${Math.round(stats.students / stats.classes)} students`
        : undefined,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/school/classes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">School Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening at your school.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/school/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/school/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link href="/school/students/add">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================
          SCHOOL INFO
          ============================================ */}
      {school && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-akoma-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">{school.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {school.district}, {school.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {school.contactEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {school.contactPhone}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-akoma-green/10 text-akoma-green text-xs font-medium">
                    {school.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary text-xs font-medium">
                    Code: {school.code}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-akoma-green">
                  {stats?.students || 0}
                </p>
                <p className="text-xs text-text-secondary">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-akoma-green">
                  {stats?.teachers || 0}
                </p>
                <p className="text-xs text-text-secondary">Teachers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-akoma-green">
                  {stats?.classes || 0}
                </p>
                <p className="text-xs text-text-secondary">Classes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          STATS GRID
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.title}</p>
                <p className="text-3xl font-bold text-text mt-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-text-secondary mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ============================================
          ANALYTICS SUMMARY ROW
          ============================================ */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Attendance */}
          <Link
            href="/school/analytics/attendance"
            className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 text-white hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-3xl font-bold">
              {analytics.attendance.attendanceRate}%
            </p>
            <p className="text-sm text-white/80 mt-1">Attendance Rate</p>
            <p className="text-xs text-white/60 mt-2">
              {analytics.attendance.present} present •{' '}
              {analytics.attendance.late} late •{' '}
              {analytics.attendance.absent} absent
            </p>
          </Link>

          {/* Assessments */}
          <Link
            href="/school/analytics/assessments"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(analytics.assessments.passRate)}`}>
              {analytics.assessments.passRate}%
            </p>
            <p className="text-sm text-text-secondary mt-1">Assessment Pass Rate</p>
            <p className="text-xs text-text-secondary mt-2">
              {analytics.assessments.totalAttempts} attempts • avg{' '}
              {analytics.assessments.averageScore}%
            </p>
          </Link>

          {/* Overall Analytics */}
          <Link
            href="/school/analytics"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-3xl font-bold text-text">
              {analytics.assessments.total}
            </p>
            <p className="text-sm text-text-secondary mt-1">Total Assessments</p>
            <p className="text-xs text-text-secondary mt-2">
              {analytics.assessments.published} published
            </p>
          </Link>
        </div>
      )}

      {/* ============================================
          TWO COLUMN — Attendance + Pending
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Calendar className="h-5 w-5 text-akoma-green" />
              Today&apos;s Attendance
            </h3>
            <Link
              href="/school/attendance"
              className="text-sm text-akoma-green hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {attendanceStats.total > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceStats.present}
                  </p>
                  <p className="text-xs text-text-secondary">Present</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendanceStats.late}
                  </p>
                  <p className="text-xs text-text-secondary">Late</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceStats.absent}
                  </p>
                  <p className="text-xs text-text-secondary">Absent</p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-akoma-green rounded-full transition-all"
                  style={{
                    width: attendanceStats.total > 0
                      ? `${((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-sm text-text-secondary mt-2">
                {attendanceStats.total > 0
                  ? `${Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100)}% attendance rate`
                  : 'No attendance recorded today'}
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No attendance records for today.</p>
              <Link href="/school/attendance/devices">
                <Button variant="outline" size="sm" className="mt-3 gap-1">
                  <QrCode className="h-3.5 w-3.5" />
                  Manage Devices
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pending Students */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Approvals
            </h3>
            <Link
              href="/school/students/pending"
              className="text-sm text-akoma-green hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {pendingStudents.length > 0 ? (
            <div className="space-y-3">
              {pendingStudents.slice(0, 3).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">
                      {student.user.firstName} {student.user.lastName}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">
                      {student.admissionNumber}
                    </p>
                  </div>
                  <Link
                    href={`/school/students/pending/${student.id}`}
                    className="px-3 py-1 text-xs bg-akoma-green text-white rounded-lg hover:bg-akoma-dark transition-colors shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
              {pendingStudents.length > 3 && (
                <p className="text-xs text-text-secondary text-center">
                  +{pendingStudents.length - 3} more pending
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-akoma-green mx-auto mb-3" />
              <p className="text-text-secondary">No pending student approvals.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          TOP TEACHERS (only when there's activity)
          ============================================ */}
      {topTeachers.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              Most Active Teachers
            </h3>
            <Link
              href="/school/analytics/teachers"
              className="text-sm text-akoma-green hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topTeachers.map((teacher: any, idx: number) => (
              <div
                key={teacher.id}
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    idx === 0
                      ? 'bg-yellow-400 text-yellow-900'
                      : idx === 1
                      ? 'bg-gray-300 text-gray-800'
                      : 'bg-orange-300 text-orange-900'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{teacher.name}</p>
                  <p className="text-xs text-text-secondary">
                    {teacher.attemptCount} attempt
                    {teacher.attemptCount !== 1 ? 's' : ''} • {teacher.assessmentCount} assessment
                    {teacher.assessmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(teacher.averageScore)}`}>
                  {teacher.averageScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          QUICK ACTIONS
          ============================================ */}
      <div>
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-akoma-green" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/school/students/add"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-akoma-green" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Add Student</p>
              <p className="text-xs text-text-secondary truncate">Enroll new student</p>
            </div>
          </Link>

          <Link
            href="/school/teachers/add"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-akoma-green" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Add Teacher</p>
              <p className="text-xs text-text-secondary truncate">Hire new teacher</p>
            </div>
          </Link>

          <Link
            href="/school/classes/add"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-akoma-green" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Create Class</p>
              <p className="text-xs text-text-secondary truncate">New classroom</p>
            </div>
          </Link>

          <Link
            href="/school/attendance/devices"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
              <QrCode className="h-5 w-5 text-akoma-green" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Devices</p>
              <p className="text-xs text-text-secondary truncate">Manage scanners</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}