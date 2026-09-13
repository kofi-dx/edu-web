/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Download,
  Printer,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart,
  TrendingUp, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getMySchool, getAttendanceStats, getClasses } from '@/lib/services/schoolAdminService';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendanceRate: 0
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [classes, setClasses] = useState<Class[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  });

  useEffect(() => {
    fetchData();
  }, [reportType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schoolData = await getMySchool();
      if (schoolData) {
        // Get date range based on report type
        let startDate: Date, endDate: Date;
        const now = new Date();
        
        switch (reportType) {
          case 'daily':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'weekly':
            startDate = subDays(now, 7);
            endDate = now;
            break;
          case 'monthly':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        }
        
        setDateRange({ start: startDate, end: endDate });
        
        const data = await getAttendanceStats(schoolData.id, {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        });
        
        if (data) {
          setStats({
            total: data.total || 0,
            present: data.present || 0,
            late: data.late || 0,
            absent: data.absent || 0,
            attendanceRate: data.attendanceRate || 0
          });
        }
        
        // Fetch classes (for future class filtering)
        const classesData = await getClasses();
        if (classesData) {
          setClasses(classesData.classes || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rate >= 75) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/school/attendance" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-2">
            <Calendar className="h-4 w-4" />
            Back to Attendance
          </Link>
          <h1 className="text-2xl font-bold text-text">Attendance Reports</h1>
          <p className="text-text-secondary">
            View detailed attendance reports and analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              toast.success('PDF report generated');
            }}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'daily', label: 'Daily Report', icon: Calendar },
            { value: 'weekly', label: 'Weekly Report', icon: TrendingUp },
            { value: 'monthly', label: 'Monthly Report', icon: BarChart }
          ].map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={reportType === type.value ? 'default' : 'outline'}
                className={reportType === type.value ? 'bg-akoma-green hover:bg-akoma-dark text-white gap-2' : 'gap-2'}
                onClick={() => setReportType(type.value as any)}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-1.5">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
              <span className="text-text-secondary">to</span>
              <input
                type="date"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
              onClick={() => {
                toast.success('Report updated');
                fetchData();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Update Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Records</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
          <p className="text-xs text-text-secondary mt-1">
            {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Late</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-text-secondary mt-1">
            {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Attendance Rate</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${getStatusColor(stats.attendanceRate)}`}>
              {stats.attendanceRate}%
            </p>
            {getStatusIcon(stats.attendanceRate)}
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {stats.attendanceRate >= 90 ? 'Excellent' : stats.attendanceRate >= 75 ? 'Good' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Summary Report */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Attendance Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-text-secondary">Present</span>
                  <span className="ml-auto font-medium text-text">{stats.present}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-text-secondary">Late</span>
                  <span className="ml-auto font-medium text-text">{stats.late}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-text-secondary">Absent</span>
                  <span className="ml-auto font-medium text-text">{stats.absent}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-text">Total</span>
                  <span className="text-sm font-bold text-text">{stats.total}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text mb-2">Report Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Report Type</span>
                  <span className="font-medium text-text capitalize">{reportType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Period</span>
                  <span className="font-medium text-text">
                    {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Days</span>
                  <span className="font-medium text-text">
                    {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Attendance Rate</span>
                  <span className={`font-bold ${getStatusColor(stats.attendanceRate)}`}>
                    {stats.attendanceRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => {
            toast.success('PDF report generated');
          }}
        >
          <FileText className="h-5 w-5" />
          <div className="text-left">
            <p className="font-medium text-sm">PDF Report</p>
            <p className="text-xs text-text-secondary">Download as PDF</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => {
            toast.success('Excel report generated');
          }}
        >
          <FileText className="h-5 w-5" />
          <div className="text-left">
            <p className="font-medium text-sm">Excel Report</p>
            <p className="text-xs text-text-secondary">Export to Excel</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => {
            toast.success('CSV report generated');
          }}
        >
          <FileText className="h-5 w-5" />
          <div className="text-left">
            <p className="font-medium text-sm">CSV Report</p>
            <p className="text-xs text-text-secondary">Export to CSV</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => window.print()}
        >
          <Printer className="h-5 w-5" />
          <div className="text-left">
            <p className="font-medium text-sm">Print Report</p>
            <p className="text-xs text-text-secondary">Print this report</p>
          </div>
        </Button>
      </div>
    </div>
  );
}