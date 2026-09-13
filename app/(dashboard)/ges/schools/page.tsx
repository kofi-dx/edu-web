/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Search,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight, 
  Filter,
  X, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getSchools,
  getRegionalBreakdown,
  type SchoolListItem,
  type RegionStat
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function GESSchoolsPage() {
  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [page, typeFilter, regionFilter, searchTerm]);

  const fetchRegions = async () => {
    try {
      const data = await getRegionalBreakdown('30d');
      setRegions(data);
    } catch (error: any) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: itemsPerPage,
      };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (regionFilter !== 'all') params.region = regionFilter;
      if (searchTerm) params.search = searchTerm;

      const data = await getSchools(params);
      setSchools(data.schools || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch schools:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search — reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, regionFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setRegionFilter('all');
    setPage(1);
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || regionFilter !== 'all';

  const getRatioColor = (ratio: number) => {
    if (ratio <= 20) return 'text-green-600';
    if (ratio <= 30) return 'text-blue-600';
    if (ratio <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">All Schools</h1>
          <p className="text-text-secondary">
            {total > 0
              ? `${total} school${total !== 1 ? 's' : ''} across Ghana`
              : 'Browse schools across Ghana'}
          </p>
        </div>

        <div className="flex gap-2">
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
      </div>

      {/* Filters Panel */}
      {(showFilters || hasActiveFilters) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by name, code, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm min-w-40"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r.region} value={r.region}>
                  {r.region}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
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
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">
              {typeFilter}
              <button
                onClick={() => setTypeFilter('all')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {regionFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {regionFilter}
              <button
                onClick={() => setRegionFilter('all')}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && schools.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schools.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Landmark className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {hasActiveFilters ? 'No schools match your filters' : 'No schools available'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Schools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/ges/schools/${school.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <Landmark className="h-5 w-5 text-akoma-green" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      school.type === 'public'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {school.type}
                    </span>
                    {!school.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Name + Code */}
                <h3 className="font-semibold text-text mb-1 truncate">
                  {school.name}
                </h3>
                <p className="text-xs text-text-secondary font-mono mb-2">
                  {school.code}
                </p>

                {/* Location */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mb-3">
                  {school.region && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {school.region}
                    </span>
                  )}
                  {school.district && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {school.district}
                    </span>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Users className="h-3 w-3 text-blue-600 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-blue-700">
                      {school.studentCount}
                    </p>
                    <p className="text-xs text-blue-600">Students</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <GraduationCap className="h-3 w-3 text-purple-600 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-purple-700">
                      {school.teacherCount}
                    </p>
                    <p className="text-xs text-purple-600">Teachers</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <BookOpen className="h-3 w-3 text-green-600 mx-auto mb-0.5" />
                    <p className="text-sm font-bold text-green-700">
                      {school.classCount}
                    </p>
                    <p className="text-xs text-green-600">Classes</p>
                  </div>
                </div>

                {/* Ratio */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-text-secondary">
                    Student:Teacher
                  </span>
                  <span className={`text-sm font-bold ${getRatioColor(school.studentTeacherRatio)}`}>
                    1:{school.studentTeacherRatio}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-6 py-4 shadow-sm">
              <p className="text-sm text-text-secondary">
                Page {page} of {totalPages} • Showing {schools.length} of {total} schools
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}