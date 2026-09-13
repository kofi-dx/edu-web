/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Download,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getNationalAnalytics } from '@/lib/services/adminService';

interface OverviewStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  averageAttendance: number;
  activeSchools: number;
  pendingSchools: number;
  studentGrowth: number;
  teacherGrowth: number;
}

interface RegionalData {
  region: string;
  schools: number;
  students: number;
  teachers: number;
  attendance: number;
  performance: number;
}

interface TrendData {
  date: string;
  students: number;
  teachers: number;
  schools: number;
  attendance: number;
}

interface SubjectData {
  subject: string;
  averageScore: number;
  studentsAssessed: number;
  passRate: number;
  trend: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getNationalAnalytics();
      if (data) {
        setOverview(data.overview || null);
        setRegionalData(data.regional || []);
        setTrends(data.trends || []);
        setSubjectData(data.subjectPerformance || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-text-secondary';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-text-secondary">
            Platform-wide analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-akoma-green shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Schools</p>
          </div>
          <p className="text-2xl font-bold text-text">{overview?.totalSchools || 0}</p>
          <div className="flex items-center gap-1 text-xs mt-1">
            <span className="text-green-600">+{overview?.activeSchools || 0} active</span>
            <span className="text-text-secondary">·</span>
            <span className="text-yellow-600">{overview?.pendingSchools || 0} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Students</p>
          </div>
          <p className="text-2xl font-bold text-text">{formatNumber(overview?.totalStudents || 0)}</p>
          <div className="flex items-center gap-1 text-xs mt-1">
            {overview?.studentGrowth !== undefined && (
              <>
                {getTrendIcon(overview.studentGrowth)}
                <span className={getTrendColor(overview.studentGrowth)}>
                  {Math.abs(overview.studentGrowth)}% growth
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Teachers</p>
          </div>
          <p className="text-2xl font-bold text-text">{formatNumber(overview?.totalTeachers || 0)}</p>
          <div className="flex items-center gap-1 text-xs mt-1">
            {overview?.teacherGrowth !== undefined && (
              <>
                {getTrendIcon(overview.teacherGrowth)}
                <span className={getTrendColor(overview.teacherGrowth)}>
                  {Math.abs(overview.teacherGrowth)}% growth
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Classes</p>
          </div>
          <p className="text-2xl font-bold text-text">{overview?.totalClasses || 0}</p>
          <p className="text-xs text-text-secondary mt-1">
            Avg. {overview?.totalStudents && overview?.totalClasses ? Math.round(overview.totalStudents / overview.totalClasses) : 0} students/class
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Attendance Rate</p>
          </div>
          <p className="text-2xl font-bold text-akoma-green">{overview?.averageAttendance || 0}%</p>
          <p className="text-xs text-text-secondary mt-1">
            Last {timeRange}
          </p>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text">Regional Performance</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm bg-white"
            >
              <option value="all">All Regions</option>
              {regionalData.map((region) => (
                <option key={region.region} value={region.region}>{region.region}</option>
              ))}
            </select>
          </div>
        </div>

        {regionalData.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No regional data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Region
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Schools
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Students
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Teachers
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Attendance
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {(selectedRegion === 'all' ? regionalData : regionalData.filter(r => r.region === selectedRegion)).map((region, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-text">{region.region}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-text">{region.schools}</td>
                    <td className="py-3 px-4 text-right text-text">{formatNumber(region.students)}</td>
                    <td className="py-3 px-4 text-right text-text">{formatNumber(region.teachers)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${region.attendance >= 80 ? 'text-green-600' : region.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {region.attendance}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${region.performance >= 70 ? 'text-green-600' : region.performance >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {region.performance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student & Teacher Growth */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Growth Trends</h3>
          {trends.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No trend data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Students</span>
                  <span className="font-medium text-text">{formatNumber(trends[trends.length - 1]?.students || 0)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-akoma-green rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((trends[trends.length - 1]?.students || 0) / 1000 * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Teachers</span>
                  <span className="font-medium text-text">{formatNumber(trends[trends.length - 1]?.teachers || 0)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((trends[trends.length - 1]?.teachers || 0) / 100 * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">Attendance</span>
                  <span className="font-medium text-text">{trends[trends.length - 1]?.attendance || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${trends[trends.length - 1]?.attendance || 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Subject Performance</h3>
          {subjectData.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No subject data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjectData.slice(0, 5).map((subject, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-text">{subject.subject}</p>
                    <p className="text-xs text-text-secondary">
                      {subject.studentsAssessed} students assessed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-akoma-green">{subject.averageScore}%</p>
                    <p className="text-xs text-text-secondary">
                      Pass rate: {subject.passRate}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="gap-2">
            <Globe className="h-4 w-4" />
            View All Regions
          </Button>
        </div>
      </div>
    </div>
  );
}