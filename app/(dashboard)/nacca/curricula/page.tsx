/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  X,
  ChevronRight,
  GraduationCap,
  Layers, 
  FileText,
  ClipboardList,
  CheckCircle,
  Clock,
  Archive, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getDashboardStats,
  type DashboardStats,
  type CurriculumWithCounts
} from '@/lib/services/naccaService';

// ============================================
// COMPONENT
// ============================================

export default function NaccaCurriculaPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [curricula, setCurricula] = useState<CurriculumWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
      setCurricula(data.curricula || []);
    } catch (error: any) {
      console.error('Failed to fetch curricula:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load curricula');
    } finally {
      setLoading(false);
    }
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Archive className="h-3 w-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      government: 'bg-blue-100 text-blue-700',
      private: 'bg-purple-100 text-purple-700',
      nacca: 'bg-akoma-green/10 text-akoma-green',
      custom: 'bg-orange-100 text-orange-700'
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[source] || 'bg-gray-100 text-gray-700'}`}>
        {source}
      </span>
    );
  };

  // Filter
  const filtered = curricula.filter(c => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (
        !c.name?.toLowerCase().includes(term) &&
        !c.code?.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSourceFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || sourceFilter !== 'all' || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">All Curricula</h1>
          </div>
          <p className="text-text-secondary">
            {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''} in the system
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-akoma-green" />
          )}
        </Button>
      </div>

      {/* Summary chips */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-akoma-green" />
            <span className="text-sm text-text-secondary">Total:</span>
            <span className="text-sm font-bold text-text">{stats.totals.curricula}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            <span className="text-sm text-text-secondary">Published:</span>
            <span className="text-sm font-bold text-green-600">{stats.totals.publishedCurricula}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
            <Clock className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-sm text-text-secondary">Draft:</span>
            <span className="text-sm font-bold text-yellow-600">{stats.totals.draftCurricula}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
            <Archive className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-sm text-text-secondary">Archived:</span>
            <span className="text-sm font-bold text-gray-600">{stats.totals.archivedCurricula}</span>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {(showFilters || hasActiveFilters) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Sources</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
              <option value="nacca">NaCCA</option>
              <option value="custom">Custom</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-akoma-green/10 text-akoma-green text-xs font-medium">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-akoma-green/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sourceFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">
              {sourceFilter}
              <button
                onClick={() => setSourceFilter('all')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium capitalize">
              {statusFilter}
              <button
                onClick={() => setStatusFilter('all')}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Curricula list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {hasActiveFilters ? 'No curricula match your filters' : 'No curricula yet'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/nacca/curricula/${c.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6 text-akoma-green" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text truncate">{c.name}</h3>
                    {getStatusBadge(c.status)}
                    {getSourceBadge(c.source)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    {c.code && <span className="font-mono">{c.code}</span>}
                    {c.year && <span>Year {c.year}</span>}
                    <span>v{c.version}</span>
                    <span className="capitalize">{c.visibility}</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-4 md:gap-6 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      <p className="text-lg font-bold text-text">{c.levelCount}</p>
                    </div>
                    <p className="text-xs text-text-secondary">Levels</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                      <p className="text-lg font-bold text-text">{c.subjectCount}</p>
                    </div>
                    <p className="text-xs text-text-secondary">Subjects</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <FileText className="h-3.5 w-3.5 text-akoma-green" />
                      <p className="text-lg font-bold text-text">{c.lessonCount}</p>
                    </div>
                    <p className="text-xs text-text-secondary">Lessons</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <ClipboardList className="h-3.5 w-3.5 text-orange-600" />
                      <p className="text-lg font-bold text-text">{c.objectiveCount}</p>
                    </div>
                    <p className="text-xs text-text-secondary">Objectives</p>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0 hidden md:block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}