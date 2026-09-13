/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  ClipboardList,
  Building2, 
  Award,
  AlertCircle,
  Users,
  ArrowRight,
  Target, 
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getRegionalAnalytics,
  type RegionalAnalytics
} from '@/lib/services/regionalService';

// ============================================
// COMPONENT
// ============================================

export default function RegionalAnalyticsPage() {
  const [data, setData] = useState<RegionalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getRegionalAnalytics(range);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch regional analytics:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load analytics');
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
        <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Analytics not available</p>
      </div>
    );
  }

  const { overview, districts, topSchools, attendance, assessments } = data;

  // Sort districts
  const districtsByStudents = [...districts].sort((a, b) => b.students - a.students);
  const districtsByAttendance = [...districts].sort((a, b) => b.attendance - a.attendance);
  const districtsByPass = [...districts].sort((a, b) => b.assessmentPassRate - a.assessmentPassRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">Regional Analytics</h1>
          </div>
          <p className="text-text-secondary">
            Full performance snapshot for {overview.region.name}
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
          TOP SUMMARY — 4 cards
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 text-white shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <p className="text-3xl font-bold">{districts.length}</p>
          <p className="text-sm text-white/80 mt-1">Districts</p>
          <p className="text-xs text-white/60 mt-1">
            {overview.schools.total} schools
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-text">
            {overview.students.total.toLocaleString()}
          </p>
          <p className="text-sm text-text-secondary mt-1">Students</p>
          <p className="text-xs text-text-secondary mt-1">
            {overview.teachers.total.toLocaleString()} teachers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(overview.attendance.rate)}`}>
            {overview.attendance.rate}%
          </p>
          <p className="text-sm text-text-secondary mt-1">Attendance</p>
          <p className="text-xs text-text-secondary mt-1">
            {overview.attendance.total.toLocaleString()} records
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(overview.assessments.passRate)}`}>
            {overview.assessments.passRate}%
          </p>
          <p className="text-sm text-text-secondary mt-1">Pass Rate</p>
          <p className="text-xs text-text-secondary mt-1">
            {overview.assessments.totalAttempts.toLocaleString()} attempts
          </p>
        </div>
      </div>

      {/* ============================================
          RANKINGS — 3 columns side by side
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top by Students */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-text text-sm">Top by Enrollment</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {districtsByStudents.slice(0, 5).map((district, idx) => (
              <Link
                key={district.district}
                href={`/regional/schools?district=${encodeURIComponent(district.district)}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-800' :
                  idx === 2 ? 'bg-orange-300 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{district.district}</p>
                  <p className="text-xs text-text-secondary">{district.schools} schools</p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {district.students.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top by Attendance */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h2 className="font-semibold text-text text-sm">Best Attendance</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {districtsByAttendance.slice(0, 5).map((district, idx) => (
              <Link
                key={district.district}
                href={`/regional/schools?district=${encodeURIComponent(district.district)}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-800' :
                  idx === 2 ? 'bg-orange-300 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{district.district}</p>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getScoreBg(district.attendance)}`}
                      style={{ width: `${district.attendance}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(district.attendance)}`}>
                  {district.attendance}%
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top by Pass Rate */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <h2 className="font-semibold text-text text-sm">Best Pass Rate</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {districtsByPass.slice(0, 5).map((district, idx) => (
              <Link
                key={district.district}
                href={`/regional/schools?district=${encodeURIComponent(district.district)}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-800' :
                  idx === 2 ? 'bg-orange-300 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{district.district}</p>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getScoreBg(district.assessmentPassRate)}`}
                      style={{ width: `${district.assessmentPassRate}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(district.assessmentPassRate)}`}>
                  {district.assessmentPassRate}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          PERFORMANCE CARDS — Attendance + Assessment
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <Link
          href="/regional/analytics/attendance"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              Attendance Performance
            </h2>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Regional Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(attendance.summary.attendanceRate)}`}>
                {attendance.summary.attendanceRate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreBg(attendance.summary.attendanceRate)}`}
                style={{ width: `${attendance.summary.attendanceRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {attendance.summary.present.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">
                {attendance.summary.late.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">
                {attendance.summary.absent.toLocaleString()}
              </p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
        </Link>

        {/* Assessment */}
        <Link
          href="/regional/analytics/assessments"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              Assessment Performance
            </h2>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Pass Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(assessments.summary.passRate)}`}>
                {assessments.summary.passRate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreBg(assessments.summary.passRate)}`}
                style={{ width: `${assessments.summary.passRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ClipboardList className="h-4 w-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {assessments.summary.totalAttempts.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">Attempts</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {assessments.summary.passed.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Passed</p>
            </div>
            <div className="text-center p-3 bg-akoma-green/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-akoma-green mx-auto mb-1" />
              <p className={`text-lg font-bold ${getScoreColor(assessments.summary.averageScore)}`}>
                {assessments.summary.averageScore}%
              </p>
              <p className="text-xs text-akoma-green">Avg</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ============================================
          TOP & AT-RISK SCHOOLS
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold text-text">Top Performing Schools</h2>
            </div>
            <Link
              href="/regional/schools"
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
                    <p className="text-xs text-text-secondary">{school.district}</p>
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
              href="/regional/schools"
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
                    <p className="text-xs text-text-secondary">{school.district}</p>
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

      {/* ============================================
          FULL DISTRICTS TABLE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Building2 className="h-5 w-5 text-akoma-green" />
              All Districts
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Complete performance metrics for all {districts.length} districts
            </p>
          </div>
          <Link href="/regional/districts">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Rank</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">District</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Schools</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Students</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Ratio</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attendance</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {districtsByAttendance.map((district, idx) => (
                <tr key={district.district} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <span className="text-xs font-mono text-text-secondary">#{idx + 1}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/regional/schools?district=${encodeURIComponent(district.district)}`}
                      className="text-sm font-medium text-text hover:text-akoma-green transition-colors"
                    >
                      {district.district}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-text">{district.schools}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-text">
                      {district.students.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-sm font-medium ${
                      district.studentTeacherRatio > 30 ? 'text-red-600' : 'text-text'
                    }`}>
                      1:{district.studentTeacherRatio}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBg(district.attendance)} rounded-full`}
                          style={{ width: `${district.attendance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(district.attendance)}`}>
                        {district.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {district.assessmentAttempts > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBg(district.assessmentPassRate)} rounded-full`}
                            style={{ width: `${district.assessmentPassRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(district.assessmentPassRate)}`}>
                          {district.assessmentPassRate}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">No data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}