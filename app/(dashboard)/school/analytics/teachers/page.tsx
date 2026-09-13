/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap, 
  ClipboardList,
  TrendingUp,
  Search,
  Award,
  CheckCircle,
  Mail,
  Building2
} from 'lucide-react'; 
import { toast } from 'sonner';
import { getTeacherPerformance } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function TeacherPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'attempts' | 'score' | 'name'>('attempts');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getTeacherPerformance(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch teacher performance:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load teacher data');
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
        <p className="text-text-secondary">Teacher data not available</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const teachers = data.teachers || [];

  // Filter + sort
  let filtered = teachers.filter((t: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.employeeNumber?.toLowerCase().includes(term)
    );
  });

  filtered = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'score') return b.averageScore - a.averageScore;
    return b.attemptCount - a.attemptCount;
  });

  // Top 3 teachers by activity
  const topTeachers = [...teachers]
    .filter(t => t.attemptCount > 0)
    .sort((a, b) => b.attemptCount - a.attemptCount)
    .slice(0, 3);

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
          <h1 className="text-2xl font-bold text-text">Teacher Performance</h1>
          <p className="text-text-secondary">Activity and student outcomes per teacher</p>
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
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total Teachers</p>
              <p className="text-2xl font-bold text-text">{summary.totalTeachers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Active</p>
              <p className="text-2xl font-bold text-green-600">{summary.activeTeachers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Assessments</p>
              <p className="text-2xl font-bold text-text">{summary.totalAssessments || 0}</p>
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
      </div>

      {/* Top Teachers */}
      {topTeachers.length > 0 && (
        <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Most Active Teachers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topTeachers.map((t: any, idx: number) => (
              <div key={t.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-200 text-gray-800' :
                    'bg-orange-300 text-orange-900'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-white/70">
                      {t.attemptCount} attempt{t.attemptCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>{t.assessmentCount} assessment{t.assessmentCount !== 1 ? 's' : ''}</span>
                  <span className="font-bold">{t.averageScore}% avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or employee number..."
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
            <option value="attempts">Sort: Attempts (most first)</option>
            <option value="score">Sort: Score (high → low)</option>
            <option value="name">Sort: Name (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Teachers List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No teachers match your search' : 'No teachers found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t: any) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-akoma-green">
                    {t.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text mb-1">{t.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    {t.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {t.email}
                      </span>
                    )}
                    {t.employeeNumber && (
                      <span className="font-mono">{t.employeeNumber}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {t.classCount} class{t.classCount !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Assessments</p>
                    <p className="text-lg font-bold text-text">{t.assessmentCount}</p>
                    <p className="text-xs text-text-secondary">
                      {t.publishedCount} published
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Attempts</p>
                    <p className="text-lg font-bold text-text">{t.attemptCount}</p>
                    <p className="text-xs text-text-secondary">
                      {t.studentsReached} student{t.studentsReached !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Avg Score</p>
                    {t.attemptCount > 0 ? (
                      <>
                        <p className={`text-lg font-bold ${getScoreColor(t.averageScore)}`}>
                          {t.averageScore}%
                        </p>
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden mx-auto mt-1">
                          <div
                            className={`h-full ${getScoreBg(t.averageScore)}`}
                            style={{ width: `${t.averageScore}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-text-secondary mt-1">No data</p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Pass Rate</p>
                    {t.attemptCount > 0 ? (
                      <p className={`text-lg font-bold ${
                        t.passRate >= 60 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.passRate}%
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary mt-1">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}