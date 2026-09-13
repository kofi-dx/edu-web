/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Users, 
  Eye,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getClassAnalytics } from '@/lib/services/schoolAdminService';

// ============================================
// COMPONENT
// ============================================

export default function ClassStudentsPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'attempts'>('name');

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      const result = await getClassAnalytics(classId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch class students:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load students');
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
        <p className="text-text-secondary">Students not available</p>
        <Link href="/teacher/classes">
          <Button variant="outline" className="mt-4">Back to Classes</Button>
        </Link>
      </div>
    );
  }

  const cls = data.class || {};
  const summary = data.summary || {};
  const allStudents = data.allStudents || [];

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

  // Filter + sort
  let filtered = allStudents.filter((s: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(term) ||
      s.lastName?.toLowerCase().includes(term) ||
      s.admissionNumber?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  filtered = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'name') {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
    if (sortBy === 'score') {
      return b.averageScore - a.averageScore;
    }
    if (sortBy === 'attempts') {
      return b.attemptsCount - a.attemptsCount;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/classes/${classId}/analytics`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Class Analytics
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Class Students</h1>
          <p className="text-text-secondary">
            {cls.name} {cls.level ? `• ${cls.level.replace('_', ' ')}` : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/teacher/classes/${classId}/analytics`}>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-text-secondary mb-1">Total Students</p>
          <p className="text-2xl font-bold text-text">{summary.totalStudents || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-text-secondary mb-1">Class Average</p>
          <p className={`text-2xl font-bold ${getScoreColor(summary.averageScore || 0)}`}>
            {summary.averageScore || 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-text-secondary mb-1">Pass Rate</p>
          <p className="text-2xl font-bold text-green-600">{summary.passRate || 0}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-text-secondary mb-1">Total Attempts</p>
          <p className="text-2xl font-bold text-text">{summary.totalAttempts || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, admission number, or email..."
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
            <option value="name">Sort: Name</option>
            <option value="score">Sort: Score (high → low)</option>
            <option value="attempts">Sort: Attempts (most first)</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No students match your search' : 'No students in this class'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s: any) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-akoma-green">
                    {s.firstName?.[0]}{s.lastName?.[0]}
                  </span>
                </div>
                <div className={`text-right`}>
                  <p className={`text-xl font-bold ${getScoreColor(s.averageScore)}`}>
                    {s.averageScore}%
                  </p>
                  <p className="text-xs text-text-secondary">avg score</p>
                </div>
              </div>

              <h3 className="font-semibold text-text mb-1 truncate">
                {s.firstName} {s.lastName}
              </h3>
              <p className="text-xs text-text-secondary font-mono mb-3">
                {s.admissionNumber}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(s.averageScore)} rounded-full transition-all`}
                    style={{ width: `${s.averageScore}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-xs text-text-secondary">Attempts</p>
                  <p className="text-sm font-bold text-text">{s.attemptsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Passed</p>
                  <p className="text-sm font-bold text-green-600">{s.passedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Failed</p>
                  <p className="text-sm font-bold text-red-600">{s.failedCount}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/teacher/classes/${classId}/students/${s.id}/analytics`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    Analytics
                  </Button>
                </Link>
                <Link
                  href={`/teacher/classes/${classId}/students/${s.id}/analytics`}
                  className="flex-1"
                >
                  <Button size="sm" className="w-full bg-akoma-green hover:bg-akoma-dark text-white gap-1 text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}