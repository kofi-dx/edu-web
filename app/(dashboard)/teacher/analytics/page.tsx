/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  ClipboardList,
  Users,
  FileText,
  CheckCircle,
  Award,
  ChevronRight,
  Eye,
  Target,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTeacherAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await getTeacherAnalytics();
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch teacher analytics:', error);
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

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
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

  const summary = data.summary || {};
  const assessments = data.assessments || [];

  // Group assessments by status
  const drafts = assessments.filter((a: any) => a.status === 'draft');
  const published = assessments.filter((a: any) => a.status === 'published');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Analytics</h1>
          <p className="text-text-secondary">
            Overview of your assessments and student performance
          </p>
        </div>
        <Link href="/teacher/assessments/create">
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <Plus className="h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Assessments</p>
              <p className="text-2xl font-bold text-text">{summary.totalAssessments || 0}</p>
              <p className="text-xs text-text-secondary">
                {summary.published || 0} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Students</p>
              <p className="text-2xl font-bold text-text">{summary.totalStudents || 0}</p>
              <p className="text-xs text-text-secondary">attempted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Pass Rate</p>
              <p className="text-2xl font-bold text-text">{summary.passRate || 0}%</p>
              <p className="text-xs text-text-secondary">
                {summary.totalAttempts || 0} attempts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Avg Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(summary.averageScore || 0)}`}>
                {summary.averageScore || 0}%
              </p>
              <p className="text-xs text-text-secondary">overall</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-800">{summary.drafts || 0}</span>
          </div>
          <p className="text-sm font-medium text-gray-800">Drafts</p>
          <p className="text-xs text-gray-600 mt-1">Not yet published</p>
          {drafts.length > 0 && (
            <Link
              href="/teacher/assessments?status=draft"
              className="text-xs text-gray-700 hover:underline mt-2 inline-flex items-center gap-1"
            >
              View drafts <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-800">{summary.published || 0}</span>
          </div>
          <p className="text-sm font-medium text-green-800">Published</p>
          <p className="text-xs text-green-600 mt-1">Visible to students</p>
          {published.length > 0 && (
            <Link
              href="/teacher/assessments?status=published"
              className="text-xs text-green-700 hover:underline mt-2 inline-flex items-center gap-1"
            >
              View published <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-800">
              {summary.totalAttempts || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-800">Total Attempts</p>
          <p className="text-xs text-blue-600 mt-1">Across all assessments</p>
        </div>
      </div>

      {/* Assessments Performance Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-akoma-green" />
                Assessment Performance
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Performance summary per assessment
              </p>
            </div>
            <Link href="/teacher/assessments">
              <Button variant="outline" size="sm" className="gap-1">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary mb-3">No assessments yet</p>
            <Link href="/teacher/assessments/create">
              <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Assessment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Assessment</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attempts</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Graded</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Average</th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/teacher/assessments/${a.id}`}
                        className="text-sm font-medium text-text hover:text-akoma-green transition-colors line-clamp-1"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{a.totalAttempts}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{a.gradedAttempts}</span>
                    </td>
                    <td className="px-6 py-3">
                      {a.gradedAttempts > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBg(a.averageScore)} rounded-full`}
                              style={{ width: `${a.averageScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(a.averageScore)}`}>
                            {a.averageScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/teacher/assessments/${a.id}/analytics`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Analytics">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/teacher/assessments/${a.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/teacher/assessments"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-semibold text-text mb-1">My Assessments</h3>
          <p className="text-xs text-text-secondary">
            Manage all your assessments
          </p>
        </Link>

        <Link
          href="/teacher/classes"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-semibold text-text mb-1">My Classes</h3>
          <p className="text-xs text-text-secondary">
            View class analytics & students
          </p>
        </Link>

        <Link
          href="/teacher/assessments/create"
          className="bg-akoma-green rounded-xl p-5 shadow-sm hover:shadow-md transition-all group text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-semibold mb-1">Create Assessment</h3>
          <p className="text-xs text-white/80">
            Build a new assessment
          </p>
        </Link>
      </div>
    </div>
  );
}