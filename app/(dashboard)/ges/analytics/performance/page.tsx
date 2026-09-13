/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  Landmark,
  Target,
  MapPin,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getNationalOverview,
  getRegionalBreakdown,
  getTopSchools,
  type NationalOverview,
  type RegionStat,
  type TopSchools
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function NationalPerformancePage() {
  const [overview, setOverview] = useState<NationalOverview | null>(null);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [topSchools, setTopSchools] = useState<TopSchools | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewData, regionsData, topData] = await Promise.all([
        getNationalOverview(range),
        getRegionalBreakdown(range),
        getTopSchools(range),
      ]);
      setOverview(overviewData);
      setRegions(regionsData);
      setTopSchools(topData);
    } catch (error: any) {
      console.error('Failed to fetch performance data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load data');
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

  if (!overview) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Performance data not available</p>
        <Link href="/ges">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Sort regions by different metrics
  const regionsByStudents = [...regions].sort((a, b) => b.students - a.students);
  const regionsByAttendance = [...regions].sort((a, b) => b.attendance - a.attendance);
  const regionsByPass = [...regions].sort((a, b) => b.assessmentPassRate - a.assessmentPassRate);

  return (
    <div className="space-y-6">
      <Link
        href="/ges"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">National Performance Overview</h1>
          <p className="text-text-secondary">
            Comprehensive education metrics across Ghana
          </p>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {[
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
            { value: '1y', label: '1y' }
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
          HERO STATS
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-akoma-green to-green-700 rounded-xl p-5 text-white shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <p className="text-3xl font-bold">{overview.schools.total}</p>
          <p className="text-sm text-white/80 mt-1">Schools</p>
          <p className="text-xs text-white/60 mt-1">
            {overview.schools.public} public • {overview.schools.private} private
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
            {overview.classes.total} classes
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
          REGIONAL RANKINGS — 3 columns
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
            {regionsByStudents.slice(0, 5).map((region, idx) => (
              <Link
                key={region.region}
                href={`/ges/regions/${encodeURIComponent(region.region)}`}
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
                  <p className="text-sm font-medium text-text truncate">{region.region}</p>
                  <p className="text-xs text-text-secondary">{region.schools} schools</p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {region.students.toLocaleString()}
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
            {regionsByAttendance.slice(0, 5).map((region, idx) => (
              <Link
                key={region.region}
                href={`/ges/regions/${encodeURIComponent(region.region)}`}
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
                  <p className="text-sm font-medium text-text truncate">{region.region}</p>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getScoreBg(region.attendance)}`}
                      style={{ width: `${region.attendance}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(region.attendance)}`}>
                  {region.attendance}%
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
            {regionsByPass.slice(0, 5).map((region, idx) => (
              <Link
                key={region.region}
                href={`/ges/regions/${encodeURIComponent(region.region)}`}
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
                  <p className="text-sm font-medium text-text truncate">{region.region}</p>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getScoreBg(region.assessmentPassRate)}`}
                      style={{ width: `${region.assessmentPassRate}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(region.assessmentPassRate)}`}>
                  {region.assessmentPassRate}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          FULL REGIONAL TABLE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <MapPin className="h-5 w-5 text-akoma-green" />
            All Regions Overview
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Complete performance metrics for all {regions.length} regions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Rank</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Region</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Schools</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Students</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Ratio</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attendance</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {regionsByAttendance.map((region, idx) => (
                <tr key={region.region} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <span className="text-xs font-mono text-text-secondary">#{idx + 1}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/ges/regions/${encodeURIComponent(region.region)}`}
                      className="text-sm font-medium text-text hover:text-akoma-green transition-colors"
                    >
                      {region.region}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-text">{region.schools}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-text">
                      {region.students.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-sm font-medium ${
                      region.studentTeacherRatio > 30 ? 'text-red-600' : 'text-text'
                    }`}>
                      1:{region.studentTeacherRatio}
                    </span>
                  </td>
                  <td className="px-6 py-3">
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
                  <td className="px-6 py-3">
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
                </tr>
              ))}
            </tbody>
          </table>
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
                href="/ges/schools"
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
                href="/ges/schools"
                className="text-xs text-red-600 hover:underline"
              >
                View all
              </Link>
            </div>
            {topSchools.atRisk.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-10 w-10 text-green-500 mx-auto mb-2" />
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
    </div>
  );
}