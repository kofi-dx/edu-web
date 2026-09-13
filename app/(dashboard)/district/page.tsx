/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ClipboardList,
  CheckCircle,
  XCircle,
  ArrowRight,
  Award,
  AlertCircle,
  BarChart3,
  Target,
  Clock
} from 'lucide-react'; 
import { toast } from 'sonner';
import {
  getDistrictOverview,
  getTopSchools,
  type DistrictOverview,
  type TopSchools
} from '@/lib/services/districtService';

// ============================================
// COMPONENT
// ============================================

export default function DistrictDashboardPage() {
  const [overview, setOverview] = useState<DistrictOverview | null>(null);
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
        getDistrictOverview(range),
        getTopSchools(range),
      ]);
      setOverview(overviewData);
      setTopSchools(topData);
    } catch (error: any) {
      console.error('Failed to fetch district data:', error);
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
        <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">District data not available</p>
        <p className="text-xs text-text-secondary mt-2">
          Make sure your account has a district assigned. Contact super admin.
        </p>
      </div>
    );
  }

  const { district, schools, students, teachers, classes, attendance, assessments } = overview;

  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">{district.name}</h1>
          </div>
          <p className="text-text-secondary">
            {district.region ? `${district.region} Region • ` : ''}
            District overview of all schools
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
          HERO — Green gradient banner
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5" />
          <h2 className="text-lg font-semibold">District at a Glance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Schools</p>
            </div>
            <p className="text-2xl font-bold">{schools.total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Students</p>
            </div>
            <p className="text-2xl font-bold">{students.total.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Teachers</p>
            </div>
            <p className="text-2xl font-bold">{teachers.total.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Classes</p>
            </div>
            <p className="text-2xl font-bold">{classes.total}</p>
          </div>
        </div>
      </div>

      {/* ============================================
          STATS CARDS — 4
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/district/schools"
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-600" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-3xl font-bold text-text">{schools.total}</p>
          <p className="text-sm text-text-secondary mt-1">Schools</p>
          <p className="text-xs text-text-secondary mt-2">
            {schools.public} public • {schools.private} private
          </p>
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">
            {students.total.toLocaleString()}
          </p>
          <p className="text-sm text-text-secondary mt-1">Students</p>
          <p className="text-xs text-text-secondary mt-2">
            {teachers.total.toLocaleString()} teachers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(attendance.rate)}`}>
            {attendance.rate}%
          </p>
          <p className="text-sm text-text-secondary mt-1">Attendance Rate</p>
          <p className="text-xs text-text-secondary mt-2">
            {attendance.total.toLocaleString()} records
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(assessments.passRate)}`}>
            {assessments.passRate}%
          </p>
          <p className="text-sm text-text-secondary mt-1">Assessment Pass Rate</p>
          <p className="text-xs text-text-secondary mt-2">
            {assessments.totalAttempts.toLocaleString()} attempts
          </p>
        </div>
      </div>

      {/* ============================================
          PERFORMANCE BREAKDOWN
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              Attendance Overview
            </h2>
            <Link
              href="/district/analytics/attendance"
              className="text-xs text-akoma-green hover:underline flex items-center gap-1"
            >
              Details
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">District Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(attendance.rate)}`}>
                {attendance.rate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  attendance.rate >= 80 ? 'bg-green-500' :
                  attendance.rate >= 60 ? 'bg-blue-500' :
                  attendance.rate >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${attendance.rate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {attendance.present.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">
                {attendance.late.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">
                {attendance.absent.toLocaleString()}
              </p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
        </div>

        {/* Assessment Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              Assessment Performance
            </h2>
            <Link
              href="/district/analytics/assessments"
              className="text-xs text-akoma-green hover:underline flex items-center gap-1"
            >
              Details
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Pass Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(assessments.passRate)}`}>
                {assessments.passRate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  assessments.passRate >= 80 ? 'bg-green-500' :
                  assessments.passRate >= 60 ? 'bg-blue-500' :
                  assessments.passRate >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${assessments.passRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {assessments.totalAttempts.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">Attempts</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {assessments.passed.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Passed</p>
            </div>
            <div className="text-center p-3 bg-akoma-green/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-akoma-green mx-auto mb-1" />
              <p className={`text-lg font-bold ${getScoreColor(assessments.averageScore)}`}>
                {assessments.averageScore}%
              </p>
              <p className="text-xs text-akoma-green">Avg</p>
            </div>
          </div>
        </div>
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
                href="/district/schools"
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
                {topSchools.top.slice(0, 5).map((school, idx) => (
                  <div
                    key={school.id}
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
                      <p className="text-xs text-text-secondary font-mono">
                        {school.code}
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
                  </div>
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
                href="/district/schools"
                className="text-xs text-red-600 hover:underline"
              >
                View all
              </Link>
            </div>

            {topSchools.atRisk.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  🎉 No at-risk schools in this district
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topSchools.atRisk.slice(0, 5).map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center gap-3 p-4 hover:bg-red-50/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {school.name}
                      </p>
                      <p className="text-xs text-text-secondary font-mono">
                        {school.code}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================
          QUICK LINKS
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Explore
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/district/schools"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Schools</p>
              <p className="text-xs text-text-secondary truncate">
                {schools.total} schools
              </p>
            </div>
          </Link>

          <Link
            href="/district/analytics/attendance"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Attendance</p>
              <p className="text-xs text-text-secondary truncate">
                Daily trends
              </p>
            </div>
          </Link>

          <Link
            href="/district/analytics/assessments"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Assessments</p>
              <p className="text-xs text-text-secondary truncate">
                Subject performance
              </p>
            </div>
          </Link>

          <Link
            href="/district/analytics"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Analytics</p>
              <p className="text-xs text-text-secondary truncate">
                Full performance
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}