/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Users, 
  Landmark,
  TrendingUp,
  Building2,
  ChevronRight, 
  ClipboardList, 
  Target,
  School as SchoolIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getRegionalBreakdown,
  getDistrictBreakdown,
  getSchools,
  type RegionStat,
  type DistrictStat,
  type SchoolListItem
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function RegionDetailPage() {
  const params = useParams();
  const regionId = decodeURIComponent(params.regionId as string);

  const [region, setRegion] = useState<RegionStat | null>(null);
  const [districts, setDistricts] = useState<DistrictStat[]>([]);
  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [schoolFilter, setSchoolFilter] = useState<string>('all'); // all | public | private

  useEffect(() => {
    fetchData();
  }, [regionId, range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsData, districtsData, schoolsData] = await Promise.all([
        getRegionalBreakdown(range),
        getDistrictBreakdown(range, regionId),
        getSchools({ region: regionId, limit: 100 }),
      ]);

      const foundRegion = regionsData.find(r => r.region === regionId);
      setRegion(foundRegion || null);
      setDistricts(districtsData);
      setSchools(schoolsData.schools || []);
    } catch (error: any) {
      console.error('Failed to fetch region data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load region');
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

  if (!region) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Region not found</p>
        <Link href="/ges/regions">
          <Button variant="outline" className="mt-4">Back to Regions</Button>
        </Link>
      </div>
    );
  }

  const filteredSchools = schools.filter(s => {
    if (schoolFilter === 'all') return true;
    return s.type === schoolFilter;
  });

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/ges/regions"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Regions
      </Link>

      {/* ============================================
          REGION HEADER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{region.region} Region</h1>
              <p className="text-white/80 text-sm">
                {region.schools} schools • {region.students.toLocaleString()} students •{' '}
                {region.teachers.toLocaleString()} teachers
              </p>
            </div>
          </div>

          <div className="flex gap-1 bg-white/10 backdrop-blur rounded-lg p-1">
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
                    ? 'bg-white text-akoma-green'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          KEY METRICS — 4 cards
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Landmark className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{region.schools}</p>
          <p className="text-xs text-text-secondary">Schools</p>
          <p className="text-xs text-text-secondary mt-1">
            {region.publicSchools} public • {region.privateSchools} private
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {region.students.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">Students</p>
          <p className="text-xs text-text-secondary mt-1">
            {region.teachers.toLocaleString()} teachers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(region.attendance)}`}>
            {region.attendance}%
          </p>
          <p className="text-xs text-text-secondary">Attendance Rate</p>
          <p className="text-xs text-text-secondary mt-1">
            {region.attendanceRecords.toLocaleString()} records
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(region.assessmentPassRate)}`}>
            {region.assessmentPassRate}%
          </p>
          <p className="text-xs text-text-secondary">Pass Rate</p>
          <p className="text-xs text-text-secondary mt-1">
            {region.assessmentAttempts.toLocaleString()} attempts
          </p>
        </div>
      </div>

      {/* ============================================
          PERFORMANCE BREAKDOWN
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-akoma-green" />
            Attendance Performance
          </h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Regional Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(region.attendance)}`}>
                {region.attendance}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreBg(region.attendance)}`}
                style={{ width: `${region.attendance}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-secondary">Total Records</p>
              <p className="text-lg font-bold text-text">
                {region.attendanceRecords.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-secondary">Per Student</p>
              <p className="text-lg font-bold text-text">
                {region.students > 0
                  ? (region.attendanceRecords / region.students).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-akoma-green" />
            Assessment Performance
          </h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Pass Rate</span>
              <span className={`text-3xl font-bold ${getScoreColor(region.assessmentPassRate)}`}>
                {region.assessmentPassRate}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreBg(region.assessmentPassRate)}`}
                style={{ width: `${region.assessmentPassRate}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-secondary">Total Attempts</p>
              <p className="text-lg font-bold text-text">
                {region.assessmentAttempts.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-text-secondary">Avg Score</p>
              <p className={`text-lg font-bold ${getScoreColor(region.averageScore)}`}>
                {region.averageScore}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          DISTRICTS TABLE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Building2 className="h-5 w-5 text-akoma-green" />
              Districts in {region.region}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {districts.length} districts
            </p>
          </div>
          <Link href={`/ges/districts?region=${encodeURIComponent(region.region)}`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {districts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No districts available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">District</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Schools</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Students</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Teachers</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Ratio</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {districts.map((d) => (
                  <tr key={d.district} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-text">{d.district}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{d.schools}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">
                        {d.students.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">
                        {d.teachers.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm font-medium ${
                        d.studentTeacherRatio > 30 ? 'text-red-600' : 'text-text'
                      }`}>
                        1:{d.studentTeacherRatio}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreBg(d.attendance)}`}
                            style={{ width: `${d.attendance}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(d.attendance)}`}>
                          {d.attendance}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================
          SCHOOLS IN REGION
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <SchoolIcon className="h-5 w-5 text-akoma-green" />
              Schools in {region.region}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSchoolFilter(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  schoolFilter === opt.value
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSchools.length === 0 ? (
          <div className="text-center py-12">
            <SchoolIcon className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No schools found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredSchools.map((school) => (
              <Link
                key={school.id}
                href={`/ges/schools/${school.id}`}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-akoma-green/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <Landmark className="h-5 w-5 text-akoma-green" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    school.type === 'public'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {school.type}
                  </span>
                </div>

                <h3 className="font-semibold text-text text-sm mb-1 truncate">
                  {school.name}
                </h3>
                <p className="text-xs text-text-secondary font-mono mb-3">
                  {school.code}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-text-secondary">Students</p>
                    <p className="font-bold text-text">{school.studentCount}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Teachers</p>
                    <p className="font-bold text-text">{school.teacherCount}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Classes</p>
                    <p className="font-bold text-text">{school.classCount}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}