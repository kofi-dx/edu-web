/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/schools/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle,
  TrendingUp,
  School2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPublicSchoolDetail,
  type PublicSchoolDetail,
} from '@/lib/services/publicsService';

// ============================================
// HELPERS
// ============================================

function formatSchoolType(type: string): string {
  if (type === 'public') return 'Public';
  if (type === 'private') return 'Private';
  return type;
}

function getTypeBadgeClasses(type: string): string {
  if (type === 'public') return 'bg-blue-100 text-blue-700';
  if (type === 'private') return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-700';
}

function formatLevel(level: string): string {
  return level
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================
// PAGE
// ============================================

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const schoolId = params?.id as string;

  const [school, setSchool] = useState<PublicSchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await getPublicSchoolDetail(schoolId);
        if (mounted) setSchool(data);
      } catch (err: any) {
        if (!mounted) return;
        const message =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to load school';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [schoolId]);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F] mb-4" />
          <p>Loading school...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================
  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#17201D] mb-2">
            School Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            {error || "We couldn't find this school. It may have been removed or is not active."}
          </p>
          <Link href="/schools">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS
  // ============================================
  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="container px-4 mx-auto pt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-[#0B6B4F] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100 mt-4">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
        <div className="container relative px-4 py-12 mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-5 flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#0B6B4F]/10 flex items-center justify-center shrink-0">
                <School2 className="h-8 w-8 md:h-10 md:w-10 text-[#0B6B4F]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClasses(
                      school.type
                    )}`}
                  >
                    {formatSchoolType(school.type)}
                  </span>
                  {school.level && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {school.level}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-[#17201D] mb-3">
                  {school.name}
                </h1>
                <p className="text-sm text-text-secondary mb-4 font-mono">
                  {school.code}
                </p>

                {/* Contact info */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
                  {(school.district || school.region) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        {[school.district, school.region]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {school.contactEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{school.contactEmail}</span>
                    </div>
                  )}
                  {school.contactPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{school.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Apply CTA */}
            <div className="md:shrink-0">
              <Link href={`/schools/${school.id}/apply`}>
                <Button className="w-full md:w-auto bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white px-6 py-6 text-base rounded-full group">
                  Apply for Admission
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5 text-[#0B6B4F]" />}
              value={school.studentCount}
              label="Students"
            />
            <StatCard
              icon={<GraduationCap className="h-5 w-5 text-[#0B6B4F]" />}
              value={school.teacherCount}
              label="Teachers"
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5 text-[#0B6B4F]" />}
              value={school.classCount}
              label="Classes"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-[#0B6B4F]" />}
              value={`${school.attendanceRate}%`}
              label="Attendance (30d)"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-16">
        <div className="container px-4 mx-auto grid lg:grid-cols-3 gap-6">
          {/* Classes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#17201D]">
                    Classes & Availability
                  </h2>
                  <span className="text-sm text-text-secondary">
                    {school.classes.length} class
                    {school.classes.length === 1 ? '' : 'es'}
                  </span>
                </div>
              </div>

              {school.classes.length === 0 ? (
                <div className="p-10 text-center text-text-secondary">
                  <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No classes listed yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {school.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 md:p-5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#17201D] truncate">
                          {cls.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatLevel(cls.level)}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div>
                          <p className="text-sm font-semibold text-[#17201D]">
                            {cls.studentCount}/{cls.capacity}
                          </p>
                          <p className="text-xs text-text-secondary">Enrolled</p>
                        </div>
                        <div>
                          {cls.availableSpots > 0 ? (
                            <>
                              <p className="text-sm font-semibold text-green-600">
                                {cls.availableSpots}
                              </p>
                              <p className="text-xs text-text-secondary">
                                Spots left
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-red-600">
                                Full
                              </p>
                              <p className="text-xs text-text-secondary">
                                No spots
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available levels */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#17201D] mb-3 uppercase tracking-wide">
                Available Levels
              </h3>
              {school.availableLevels.length === 0 ? (
                <p className="text-sm text-text-secondary">Not specified</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {school.availableLevels.map((level) => (
                    <span
                      key={level}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#0B6B4F]/10 text-[#0B6B4F]"
                    >
                      {formatLevel(level)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Address */}
            {school.address && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#17201D] mb-3 uppercase tracking-wide">
                  Address
                </h3>
                <p className="text-sm text-text-secondary">{school.address}</p>
              </div>
            )}

            {/* Apply CTA card */}
            <div className="bg-[#0B6B4F] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <Calendar className="h-8 w-8 mb-3 opacity-90" />
                <h3 className="font-semibold text-lg mb-2">
                  Ready to enroll?
                </h3>
                <p className="text-white/80 text-sm mb-5">
                  Submit an application and the school will review it shortly.
                </p>
                <Link href={`/schools/${school.id}/apply`}>
                  <Button className="w-full bg-akoma-gold hover:bg-akoma-gold/90 text-white group">
                    Apply for Admission
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#17201D]">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}