/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/schools/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  School2,
  BookOpen,
  QrCode,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPublicSchools,
  getPublicRegions,
  type PublicSchool,
} from '@/lib/services/publicsService';

// ============================================
// TYPES
// ============================================

type SchoolTypeFilter = 'All' | 'public' | 'private';

// ============================================
// HELPERS
// ============================================

function formatSchoolType(type: PublicSchool['type']): string {
  return type === 'public' ? 'Public' : 'Private';
}

function getTypeBadgeClasses(type: PublicSchool['type']): string {
  return type === 'public'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700';
}

// ============================================
// PAGE
// ============================================

export default function SchoolsPage() {
  // Data
  const [schools, setSchools] = useState<PublicSchool[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SchoolTypeFilter>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // ============================================
  // LOAD REGIONS ONCE
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getPublicRegions();
      if (mounted) setRegions(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // LOAD SCHOOLS WHEN FILTERS/PAGE CHANGE
  // ============================================
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getPublicSchools({
          page,
          limit,
          search: searchQuery.trim() || undefined,
          type: selectedType === 'All' ? undefined : selectedType,
          region: selectedRegion === 'All' ? undefined : selectedRegion,
        });

        if (!mounted) return;
        setSchools(result.schools);
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error?.message || 'Failed to load schools');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, searchQuery, selectedType, selectedRegion]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedType, selectedRegion]);

  const regionOptions = useMemo(
    () => ['All', ...regions],
    [regions]
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
        <div className="container relative px-4 py-20 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium mb-4">
              Schools
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#17201D] mb-6">
              Schools Using <br />
              <span className="text-[#0B6B4F]">Akoma Edu</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Join the growing network of schools across Ghana using Akoma Edu
              to improve education outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as SchoolTypeFilter)}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm"
                >
                  <option value="All">All Types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm"
              >
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'All' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result count */}
          {!loading && !error && (
            <div className="mt-3 text-sm text-text-secondary">
              {total === 0
                ? 'No schools found'
                : `Showing ${schools.length} of ${total} school${total === 1 ? '' : 's'}`}
            </div>
          )}
        </div>
      </section>

      {/* Schools Grid */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F] mb-4" />
              <p>Loading schools...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20">
              <School2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && schools.length === 0 && (
            <div className="text-center py-20">
              <School2 className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                No schools found matching your criteria.
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && schools.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <Link
                    key={school.id}
                    href={`/schools/${school.id}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group block"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center shrink-0">
                            <School2 className="h-6 w-6 text-[#0B6B4F]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#17201D] group-hover:text-[#0B6B4F] transition-colors line-clamp-2">
                              {school.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full ${getTypeBadgeClasses(
                                  school.type
                                )}`}
                              >
                                {formatSchoolType(school.type)}
                              </span>
                              {school.level && (
                                <span className="text-text-secondary">
                                  {school.level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 shrink-0">
                          <CheckCircle className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-text-secondary mb-4">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          {[school.district, school.region]
                            .filter(Boolean)
                            .join(', ') || 'Location not specified'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#0B6B4F]">
                            {school.studentCount}
                          </p>
                          <p className="text-xs text-text-secondary">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#0B6B4F]">
                            {school.teacherCount}
                          </p>
                          <p className="text-xs text-text-secondary">Teachers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-[#0B6B4F]">
                            {school.attendanceRate}%
                          </p>
                          <p className="text-xs text-text-secondary">Attendance</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-text-secondary">
                          <BookOpen className="h-4 w-4" />
                          <span>{school.classCount} classes</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary">
                          <QrCode className="h-4 w-4" />
                          <span>QR Attendance</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-[#0B6B4F] font-medium group-hover:underline inline-flex items-center gap-1">
                          View school
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text-secondary px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B6B4F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-akoma-gold/10 rounded-full blur-3xl" />
        <div className="container relative px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Add Your School to Akoma Edu
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join the growing network of schools across Ghana using Akoma Edu.
          </p>
          <Link href="/apply/school">
            <Button className="bg-akoma-gold hover:bg-akoma-gold/90 text-white px-8 py-6 text-base rounded-full group">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}