/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  Users,
  GraduationCap, 
  MapPin,
  Building2,
  TrendingUp,
  ClipboardList,
  AlertCircle,
  Award,
  ArrowRight,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getNationalOverview,
  getTopSchools,
  type NationalOverview,
  type TopSchools
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function GESDashboardPage() {
  const [overview, setOverview] = useState<NationalOverview | null>(null);
  const [topSchools, setTopSchools] = useState<TopSchools | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewData, topData] = await Promise.all([
        getNationalOverview(range),
        getTopSchools(range),
      ]);
      setOverview(overviewData);
      setTopSchools(topData);
    } catch (error: any) {
      console.error('Failed to fetch national data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load dashboard');
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Data not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Ghana Education Service</h1>
          <p className="text-text-secondary">
            National overview of all schools and districts
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
          TOP STATS — 4 cards
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">{overview.schools.total}</p>
          <p className="text-sm text-white/80 mt-1">Total Schools</p>
          <p className="text-xs text-white/60 mt-2">
            {overview.schools.public} public • {overview.schools.private} private
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">
            {overview.students.total.toLocaleString()}
          </p>
          <p className="text-sm text-text-secondary mt-1">Total Students</p>
          <p className="text-xs text-text-secondary mt-2">
            {overview.classes.total} classes
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">
            {overview.teachers.total.toLocaleString()}
          </p>
          <p className="text-sm text-text-secondary mt-1">Total Teachers</p>
          <p className="text-xs text-text-secondary mt-2">
            {overview.students.total && overview.teachers.total
              ? `ratio 1:${Math.round(overview.students.total / overview.teachers.total)}`
              : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{overview.geography.regions}</p>
          <p className="text-sm text-text-secondary mt-1">Regions</p>
          <p className="text-xs text-text-secondary mt-2">
            {overview.geography.districts} districts
          </p>
        </div>
      </div>

      {/* ============================================
          ALERT — pending applications
          ============================================ */}
      {overview.schools.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800">
                  {overview.schools.pending} pending school application
                  {overview.schools.pending !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-700">
                  Awaiting review and approval
                </p>
              </div>
            </div>
            <Link href="/ges/schools?status=pending">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2">
                Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ============================================
          PERFORMANCE CARDS — attendance + assessments
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <Link
          href="/ges/analytics/attendance"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              National Attendance
            </h2>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(overview.attendance.rate)}`}>
                {overview.attendance.rate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  overview.attendance.rate >= 80 ? 'bg-green-500' :
                  overview.attendance.rate >= 60 ? 'bg-blue-500' :
                  overview.attendance.rate >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${overview.attendance.rate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {overview.attendance.present.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">
                {overview.attendance.late.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">
                {overview.attendance.absent.toLocaleString()}
              </p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
        </Link>

        {/* Assessments */}
        <Link
          href="/ges/analytics/assessments"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              National Assessments
            </h2>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Pass Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(overview.assessments.passRate)}`}>
                {overview.assessments.passRate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  overview.assessments.passRate >= 80 ? 'bg-green-500' :
                  overview.assessments.passRate >= 60 ? 'bg-blue-500' :
                  overview.assessments.passRate >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${overview.assessments.passRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {overview.assessments.totalAttempts.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">Attempts</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {overview.assessments.passed.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Passed</p>
            </div>
            <div className="text-center p-3 bg-akoma-green/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-akoma-green mx-auto mb-1" />
              <p className={`text-lg font-bold ${getScoreColor(overview.assessments.averageScore)}`}>
                {overview.assessments.averageScore}%
              </p>
              <p className="text-xs text-akoma-green">Avg</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ============================================
          TOP & AT-RISK SCHOOLS
          ============================================ */}
      {topSchools && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-text">Top Performing Schools</h2>
              </div>
              <Link
                href="/ges/schools?sort=performance"
                className="text-xs text-akoma-green hover:underline"
              >
                View all
              </Link>
            </div>

            {topSchools.top.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-10 w-10 text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No data yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topSchools.top.slice(0, 5).map((school: any, idx: number) => (
                  <Link
                    key={school.id}
                    href={`/ges/schools/${school.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-800' :
                      idx === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {school.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {school.region} • {school.district}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-600">
                        {school.averageScore}%
                      </p>
                      <p className="text-xs text-text-secondary">
                        {school.attempts} attempts
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* At Risk */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="font-semibold text-text">At-Risk Schools</h2>
              </div>
              <Link
                href="/ges/schools?risk=high"
                className="text-xs text-red-600 hover:underline"
              >
                View all
              </Link>
            </div>

            {topSchools.atRisk.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  🎉 No at-risk schools
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topSchools.atRisk.slice(0, 5).map((school: any) => (
                  <Link
                    key={school.id}
                    href={`/ges/schools/${school.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-red-50/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {school.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {school.region} • {school.district}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-600">
                        {school.averageScore}%
                      </p>
                      <p className="text-xs text-text-secondary">
                        {school.attempts} attempts
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================
          QUICK LINKS
          ============================================ */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Explore
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/ges/regions"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Regions</p>
              <p className="text-xs text-text-secondary truncate">
                {overview.geography.regions} regions
              </p>
            </div>
          </Link>

          <Link
            href="/ges/districts"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Districts</p>
              <p className="text-xs text-text-secondary truncate">
                {overview.geography.districts} districts
              </p>
            </div>
          </Link>

          <Link
            href="/ges/schools"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Schools</p>
              <p className="text-xs text-text-secondary truncate">
                {overview.schools.total} schools
              </p>
            </div>
          </Link>

          <Link
            href="/ges/analytics/performance"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text text-sm">Performance</p>
              <p className="text-xs text-text-secondary truncate">
                National analytics
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}