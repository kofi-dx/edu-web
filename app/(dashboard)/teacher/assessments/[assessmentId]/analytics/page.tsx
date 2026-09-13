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
  XCircle, 
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAssessmentAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function AssessmentAnalyticsPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [assessmentId]);

  const fetchAnalytics = async () => {
    try {
      const result = await getAssessmentAnalytics(assessmentId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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
        <Link href={`/teacher/assessments/${assessmentId}`}>
          <Button variant="outline" className="mt-4">Back to Assessment</Button>
        </Link>
      </div>
    );
  }

  const summary = data.summary || {};
  const distribution = data.distribution || {};
  const questionStats = data.questions || [];
  const assessment = data.assessment || {};

  // Find hardest and easiest questions
  const sortedQuestions = [...questionStats].sort(
    (a: any, b: any) => a.correctRate - b.correctRate
  );
  const hardest = sortedQuestions[0];
  const easiest = sortedQuestions[sortedQuestions.length - 1];

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/assessments/${assessmentId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">Assessment Analytics</h1>
        <p className="text-text-secondary">{assessment.title}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Attempts</p>
              <p className="text-2xl font-bold text-text">{summary.totalAttempts || 0}</p>
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
              <p className="text-2xl font-bold text-text">{summary.passed || 0}</p>
              <p className="text-xs text-green-600">{summary.passRate || 0}% pass rate</p>
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
              <p className="text-2xl font-bold text-text">{summary.failed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Avg Score</p>
              <p className="text-2xl font-bold text-text">{summary.averageScore || 0}%</p>
              <p className="text-xs text-text-secondary">
                {formatTime(summary.averageTimeSeconds)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Score Distribution
        </h2>

        {summary.totalAttempts === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">
            No graded attempts yet
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(distribution).map(([range, count]: [string, any]) => {
              const maxCount = Math.max(...Object.values(distribution) as number[]);
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const colors: Record<string, string> = {
                '0-20': 'bg-red-500',
                '21-40': 'bg-orange-500',
                '41-60': 'bg-yellow-500',
                '61-80': 'bg-blue-500',
                '81-100': 'bg-green-500'
              };
              return (
                <div key={range}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">{range}%</span>
                    <span className="text-sm font-medium text-text">
                      {count} student{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[range] || 'bg-gray-400'} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hardest / Easiest */}
      {questionStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hardest && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Hardest Question</h3>
              </div>
              <p className="text-sm text-red-700 mb-2 line-clamp-2">
                {hardest.questionText}
              </p>
              <p className="text-xs text-red-600">
                Only {hardest.correctRate}% got it right ({hardest.correctAnswers}/{hardest.totalAnswers})
              </p>
            </div>
          )}
          {easiest && questionStats.length > 1 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Easiest Question</h3>
              </div>
              <p className="text-sm text-green-700 mb-2 line-clamp-2">
                {easiest.questionText}
              </p>
              <p className="text-xs text-green-600">
                {easiest.correctRate}% got it right ({easiest.correctAnswers}/{easiest.totalAnswers})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Question-by-Question Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-akoma-green" />
          Question Performance
        </h2>

        {questionStats.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">
            No question data available
          </p>
        ) : (
          <div className="space-y-4">
            {questionStats.map((q: any, idx: number) => (
              <div key={q.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-akoma-green">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text mb-2">{q.questionText}</p>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
                      <span className="capitalize">{q.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{q.points} pts</span>
                      <span>•</span>
                      <span>{q.totalAnswers} answers</span>
                    </div>

                    {/* Correct rate bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">Correct Rate</span>
                        <span className={`text-xs font-medium ${
                          q.correctRate >= 70 ? 'text-green-600' :
                          q.correctRate >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {q.correctRate}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            q.correctRate >= 70 ? 'bg-green-500' :
                            q.correctRate >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${q.correctRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {q.correctAnswers} / {q.totalAnswers} correct
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Link href={`/teacher/assessments/${assessmentId}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Assessment
          </Button>
        </Link>
        <Link href={`/teacher/assessments/${assessmentId}/submissions`}>
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <Users className="h-4 w-4" />
            View Submissions
          </Button>
        </Link>
      </div>
    </div>
  );
}