/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Users,
  Landmark,
  TrendingUp,
  MapPin
} from 'lucide-react'; 
import { toast } from 'sonner';
import {
  getDistrictBreakdown,
  getRegionalBreakdown,
  type DistrictStat,
  type RegionStat
} from '@/lib/services/gesService';

// ============================================
// COMPONENT
// ============================================

export default function GESDistrictsPage() {
  const [districts, setDistricts] = useState<DistrictStat[]>([]);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [range, selectedRegion]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [districtsData, regionsData] = await Promise.all([
        getDistrictBreakdown(range, selectedRegion === 'all' ? undefined : selectedRegion),
        getRegionalBreakdown(range)
      ]);
      setDistricts(districtsData);
      setRegions(regionsData);
    } catch (error: any) {
      console.error('Failed to fetch districts:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load districts');
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

  // Filter
  const filtered = districts.filter(d =>
    d.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregate stats
  const totalDistricts = districts.length;
  const totalSchools = districts.reduce((sum, d) => sum + (d.schools || 0), 0);
  const totalStudents = districts.reduce((sum, d) => sum + (d.students || 0), 0);
  const avgAttendance = districts.length > 0
    ? Math.round(districts.reduce((sum, d) => sum + (d.attendance || 0), 0) / districts.length)
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
          <h1 className="text-2xl font-bold text-text">Districts</h1>
          <p className="text-text-secondary">
            All {districts.length} districts{selectedRegion !== 'all' ? ` in ${selectedRegion}` : ' across Ghana'}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{totalDistricts}</p>
          <p className="text-xs text-text-secondary">Districts</p>
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

      {/* Filters Row */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search districts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm min-w-48"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r.region} value={r.region}>
                  {r.region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Districts Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm || selectedRegion !== 'all'
              ? 'No districts match your filters'
              : 'No districts available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((district) => (
            <Link
              key={`${district.region}-${district.district}`}
              href={`/ges/districts/${encodeURIComponent(district.district)}`}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-akoma-green" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary font-medium">
                  {district.region}
                </span>
              </div>

              <h3 className="font-semibold text-text mb-3 truncate">
                {district.district}
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Schools</p>
                  <p className="text-lg font-bold text-blue-700">{district.schools}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600">Students</p>
                  <p className="text-lg font-bold text-purple-700">
                    {district.students.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Teachers</p>
                  <p className="text-lg font-bold text-green-700">{district.teachers}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Attendance</span>
                  <span className={`font-bold ${getScoreColor(district.attendance)}`}>
                    {district.attendance}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(district.attendance)} rounded-full`}
                    style={{ width: `${district.attendance}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-text-secondary">Ratio</span>
                  <span className={`font-medium ${
                    district.studentTeacherRatio > 30 ? 'text-red-600' : 'text-text'
                  }`}>
                    1:{district.studentTeacherRatio}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}