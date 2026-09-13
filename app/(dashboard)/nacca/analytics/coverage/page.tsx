/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Target,
  CheckCircle, 
  Search, 
  X,
  Grid3x3,
  BarChart3,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getCoverage,
  type Coverage, 
  type CoverageCell
} from '@/lib/services/naccaService';

// ============================================
// LEVEL LABELS
// ============================================

const LEVEL_LABELS: Record<string, string> = {
  basic_1: 'B1',
  basic_2: 'B2',
  basic_3: 'B3',
  basic_4: 'B4',
  basic_5: 'B5',
  basic_6: 'B6',
  jhs_1: 'J1',
  jhs_2: 'J2',
  jhs_3: 'J3',
  shs_1: 'S1',
  shs_2: 'S2',
  shs_3: 'S3'
};

const LEVEL_FULL_LABELS: Record<string, string> = {
  basic_1: 'Basic 1',
  basic_2: 'Basic 2',
  basic_3: 'Basic 3',
  basic_4: 'Basic 4',
  basic_5: 'Basic 5',
  basic_6: 'Basic 6',
  jhs_1: 'JHS 1',
  jhs_2: 'JHS 2',
  jhs_3: 'JHS 3',
  shs_1: 'SHS 1',
  shs_2: 'SHS 2',
  shs_3: 'SHS 3'
};

// ============================================
// COMPONENT
// ============================================

export default function NaccaCoveragePage() {
  const [data, setData] = useState<Coverage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyCovered, setShowOnlyCovered] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ subject: string; level: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getCoverage();
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch coverage:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load coverage');
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
        <Target className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Coverage data not available</p>
        <Link href="/nacca/analytics">
          <Button variant="outline" className="mt-4">Back to Analytics</Button>
        </Link>
      </div>
    );
  }

  const { levels, matrix, stats } = data;

  // Filter rows
  const filteredMatrix = matrix.filter(row => {
    if (searchTerm) {
      if (!row.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    if (showOnlyCovered) {
      const hasAnyCovered = Object.values(row.levels).some((c: CoverageCell) => c.covered);
      if (!hasAnyCovered) return false;
    }
    if (showOnlyMissing) {
      const hasAnyMissing = Object.values(row.levels).some((c: CoverageCell) => !c.covered);
      if (!hasAnyMissing) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setShowOnlyCovered(false);
    setShowOnlyMissing(false);
  };

  const hasActiveFilters = searchTerm || showOnlyCovered || showOnlyMissing;

  // Calculate stats for the filtered view
  const filteredCoveredCells = filteredMatrix.reduce((sum, row) => {
    return sum + Object.values(row.levels).filter((c: CoverageCell) => c.covered).length;
  }, 0);
  const filteredTotalCells = filteredMatrix.length * levels.length;

  // Get cell background based on coverage
  const getCellStyle = (cell: CoverageCell) => {
    if (!cell.covered) {
      return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
    }
    if (cell.topicCount >= 5) {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    if (cell.topicCount >= 3) {
      return 'bg-green-400 text-white hover:bg-green-500';
    }
    if (cell.topicCount >= 1) {
      return 'bg-green-300 text-green-900 hover:bg-green-400';
    }
    // Covered but 0 topics
    return 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300';
  };

  return (
    <div className="space-y-6">
      <Link
        href="/nacca/analytics"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Analytics
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grid3x3 className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">Coverage Matrix</h1>
          </div>
          <p className="text-text-secondary">
            Which subjects exist at which levels across the curriculum
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchData}
          className="gap-2"
        >
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.totalSubjects}</p>
          <p className="text-xs text-text-secondary">Subjects</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.totalLevels}</p>
          <p className="text-xs text-text-secondary">Levels</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.coveredCells}</p>
          <p className="text-xs text-text-secondary">Covered Cells</p>
          <p className="text-xs text-text-secondary mt-1">
            of {stats.totalCells} total
          </p>
        </div>

        <div className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.coveragePercentage}%</p>
          <p className="text-xs text-white/80">Coverage</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors text-sm">
            <input
              type="checkbox"
              checked={showOnlyCovered}
              onChange={(e) => {
                setShowOnlyCovered(e.target.checked);
                if (e.target.checked) setShowOnlyMissing(false);
              }}
              className="h-4 w-4 rounded text-akoma-green focus:ring-akoma-green"
            />
            Has content
          </label>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors text-sm">
            <input
              type="checkbox"
              checked={showOnlyMissing}
              onChange={(e) => {
                setShowOnlyMissing(e.target.checked);
                if (e.target.checked) setShowOnlyCovered(false);
              }}
              className="h-4 w-4 rounded text-akoma-green focus:ring-akoma-green"
            />
            Has gaps
          </label>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters */}
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
          {showOnlyCovered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              Has content
              <button
                onClick={() => setShowOnlyCovered(false)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {showOnlyMissing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              Has gaps
              <button
                onClick={() => setShowOnlyMissing(false)}
                className="hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 mb-2">How to read this matrix</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-700">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                No subject
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-yellow-200" />
                Subject, 0 topics
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-green-300" />
                1-2 topics
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-green-400" />
                3-4 topics
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-green-500" />
                5+ topics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      {filteredMatrix.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Target className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {hasActiveFilters ? 'No subjects match your filters' : 'No subjects available'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4 gap-2">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="sticky left-0 bg-gray-50/50 text-left text-xs font-medium text-text-secondary uppercase px-4 py-3 min-w-45 z-10 border-r border-gray-100">
                    Subject
                  </th>
                  {levels.map((level) => (
                    <th
                      key={level}
                      className="text-center text-xs font-medium text-text-secondary uppercase px-3 py-3 min-w-15"
                      title={LEVEL_FULL_LABELS[level] || level}
                    >
                      {LEVEL_LABELS[level] || level}
                    </th>
                  ))}
                  <th className="text-center text-xs font-medium text-text-secondary uppercase px-3 py-3 min-w-20 border-l border-gray-100">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMatrix.map((row) => {
                  const coveredCount = Object.values(row.levels).filter(
                    (c: CoverageCell) => c.covered
                  ).length;
                  const coveragePct = Math.round((coveredCount / levels.length) * 100);

                  return (
                    <tr
                      key={row.subject}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="sticky left-0 bg-white text-left px-4 py-3 border-r border-gray-100 z-10">
                        <p className="text-sm font-medium text-text truncate max-w-45">
                          {row.subject}
                        </p>
                      </td>
                      {levels.map((level) => {
                        const cell = row.levels[level] || { covered: false, topicCount: 0 };
                        const isHovered =
                          hoveredCell?.subject === row.subject &&
                          hoveredCell?.level === level;

                        return (
                          <td
                            key={level}
                            className="px-1 py-1"
                            onMouseEnter={() =>
                              setHoveredCell({ subject: row.subject, level })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div
                              className={`w-full h-9 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-colors relative ${getCellStyle(cell)}`}
                              title={`${row.subject} - ${LEVEL_FULL_LABELS[level] || level}: ${
                                cell.covered ? `${cell.topicCount} topics` : 'Not covered'
                              }`}
                            >
                              {cell.covered ? cell.topicCount : '—'}
                              {isHovered && cell.covered && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                                  {LEVEL_FULL_LABELS[level]}: {cell.topicCount} topics
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 border-l border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                coveragePct >= 80 ? 'bg-green-500' :
                                coveragePct >= 50 ? 'bg-blue-500' :
                                coveragePct >= 25 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${coveragePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-text-secondary">
                            {coveragePct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="sticky left-0 bg-gray-50/50 text-left text-xs font-medium text-text-secondary uppercase px-4 py-3 border-r border-gray-100 z-10">
                    Level Coverage
                  </td>
                  {levels.map((level) => {
                    const levelCoveredCount = filteredMatrix.filter(
                      row => row.levels[level]?.covered
                    ).length;
                    const levelPct = filteredMatrix.length > 0
                      ? Math.round((levelCoveredCount / filteredMatrix.length) * 100)
                      : 0;

                    return (
                      <td key={level} className="px-1 py-2 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs font-bold ${
                            levelPct >= 80 ? 'text-green-600' :
                            levelPct >= 50 ? 'text-blue-600' :
                            levelPct >= 25 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {levelPct}%
                          </span>
                          <span className="text-xs text-text-secondary">
                            {levelCoveredCount}/{filteredMatrix.length}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 border-l border-gray-100 text-center">
                    <span className="text-xs font-bold text-text">
                      {filteredTotalCells > 0
                        ? Math.round((filteredCoveredCells / filteredTotalCells) * 100)
                        : 0}
                      %
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Overall Coverage</h2>
            <p className="text-white/80 text-sm">
              {stats.coveredCells} of {stats.totalCells} subject-level combinations covered
            </p>
          </div>
          <div className="text-5xl font-bold">{stats.coveragePercentage}%</div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${stats.coveragePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}