/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Search,
  CheckCircle, 
  Calendar, 
} from 'lucide-react'; 
import { toast } from 'sonner';
import { getStudentPerformance } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function StudentPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewTab, setViewTab] = useState<'all' | 'top' | 'at-risk'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'attendance'>('score');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getStudentPerformance(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch student performance:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load student data');
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
        <p className="text-text-secondary">Student data not available</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const topPerformers = data.topPerformers || [];
  const atRisk = data.atRisk || [];
  const allStudents = data.allStudents || [];

  // Choose list based on tab
  let displayedStudents = allStudents;
  if (viewTab === 'top') displayedStudents = topPerformers;
  if (viewTab === 'at-risk') displayedStudents = atRisk;

  // Filter
  let filtered = displayedStudents.filter((s: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.admissionNumber?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.className?.toLowerCase().includes(term)
    );
  });

  // Sort
  filtered = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
    return b.averageScore - a.averageScore;
  });

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
          <h1 className="text-2xl font-bold text-text">Student Performance</h1>
          <p className="text-text-secondary">
            Scores, attendance, and risk tracking across all students
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Students</p>
              <p className="text-2xl font-bold text-text">{summary.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">With Attempts</p>
              <p className="text-2xl font-bold text-green-600">{summary.withAttempts || 0}</p>
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">At Risk</p>
              <p className="text-2xl font-bold text-red-600">{atRisk.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Highlight */}
      {topPerformers.length > 0 && (
        <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Top Performers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {topPerformers.slice(0, 5).map((s: any, idx: number) => (
              <div key={s.id} className="bg-white/10 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-200 text-gray-800' :
                    idx === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-white/30 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <p className="text-xs font-medium truncate flex-1">
                    {s.name}
                  </p>
                </div>
                <p className="text-lg font-bold">{s.averageScore}%</p>
                <p className="text-xs text-white/70 truncate">{s.className}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* At-Risk Alert */}
      {atRisk.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {atRisk.length} student{atRisk.length !== 1 ? 's' : ''} at risk
              </p>
              <p className="text-sm text-red-700 mt-1">
                These students are averaging below 50%. Consider early intervention.
              </p>
              <button
                onClick={() => setViewTab('at-risk')}
                className="text-sm text-red-700 underline hover:text-red-800 mt-2 font-medium"
              >
                View at-risk students →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
        <button
          onClick={() => setViewTab('all')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewTab === 'all'
              ? 'bg-akoma-green text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <Users className="h-4 w-4 inline mr-1.5" />
          All ({allStudents.length})
        </button>
        <button
          onClick={() => setViewTab('top')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewTab === 'top'
              ? 'bg-akoma-green text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <Award className="h-4 w-4 inline mr-1.5" />
          Top ({topPerformers.length})
        </button>
        <button
          onClick={() => setViewTab('at-risk')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            viewTab === 'at-risk'
              ? 'bg-akoma-green text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <AlertCircle className="h-4 w-4 inline mr-1.5" />
          At Risk ({atRisk.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, admission number, class, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
          >
            <option value="score">Sort: Score (high → low)</option>
            <option value="name">Sort: Name (A → Z)</option>
            <option value="attendance">Sort: Attendance (high → low)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No students match your search' : 'No students in this view'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Rank</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Class</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attempts</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Avg Score</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any, idx: number) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <span className="text-xs font-mono text-text-secondary">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-akoma-green">
                            {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-text-secondary font-mono">
                            {s.admissionNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {s.className}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {s.attemptsCount > 0 ? (
                        <div className="text-sm">
                          <span className="text-text font-medium">{s.attemptsCount}</span>
                          <span className="text-xs text-text-secondary ml-1">
                            ({s.passedCount}✓ {s.failedCount}✗)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">No attempts</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {s.attemptsCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBg(s.averageScore)}`}
                              style={{ width: `${s.averageScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(s.averageScore)}`}>
                            {s.averageScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                        <span className={`text-sm font-medium ${
                          s.attendanceRate >= 80 ? 'text-green-600' :
                          s.attendanceRate >= 60 ? 'text-blue-600' :
                          s.attendanceRate >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {s.attendanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}