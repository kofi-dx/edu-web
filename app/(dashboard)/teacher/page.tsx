/* eslint-disable react-hooks/immutability */ 
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users, 
  Clock,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  QrCode,
  ClipboardList,
  Plus,
  FileText,
  Award,
  AlertCircle, 
  BarChart3,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTeacherDashboard } from '@/lib/services/schoolAdminService';

// ============================================
// TYPES
// ============================================

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  totalAssessments: number;
  drafts: number;
  published: number;
  totalAttempts: number;
  gradedAttempts: number;
  pendingAttempts: number;
  averageScore: number;
  passRate: number;
}

interface ClassItem {
  id: string;
  name: string;
  code: string;
  level: string;
  studentCount: number;
  capacity: number;
}

interface RecentSubmission {
  id: string;
  status: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  attemptNumber: number;
  studentName: string;
  className: string;
  assessmentTitle: string;
  assessmentId: string;
}

interface AssessmentSummary {
  id: string;
  title: string;
  status: string;
  type: string;
  totalPoints: number;
  attemptCount: number;
  gradedCount: number;
  averageScore: number;
  createdAt?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalAssessments: 0,
    drafts: 0,
    published: 0,
    totalAttempts: 0,
    gradedAttempts: 0,
    pendingAttempts: 0,
    averageScore: 0,
    passRate: 0
  });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [topAssessments, setTopAssessments] = useState<AssessmentSummary[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getTeacherDashboard();

      setStats(data.stats || {});
      setClasses(data.classes || []);
      setRecentSubmissions(data.recentSubmissions || []);
      setTopAssessments(data.topAssessments || []);
      setRecentAssessments(data.recentAssessments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <FileText className="h-3 w-3" />
            Draft
          </span>
        );
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Graded
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <AlertCircle className="h-3 w-3" />
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

  return (
    <div className="space-y-6">
      {/* ============================================
          WELCOME HEADER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName} {user?.lastName}! 👋
            </h1>
            <p className="text-green-100 mt-1">
              Here&apos;s an overview of your classes and assessments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher/attendance">
              <Button className="bg-white text-akoma-green hover:bg-green-50 gap-2">
                <QrCode className="h-4 w-4" />
                Take Attendance
              </Button>
            </Link>
            <Link href="/teacher/assessments/create">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 gap-2"
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================
          PRIMARY STATS — 4 cards
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">My Classes</p>
              <p className="text-2xl font-bold text-text">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Students</p>
              <p className="text-2xl font-bold text-text">{stats.totalStudents}</p>
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
              <p className="text-2xl font-bold text-text">{stats.totalAssessments}</p>
              <p className="text-xs text-text-secondary">
                {stats.published} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore}%
              </p>
              <p className="text-xs text-text-secondary">
                {stats.passRate}% pass rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          ASSESSMENT STATS — Row of 3
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/teacher/assessments?status=draft"
          className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-800">{stats.drafts}</span>
          </div>
          <p className="text-sm font-medium text-gray-800">Draft Assessments</p>
          <p className="text-xs text-gray-600 mt-1">Waiting to be published</p>
        </Link>

        <Link
          href="/teacher/assessments?status=published"
          className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-800">{stats.published}</span>
          </div>
          <p className="text-sm font-medium text-green-800">Published</p>
          <p className="text-xs text-green-600 mt-1">
            {stats.totalAttempts} total attempt{stats.totalAttempts !== 1 ? 's' : ''}
          </p>
        </Link>

        <Link
          href="/teacher/assessments"
          className={`bg-linear-to-br rounded-xl p-5 hover:shadow-md transition-all ${
            stats.pendingAttempts > 0
              ? 'from-yellow-50 to-yellow-100 border border-yellow-200'
              : 'from-blue-50 to-blue-100 border border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {stats.pendingAttempts > 0 ? (
              <Clock className="h-5 w-5 text-yellow-600" />
            ) : (
              <Award className="h-5 w-5 text-blue-600" />
            )}
            <span className={`text-2xl font-bold ${
              stats.pendingAttempts > 0 ? 'text-yellow-800' : 'text-blue-800'
            }`}>
              {stats.pendingAttempts}
            </span>
          </div>
          <p className={`text-sm font-medium ${
            stats.pendingAttempts > 0 ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {stats.pendingAttempts > 0 ? 'Pending Grading' : 'All Graded'}
          </p>
          <p className={`text-xs mt-1 ${
            stats.pendingAttempts > 0 ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {stats.pendingAttempts > 0
              ? 'Open-ended answers need review'
              : '🎉 No pending submissions'}
          </p>
        </Link>
      </div>

      {/* ============================================
          RECENT SUBMISSIONS + TOP ASSESSMENTS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-akoma-green" />
              <h2 className="font-semibold text-text">Recent Submissions</h2>
            </div>
            <Link href="/teacher/assessments">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="text-center py-10">
              <Send className="h-10 w-10 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No submissions yet</p>
              <Link href="/teacher/assessments/create">
                <Button variant="outline" size="sm" className="mt-3 gap-1">
                  <Plus className="h-3 w-3" />
                  Create Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/teacher/assessments/${sub.assessmentId}/submissions`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-akoma-green">
                      {sub.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {sub.assessmentTitle}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatRelativeTime(sub.submittedAt)} • {sub.className}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {sub.status === 'graded' ? (
                      <>
                        <p className={`text-sm font-bold ${getScoreColor(sub.percentage)}`}>
                          {Math.round(sub.percentage)}%
                        </p>
                        <p className={`text-xs ${sub.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {sub.passed ? 'Passed' : 'Failed'}
                        </p>
                      </>
                    ) : (
                      getStatusBadge(sub.status)
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Assessments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-akoma-green" />
              <h2 className="font-semibold text-text">Most Attempted</h2>
            </div>
            <Link href="/teacher/assessments">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {topAssessments.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="h-10 w-10 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                Publish an assessment to see stats here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topAssessments.map((a) => (
                <Link
                  key={a.id}
                  href={`/teacher/assessments/${a.id}/analytics`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-4 w-4 text-akoma-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {a.attemptCount} attempt{a.attemptCount !== 1 ? 's' : ''} •{' '}
                      {a.gradedCount} graded
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {a.gradedCount > 0 ? (
                      <p className={`text-sm font-bold ${getScoreColor(a.averageScore)}`}>
                        {a.averageScore}%
                      </p>
                    ) : (
                      <span className="text-xs text-text-secondary">—</span>
                    )}
                    <p className="text-xs text-text-secondary">avg</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          MY CLASSES
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-akoma-green" />
            My Classes
          </h2>
          <Link href="/teacher/classes">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">
              You haven&apos;t been assigned to any classes yet.
            </p>
            <p className="text-sm text-text-secondary">
              Contact your school admin for class assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link href={`/teacher/classes/${cls.id}`}>
                    <h3 className="font-semibold text-text hover:text-akoma-green transition-colors">
                      {cls.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-text-secondary font-mono">
                    {cls.code}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                  {cls.level?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-text-secondary" />
                  <span className="text-text-secondary">
                    {cls.studentCount || 0} / {cls.capacity || 40}
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/teacher/classes/${cls.id}`}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs text-text-secondary hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  View
                </Link>
                <Link
                  href={`/teacher/classes/${cls.id}/analytics`}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs text-akoma-green hover:bg-akoma-green/5 transition-colors"
                >
                  <BarChart3 className="h-3 w-3" />
                  Analytics
                </Link>
                <Link
                  href={`/teacher/classes/${cls.id}/students`}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs text-akoma-green hover:bg-akoma-green/5 transition-colors"
                >
                  <Users className="h-3 w-3" />
                  Students
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* ============================================
          RECENT ASSESSMENTS + QUICK ACTIONS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-text flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-akoma-green" />
              Recent Assessments
            </h3>
            <Link href="/teacher/assessments">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recentAssessments.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardList className="h-8 w-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">
                No assessments created yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAssessments.map((a) => (
                <Link
                  key={a.id}
                  href={`/teacher/assessments/${a.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">
                      {a.type} • {a.totalPoints} pts
                    </p>
                  </div>
                  {getStatusBadge(a.status)}
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions (1/3) */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-medium text-text mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/teacher/assessments/create">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-akoma-green border-akoma-green/20 hover:bg-akoma-green/5"
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </Button>
            </Link>
            <Link href="/teacher/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/teacher/attendance">
              <Button variant="outline" className="w-full justify-start gap-2">
                <QrCode className="h-4 w-4" />
                Take Attendance
              </Button>
            </Link>
            <Link href="/teacher/classes">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                View My Classes
              </Button>
            </Link>
            <Link href="/teacher/students">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                View Students
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}