/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle, 
  AlertCircle,
  Award,
  ChevronRight,
  Eye,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getClassAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function ClassAnalyticsPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'top' | 'at-risk'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [classId]);

  const fetchAnalytics = async () => {
    try {
      const result = await getClassAnalytics(classId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch class analytics:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
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
        <Link href="/teacher/classes">
          <Button variant="outline" className="mt-4">Back to Classes</Button>
        </Link>
      </div>
    );
  }

  const cls = data.class || {};
  const summary = data.summary || {};
  const topPerformers = data.topPerformers || [];
  const atRisk = data.atRisk || [];
  const allStudents = data.allStudents || [];

  // Determine students to show based on viewMode
  let displayedStudents = allStudents;
  if (viewMode === 'top') displayedStudents = topPerformers;
  if (viewMode === 'at-risk') displayedStudents = atRisk;

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

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/classes/${classId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Class
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">Class Analytics</h1>
        <p className="text-text-secondary">
          {cls.name} {cls.level ? `• ${cls.level.replace('_', ' ')}` : ''}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Students</p>
              <p className="text-2xl font-bold text-text">{summary.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Assessments</p>
              <p className="text-2xl font-bold text-text">{summary.totalAssessments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Pass Rate</p>
              <p className="text-2xl font-bold text-text">{summary.passRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Average</p>
              <p className="text-2xl font-bold text-text">{summary.averageScore || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers & At-Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Top Performers</h3>
          </div>
          {topPerformers.length === 0 ? (
            <p className="text-sm text-green-700 text-center py-4">
              No attempts graded yet
            </p>
          ) : (
            <div className="space-y-2">
              {topPerformers.slice(0, 3).map((s: any, idx: number) => (
                <div key={s.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-800' :
                    'bg-orange-300 text-orange-900'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {s.attemptsCount} attempt{s.attemptsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(s.averageScore)}`}>
                    {s.averageScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* At-Risk Students */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">At Risk (below 50%)</h3>
          </div>
          {atRisk.length === 0 ? (
            <p className="text-sm text-red-700 text-center py-4">
              🎉 No at-risk students
            </p>
          ) : (
            <div className="space-y-2">
              {atRisk.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">
                      {s.firstName?.[0]}{s.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {s.failedCount} failed of {s.attemptsCount}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {s.averageScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-text">All Students</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {displayedStudents.length} student{displayedStudents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('top')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'top'
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setViewMode('at-risk')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'at-risk'
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                At Risk
              </button>
            </div>
          </div>
        </div>

        {displayedStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No students to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Rank</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attempts</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Passed</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Failed</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Average</th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((s: any, idx: number) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-text-secondary">
                        #{viewMode === 'all' ? idx + 1 : (viewMode === 'top' ? idx + 1 : '—')}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-akoma-green">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-xs text-text-secondary font-mono">
                            {s.admissionNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{s.attemptsCount}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-green-600 font-medium">
                        {s.passedCount}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-red-600 font-medium">
                        {s.failedCount}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBg(s.averageScore)} rounded-full`}
                            style={{ width: `${s.averageScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(s.averageScore)}`}>
                          {s.averageScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/teacher/classes/${classId}/students/${s.id}/analytics`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Link href={`/teacher/classes/${classId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Class
          </Button>
        </Link>
        <Link href={`/teacher/classes/${classId}/students`}>
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <GraduationCap className="h-4 w-4" />
            View Students Breakdown
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}