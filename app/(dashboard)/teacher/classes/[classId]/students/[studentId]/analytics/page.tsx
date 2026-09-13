/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, 
  Mail,
  TrendingUp,
  CheckCircle,
  XCircle,
  ClipboardList,
  Target,
  Award,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudentAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function StudentAnalyticsDetailPage() {
  const params = useParams();
  const classId = params.classId as string;
  const studentId = params.studentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [classId, studentId]);

  const fetchAnalytics = async () => {
    try {
      const result = await getStudentAnalytics(classId, studentId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch student analytics:', error);
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

  const getGradeLabel = (score: number) => {
    if (score >= 80) return { label: 'A', color: 'text-green-600 bg-green-50' };
    if (score >= 70) return { label: 'B', color: 'text-blue-600 bg-blue-50' };
    if (score >= 60) return { label: 'C', color: 'text-yellow-600 bg-yellow-50' };
    if (score >= 50) return { label: 'D', color: 'text-orange-600 bg-orange-50' };
    return { label: 'F', color: 'text-red-600 bg-red-50' };
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
        <p className="text-text-secondary">Student analytics not available</p>
        <Link href={`/teacher/classes/${classId}/students`}>
          <Button variant="outline" className="mt-4">Back to Students</Button>
        </Link>
      </div>
    );
  }

  const student = data.student || {};
  const summary = data.summary || {};
  const attempts = data.attempts || [];

  const overallGrade = getGradeLabel(summary.averageScore || 0);

  // Group attempts by subject
  const attemptsBySubject: Record<string, any[]> = {};
  attempts.forEach((a: any) => {
    const subject = a.subject || 'General';
    if (!attemptsBySubject[subject]) attemptsBySubject[subject] = [];
    attemptsBySubject[subject].push(a);
  });

  // Compute per-subject averages
  const subjectSummaries = Object.entries(attemptsBySubject).map(([subject, list]) => {
    const graded = list.filter(x => x.status === 'graded');
    const avg = graded.length > 0
      ? Math.round(graded.reduce((sum, x) => sum + (x.percentage || 0), 0) / graded.length)
      : 0;
    const passed = graded.filter(x => x.passed).length;
    return {
      subject,
      avg,
      passed,
      total: graded.length,
      attempts: list
    };
  });

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/teacher/classes/${classId}/students`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Class Students
      </Link>

      {/* Student Header */}
      <div className="bg-linear-to-r from-akoma-green to-akoma-dark rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">
                {student.firstName?.[0]}{student.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-white/80 text-sm font-mono">{student.admissionNumber}</p>
              <p className="text-white/80 text-sm mt-0.5">{student.class}</p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5" />
              <span className="text-lg font-bold">Overall Grade</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{summary.averageScore || 0}%</span>
              <span className="text-2xl font-bold px-3 py-1 rounded-lg bg-white/20">
                {overallGrade.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {student.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-text-secondary" />
              <span className="text-text">{student.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <span className="text-text-secondary">
              {summary.totalAssessments || 0} assessments assigned
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Assigned</p>
              <p className="text-2xl font-bold text-text">{summary.totalAssessments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Attempted</p>
              <p className="text-2xl font-bold text-text">{summary.attempted || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Passed</p>
              <p className="text-2xl font-bold text-green-600">{summary.passed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Failed</p>
              <p className="text-2xl font-bold text-red-600">{summary.failed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Banner */}
      <div className={`rounded-xl p-5 border-2 ${
        (summary.averageScore || 0) >= 80 ? 'bg-green-50 border-green-200' :
        (summary.averageScore || 0) >= 60 ? 'bg-blue-50 border-blue-200' :
        (summary.averageScore || 0) >= 40 ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          {(summary.averageScore || 0) >= 60 ? (
            <Award className={`h-8 w-8 ${
              (summary.averageScore || 0) >= 80 ? 'text-green-600' : 'text-blue-600'
            }`} />
          ) : (
            <AlertCircle className={`h-8 w-8 ${
              (summary.averageScore || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`} />
          )}
          <div>
            <p className={`font-bold ${
              (summary.averageScore || 0) >= 80 ? 'text-green-800' :
              (summary.averageScore || 0) >= 60 ? 'text-blue-800' :
              (summary.averageScore || 0) >= 40 ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {(summary.averageScore || 0) >= 80 ? 'Excellent Performance' :
               (summary.averageScore || 0) >= 60 ? 'Good Performance' :
               (summary.averageScore || 0) >= 40 ? 'Needs Improvement' :
               'At Risk — Requires Attention'}
            </p>
            <p className="text-sm mt-0.5 text-text-secondary">
              Pass rate: {summary.passRate || 0}% across {summary.attempted || 0} graded attempt
              {summary.attempted !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {subjectSummaries.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-akoma-green" />
            Subject Performance
          </h2>
          <div className="space-y-4">
            {subjectSummaries.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text">{s.subject}</p>
                    <p className="text-xs text-text-secondary">
                      {s.passed}/{s.total} passed
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(s.avg)}`}>
                    {s.avg}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(s.avg)} rounded-full transition-all`}
                    style={{ width: `${s.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempts History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Target className="h-5 w-5 text-akoma-green" />
              Assessment History
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              All attempts by this student
            </p>
          </div>
          <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded-full">
            {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No attempts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Assessment
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Subject
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Attempt
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Result
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/teacher/assessments/${a.assessmentId}`}
                        className="text-sm font-medium text-text hover:text-akoma-green transition-colors line-clamp-1"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {a.subject}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-text-secondary">
                        #{a.attemptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {a.status === 'graded' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBg(a.percentage)} rounded-full`}
                              style={{ width: `${a.percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(a.percentage)}`}>
                            {Math.round(a.percentage)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary capitalize">
                          {a.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {a.status === 'graded' ? (
                        a.passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-text-secondary">
                      {a.submittedAt
                        ? new Date(a.submittedAt).toLocaleDateString()
                        : '—'}
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
        <Link href={`/teacher/classes/${classId}/students`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </Link>
        <Link href={`/teacher/classes/${classId}/analytics`}>
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <BarChart3 className="h-4 w-4" />
            View Class Analytics
          </Button>
        </Link>
      </div>
    </div>
  );
}