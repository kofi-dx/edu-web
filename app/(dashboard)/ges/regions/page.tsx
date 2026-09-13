/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Users,
  Landmark,
  TrendingUp,
  ArrowUpDown,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRegionalBreakdown, type RegionStat } from '@/lib/services/gesService';

// ============================================
// TYPES
// ============================================

type SortField = 'students' | 'schools' | 'attendance' | 'passRate' | 'name';
type SortDir = 'asc' | 'desc';

// ============================================
// SORT ICON (outside component)
// ============================================

interface SortIconProps {
  field: SortField;
  currentField: SortField;
  direction: SortDir;
}

function SortIcon({ field, currentField, direction }: SortIconProps) {
  if (currentField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-text-secondary opacity-40" />;
  }
  return direction === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-akoma-green" />
  ) : (
    <ArrowDown className="h-3 w-3 text-akoma-green" />
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GESRegionsPage() {
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('students');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRegionalBreakdown(range);
      setRegions(data);
    } catch (error: any) {
      console.error('Failed to fetch regions:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load regions');
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Filter + sort
  let filtered = regions.filter(r =>
    r.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered = [...filtered].sort((a: any, b: any) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.region.localeCompare(b.region);
    else if (sortField === 'students') comparison = a.students - b.students;
    else if (sortField === 'schools') comparison = a.schools - b.schools;
    else if (sortField === 'attendance') comparison = a.attendance - b.attendance;
    else if (sortField === 'passRate') comparison = a.assessmentPassRate - b.assessmentPassRate;
    return sortDir === 'asc' ? comparison : -comparison;
  });

  // Summary aggregates
  const totalStudents = regions.reduce((sum, r) => sum + (r.students || 0), 0);
  const totalSchools = regions.reduce((sum, r) => sum + (r.schools || 0), 0);
  const avgAttendance = regions.length > 0
    ? Math.round(regions.reduce((sum, r) => sum + (r.attendance || 0), 0) / regions.length)
    : 0;

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
          <h1 className="text-2xl font-bold text-text">Regions</h1>
          <p className="text-text-secondary">
            All {regions.length} regions across Ghana with performance stats
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{regions.length}</p>
          <p className="text-xs text-text-secondary">Regions</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Landmark className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{totalSchools}</p>
          <p className="text-xs text-text-secondary">Total Schools</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {totalStudents.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">Total Students</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(avgAttendance)}`}>
            {avgAttendance}%
          </p>
          <p className="text-xs text-text-secondary">Avg Attendance</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Regions Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <MapPin className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No regions match your search' : 'No regions available'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 hover:text-text"
                    >
                      Region
                      <SortIcon field="name" currentField={sortField} direction={sortDir} />
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    <button
                      onClick={() => handleSort('schools')}
                      className="flex items-center gap-1.5 hover:text-text"
                    >
                      Schools
                      <SortIcon field="schools" currentField={sortField} direction={sortDir} />
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    <button
                      onClick={() => handleSort('students')}
                      className="flex items-center gap-1.5 hover:text-text"
                    >
                      Students
                      <SortIcon field="students" currentField={sortField} direction={sortDir} />
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Teachers
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Ratio
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    <button
                      onClick={() => handleSort('attendance')}
                      className="flex items-center gap-1.5 hover:text-text"
                    >
                      Attendance
                      <SortIcon field="attendance" currentField={sortField} direction={sortDir} />
                    </button>
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    <button
                      onClick={() => handleSort('passRate')}
                      className="flex items-center gap-1.5 hover:text-text"
                    >
                      Pass Rate
                      <SortIcon field="passRate" currentField={sortField} direction={sortDir} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((region) => {
                  const ratio = region.studentTeacherRatio;
                  const isRatioBad = ratio > 30;

                  return (
                    <tr
                      key={region.region}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-akoma-green" />
                          </div>
                          <div>
                            <p className="font-medium text-text">{region.region}</p>
                            <p className="text-xs text-text-secondary">
                              {region.publicSchools} public • {region.privateSchools} private
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text">
                          {region.schools}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text">
                          {region.students.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text">
                          {region.teachers.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${isRatioBad ? 'text-red-600' : 'text-text'}`}>
                          1:{ratio}
                        </span>
                        {isRatioBad && (
                          <span className="ml-1 text-xs text-red-500">⚠</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreBg(region.attendance)} rounded-full`}
                              style={{ width: `${region.attendance}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(region.attendance)}`}>
                            {region.attendance}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {region.assessmentAttempts > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getScoreBg(region.assessmentPassRate)} rounded-full`}
                                style={{ width: `${region.assessmentPassRate}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(region.assessmentPassRate)}`}>
                              {region.assessmentPassRate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/ges/regions/${encodeURIComponent(region.region)}`}
                        >
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            View
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>≥80% (excellent)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>60-79% (good)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>40-59% (fair)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>&lt;40% (needs attention)</span>
        </div>
      </div>
    </div>
  );
}