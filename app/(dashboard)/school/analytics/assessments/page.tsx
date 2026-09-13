/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  TrendingUp,
  CheckCircle, 
  BarChart3,
  BookMarked, 
} from 'lucide-react'; 
import { toast } from 'sonner';
import { getAssessmentPerformance } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function AssessmentPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [viewTab, setViewTab] = useState<'subjects' | 'assessments'>('subjects');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAssessmentPerformance(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch assessment performance:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load data');
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
        <p className="text-text-secondary">Assessment data not available</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const subjects = data.subjects || [];
  const assessments = data.assessments || [];

  return (
    <div className="space-y-6">
      <Link
        href="/school/analytics"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Analytics
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Assessment Performance</h1>
          <p className="text-text-secondary">How students are performing across subjects</p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
            { value: '1y', label: '1y' },
            { value: 'all', label: 'All' }
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
                {summary.publishedAssessments || 0} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Attempts</p>
              <p className="text-2xl font-bold text-text">{summary.totalAttempts || 0}</p>
              <p className="text-xs text-text-secondary">
                {summary.passedAttempts || 0} passed
              </p>
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
              <BarChart3 className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Avg Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(summary.averageScore || 0)}`}>
                {summary.averageScore || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
        <button
          onClick={() => setViewTab('subjects')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewTab === 'subjects'
              ? 'bg-akoma-green text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <BookMarked className="h-4 w-4 inline mr-1.5" />
          By Subject
        </button>
        <button
          onClick={() => setViewTab('assessments')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewTab === 'assessments'
              ? 'bg-akoma-green text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <ClipboardList className="h-4 w-4 inline mr-1.5" />
          By Assessment
        </button>
      </div>

      {/* Content */}
      {viewTab === 'subjects' ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-akoma-green" />
            Subject Performance
          </h2>

          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookMarked className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No subject data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((sub: any) => (
                <div key={sub.subject} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-text">{sub.subject}</h3>
                      <p className="text-xs text-text-secondary">
                        {sub.assessmentCount} assessment{sub.assessmentCount !== 1 ? 's' : ''} •{' '}
                        {sub.attemptCount} attempt{sub.attemptCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(sub.averageScore)}`}>
                        {sub.averageScore}%
                      </p>
                      <p className="text-xs text-text-secondary">avg score</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${getScoreBg(sub.averageScore)} rounded-full transition-all`}
                      style={{ width: `${sub.averageScore}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center py-2 bg-gray-50 rounded">
                      <p className="text-text-secondary">Attempts</p>
                      <p className="font-bold text-text">{sub.attemptCount}</p>
                    </div>
                    <div className="text-center py-2 bg-green-50 rounded">
                      <p className="text-green-600">Passed</p>
                      <p className="font-bold text-green-700">{sub.passedCount}</p>
                    </div>
                    <div className="text-center py-2 bg-akoma-green/5 rounded">
                      <p className="text-akoma-green">Pass Rate</p>
                      <p className="font-bold text-akoma-green">{sub.passRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              Assessment Performance
            </h2>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No assessment data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Assessment</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Subject</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attempts</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Pass Rate</th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a: any) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-text truncate max-w-xs">
                          {a.title}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {a.subject}
                        </span>
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
                        <span className="text-sm text-text">{a.attemptCount}</span>
                        {a.attemptCount > 0 && (
                          <span className="text-xs text-text-secondary ml-1">
                            ({a.passedCount}/{a.attemptCount})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {a.attemptCount > 0 ? (
                          <span className={`text-sm font-bold ${getScoreColor(a.passRate)}`}>
                            {a.passRate}%
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {a.attemptCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getScoreBg(a.averageScore)}`}
                                style={{ width: `${a.averageScore}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(a.averageScore)}`}>
                              {a.averageScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">No attempts</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}