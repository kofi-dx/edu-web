/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  Landmark,
  TrendingUp, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getDistrictBreakdown,
  getSchools,
  type DistrictStat,
  type SchoolListItem
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function DistrictDetailPage() {
  const params = useParams();
  const districtName = decodeURIComponent(params.district as string);

  const [district, setDistrict] = useState<DistrictStat | null>(null);
  const [schools, setSchools] = useState<SchoolListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [districtName, range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // We don't have a direct getDistrict endpoint, so filter from all districts
      const allDistricts = await getDistrictBreakdown(range);
      const found = allDistricts.find(d => d.district === districtName);
      setDistrict(found || null);

      // Get schools in this district
      const schoolsData = await getSchools({
        district: districtName,
        limit: 100,
      });
      setSchools(schoolsData.schools || []);
    } catch (error: any) {
      console.error('Failed to fetch district data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load district');
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

  if (!district) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">District not found</p>
        <Link href="/ges/districts">
          <Button variant="outline" className="mt-4">Back to Districts</Button>
        </Link>
      </div>
    );
  }

  const filteredSchools = schools.filter(s => {
    if (typeFilter === 'all') return true;
    return s.type === typeFilter;
  });

  const publicCount = schools.filter(s => s.type === 'public').length;
  const privateCount = schools.filter(s => s.type === 'private').length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/ges/districts"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Districts
      </Link>

      {/* ============================================
          DISTRICT HEADER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{district.district}</h1>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {district.region} Region
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
          <p className="text-2xl font-bold text-text">{district.schools}</p>
          <p className="text-xs text-text-secondary">Schools</p>
          <p className="text-xs text-text-secondary mt-1">
            {publicCount} public • {privateCount} private
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {district.students.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">Students</p>
          <p className="text-xs text-text-secondary mt-1">
            {district.teachers.toLocaleString()} teachers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(district.attendance)}`}>
            {district.attendance}%
          </p>
          <p className="text-xs text-text-secondary">Attendance Rate</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${
            district.studentTeacherRatio > 30 ? 'text-red-600' : 'text-text'
          }`}>
            1:{district.studentTeacherRatio}
          </p>
          <p className="text-xs text-text-secondary">Student:Teacher</p>
          {district.studentTeacherRatio > 30 && (
            <p className="text-xs text-red-600 mt-1">⚠ Above recommended</p>
          )}
        </div>
      </div>

      {/* ============================================
          ATTENDANCE CARD
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-akoma-green" />
          Attendance Performance
        </h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">District Rate</span>
            <span className={`text-3xl font-bold ${getScoreColor(district.attendance)}`}>
              {district.attendance}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getScoreBg(district.attendance)}`}
              style={{ width: `${district.attendance}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-green-600">Excellent</p>
            <p className="text-lg font-bold text-green-700">≥80%</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-xs text-yellow-600">Fair</p>
            <p className="text-lg font-bold text-yellow-700">40-79%</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-xs text-red-600">Needs Attention</p>
            <p className="text-lg font-bold text-red-700">&lt;40%</p>
          </div>
        </div>
      </div>

      {/* ============================================
          SCHOOLS IN DISTRICT
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Landmark className="h-5 w-5 text-akoma-green" />
              Schools in {district.district}
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
                onClick={() => setTypeFilter(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  typeFilter === opt.value
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
            <Landmark className="h-12 w-12 text-text-secondary mx-auto mb-3" />
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
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