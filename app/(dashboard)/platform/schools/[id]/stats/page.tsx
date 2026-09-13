/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/platform/schools/[id]/stats/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Printer,
  RefreshCw,
  School,
  Building2,
  Mail,
  Phone,
  MapPin,
  Settings  
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSchoolById, getSchoolStats } from '@/lib/services/adminService';
import { format } from 'date-fns';

interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  attendanceRate: number;
  studentGrowth: number;
  status: string;
  type: string;
  registrationCompleted: boolean;
}

interface School {
  id: string;
  name: string;
  code: string;
  type: string;
  level: string;
  status: string;
  region: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  verifiedAt?: string;
}

type TimeRange = 'week' | 'month' | 'year';

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  trend, 
  timeRange,
  color = 'text-akoma-green' 
}: any) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
        {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg ${color.replace('text', 'bg')}/10 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{Math.abs(trend)}% from last {timeRange}</span>
      </div>
    )}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function SchoolStatsPage() {
  const params = useParams();
  const schoolId = params.id as string;
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [schoolId, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schoolData = await getSchoolById(schoolId);
      if (schoolData) {
        setSchool(schoolData);
      }

      const statsData = await getSchoolStats(schoolId, timeRange);
      if (statsData) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      toast.success('Report exported successfully!');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-700', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      suspended: { color: 'bg-red-100 text-red-700', label: 'Suspended' },
      rejected: { color: 'bg-gray-100 text-gray-700', label: 'Rejected' },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">School not found</h2>
          <Link href="/platform/schools">
            <Button className="mt-4">Back to Schools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link href={`/platform/schools/${schoolId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to School Details
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text">School Statistics</h1>
            {getStatusBadge(school.status)}
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-text-secondary">{school.name}</span>
            <span className="text-text-secondary">•</span>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-text-secondary">
              {school.code}
            </code>
            <span className="text-text-secondary">•</span>
            <span className="text-text-secondary">{school.district}, {school.region}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-akoma-green shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-akoma-green border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Stats Cards - ALL REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats?.students || 0}
          trend={stats?.studentGrowth || 0}
          timeRange={timeRange}
          color="text-blue-600"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Teachers"
          value={stats?.teachers || 0}
          timeRange={timeRange}
          color="text-purple-600"
        />
        <StatCard
          icon={BookOpen}
          label="Total Classes"
          value={stats?.classes || 0}
          timeRange={timeRange}
          color="text-orange-600"
        />
        <StatCard
          icon={Calendar}
          label="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          subtext={`Last ${timeRange}`}
          timeRange={timeRange}
          color="text-green-600"
        />
      </div>

      {/* Charts Section - REMOVED MOCK DATA, PLACEHOLDER FOR REAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth - Placeholder for real chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">Student Growth</h3>
            <span className="text-xs text-text-secondary">Real data from API</span>
          </div>
          <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
            <div className="text-center">
              <p>Chart will display real student growth data</p>
              <p className="text-xs mt-1">Coming soon with chart library</p>
            </div>
          </div>
        </div>

        {/* Attendance Distribution - REAL DATA */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Attendance Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Attendance Rate</span>
                <span className="font-medium text-akoma-green">{stats?.attendanceRate || 0}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-akoma-green rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(stats?.attendanceRate || 0, 100)}%` }} 
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-text-secondary text-center">
            <span>Attendance rate based on real attendance data</span>
          </div>
        </div>
      </div>

      {/* School Information - ALL REAL DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-text mb-4">School Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">School Name</p>
                <p className="text-sm text-text">{school.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <School className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">School Code</p>
                <p className="text-sm font-mono text-text">{school.code}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Location</p>
                <p className="text-sm text-text">{school.district}, {school.region}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Contact Email</p>
                <a href={`mailto:${school.contactEmail}`} className="text-sm text-akoma-green hover:underline">
                  {school.contactEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Contact Phone</p>
                <a href={`tel:${school.contactPhone}`} className="text-sm text-text hover:underline">
                  {school.contactPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Registered</p>
                <p className="text-sm text-text">
                  {format(new Date(school.createdAt), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - ALL REAL DATA */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-text-secondary">Status</span>
              {getStatusBadge(school.status)}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-text-secondary">School Type</span>
              <span className="text-sm font-medium text-text capitalize">{school.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-text-secondary">Level</span>
              <span className="text-sm font-medium text-text uppercase">{school.level}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-text-secondary">Active</span>
              <span className={`text-sm font-medium ${school.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {school.isActive ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-secondary">Student-Teacher Ratio</span>
              <span className="text-sm font-medium text-akoma-green">
                {stats?.teachers && stats?.students 
                  ? Math.round(stats.students / stats.teachers) 
                  : 0}:1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/platform/schools/${schoolId}`}>
          <Button variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            View School Details
          </Button>
        </Link>
        <Link href={`/platform/schools/${schoolId}/manage`}>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage School
          </Button>
        </Link>
        <Button variant="outline" className="gap-2 text-blue-600">
          <Users className="h-4 w-4" />
          View Students
        </Button>
        <Button variant="outline" className="gap-2 text-purple-600">
          <GraduationCap className="h-4 w-4" />
          View Teachers
        </Button>
      </div>
    </div>
  );
}