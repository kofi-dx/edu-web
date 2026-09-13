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
  XCircle,
  BarChart3,
  Award,
  AlertCircle,
  Target,
  BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getNationalAssessmentPerformance,
  type AssessmentPerformance
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function NationalAssessmentsPage() {
  const [data, setData] = useState<AssessmentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getNationalAssessmentPerformance(range);
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
        <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Assessment data not available</p>
        <Link href="/ges">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const summary = data.summary || {};
  const subjects = data.subjects || [];

  // Sort subjects by attempts
  const sortedSubjects = [...subjects].sort((a, b) => b.attempts - a.attempts);

  return (
    <div className="space-y-6">
      <Link
        href="/ges"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">National Assessment Performance</h1>
          <p className="text-text-secondary">
            Student performance across all subjects in Ghana
          </p>
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

      {/* ============================================
          SUMMARY CARDS
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {summary.totalAttempts?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Total Attempts</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {summary.passed?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Passed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.failed?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-secondary">Failed</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(summary.averageScore || 0)}`}>
            {summary.averageScore || 0}%
          </p>
          <p className="text-xs text-text-secondary">Average Score</p>
        </div>
      </div>

      {/* ============================================
          OVERALL PASS RATE BANNER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5" />
              <h2 className="text-lg font-semibold">National Pass Rate</h2>
            </div>
            <p className="text-white/80 text-sm">
              {summary.passed?.toLocaleString() || 0} passed out of {summary.totalAttempts?.toLocaleString() || 0} attempts
            </p>
          </div>
          <div className="text-5xl font-bold">
            {summary.passRate || 0}%
          </div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${summary.passRate || 0}%` }}
          />
        </div>
      </div>

      {/* ============================================
          SUBJECT PERFORMANCE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-akoma-green" />
            Subject Performance
          </h2>
          <span className="text-xs text-text-secondary">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookMarked className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">
              No subject data available for this period
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSubjects.map((subject, idx) => (
              <div key={subject.subject} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-800' :
                    idx === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-text">{subject.subject}</h3>
                      <span className={`text-2xl font-bold ${getScoreColor(subject.averageScore)}`}>
                        {subject.averageScore}%
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {subject.attempts.toLocaleString()} attempts
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${getScoreBg(subject.averageScore)} rounded-full transition-all`}
                    style={{ width: `${subject.averageScore}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <p className="text-text-secondary">Attempts</p>
                    <p className="font-bold text-text text-sm">
                      {subject.attempts.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <p className="text-green-600">Passed</p>
                    <p className="font-bold text-green-700 text-sm">
                      {subject.passed.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-2 rounded text-center ${
                    subject.passRate >= 60 ? 'bg-akoma-green/5' : 'bg-red-50'
                  }`}>
                    <p className={subject.passRate >= 60 ? 'text-akoma-green' : 'text-red-600'}>
                      Pass Rate
                    </p>
                    <p className={`font-bold text-sm ${
                      subject.passRate >= 60 ? 'text-akoma-green' : 'text-red-700'
                    }`}>
                      {subject.passRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          INSIGHTS
          ============================================ */}
      {subjects.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-akoma-green" />
            Performance Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Subject */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-green-600" />
                <p className="text-xs font-semibold text-green-700">Best Performing</p>
              </div>
              <p className="font-bold text-green-800 truncate">
                {sortedSubjects.reduce((best, s) => s.averageScore > best.averageScore ? s : best, sortedSubjects[0]).subject}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {Math.max(...sortedSubjects.map(s => s.averageScore))}%
              </p>
            </div>

            {/* Worst Subject */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-700">Needs Attention</p>
              </div>
              <p className="font-bold text-red-800 truncate">
                {sortedSubjects.reduce((worst, s) => s.averageScore < worst.averageScore ? s : worst, sortedSubjects[0]).subject}
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {Math.min(...sortedSubjects.map(s => s.averageScore))}%
              </p>
            </div>

            {/* Average */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-700">National Average</p>
              </div>
              <p className="font-bold text-blue-800">Across all subjects</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {summary.averageScore || 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}