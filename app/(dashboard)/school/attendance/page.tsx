/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  RefreshCw,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  QrCode,
  HelpCircle,
  Settings,
  Briefcase,
  BarChart,
  User,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getMySchool, getTodayAttendance, getClasses } from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

interface AttendanceRecord {
  id: string;
  status: 'present' | 'late' | 'absent';
  scanType: 'arrival' | 'departure' | 'entry' | 'exit';
  scanTime: string;
  method: 'qr' | 'nfc' | 'manual' | 'face' | 'fingerprint';
  student?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class?: {
      id: string;
      name: string;
    };
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

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

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendanceRate: 0
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get school ID
      const schoolData = await getMySchool();
      const schoolId = schoolData?.id;

      if (!schoolId) {
        toast.error('School not found');
        setLoading(false);
        return;
      }

      // Fetch today's attendance
      const attendanceData = await getTodayAttendance(schoolId);
      if (attendanceData) {
        const list = Array.isArray(attendanceData) ? attendanceData : [];
        setRecords(list);
        setTotalPages(Math.ceil(list.length / itemsPerPage) || 1);
        
        // Calculate stats
        const present = list.filter((r: AttendanceRecord) => r.status === 'present').length;
        const late = list.filter((r: AttendanceRecord) => r.status === 'late').length;
        const absent = list.filter((r: AttendanceRecord) => r.status === 'absent').length;
        const total = list.length;
        
        setStats({
          total,
          present,
          late,
          absent,
          attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0
        });
      }

      // Fetch classes
      const classesData = await getClasses();
      if (classesData) {
        setClasses(classesData.classes || []);
      }

    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      present: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'Present'
      },
      late: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Late'
      },
      absent: {
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Absent'
      },
    };
    const config = configs[status] || configs.present;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      qr: { color: 'bg-blue-100 text-blue-700', label: 'QR Code' },
      nfc: { color: 'bg-purple-100 text-purple-700', label: 'NFC' },
      manual: { color: 'bg-gray-100 text-gray-700', label: 'Manual' },
      face: { color: 'bg-green-100 text-green-700', label: 'Face' },
      fingerprint: { color: 'bg-orange-100 text-orange-700', label: 'Fingerprint' },
    };
    const config = configs[method] || configs.manual;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredRecords = records.filter(record => {
    if (selectedClass === 'all') return true;
    if (record.student?.class?.id) {
      return record.student.class.id === selectedClass;
    }
    return false;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Attendance Management</h1>
          <p className="text-text-secondary">
            View and manage attendance for your school
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/school/attendance/setup">
            <Button variant="outline" size="sm" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Setup Guide
            </Button>
          </Link>
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
          >
            <Download className="h-4 w-4" />
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
          <Link href="/school/attendance/devices">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <QrCode className="h-4 w-4" />
              Devices
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Setup Alert */}
      {records.length === 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">No attendance records yet</p>
              <p className="text-sm text-blue-700">
                Get started by setting up your attendance system. 
                <Link href="/school/attendance/setup" className="text-blue-800 font-medium underline ml-1 hover:text-blue-900">
                  View Setup Guide →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Records</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Present</p>
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Late</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Attendance Rate</p>
          <p className="text-2xl font-bold text-akoma-green">{stats.attendanceRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-1.5">
              Filter by Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.level})
                </option>
              ))}
            </select>
          </div>
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
              variant="outline"
              className="gap-2"
              onClick={() => {
                toast.info('Filters applied');
              }}
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Student / Staff
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Time
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Method
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No attendance records found</p>
                    <p className="text-xs text-text-secondary">No scans recorded for today</p>
                    <Link href="/school/attendance/setup">
                      <Button variant="outline" className="mt-4 gap-2">
                        <Settings className="h-4 w-4" />
                        Set up attendance system
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-akoma-green">
                            {record.student ? 
                              `${record.student.user.firstName?.[0]}${record.student.user.lastName?.[0] || ''}` :
                              record.staff ? 
                              `${record.staff.firstName?.[0]}${record.staff.lastName?.[0] || ''}` :
                              '?'
                            }
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {record.student ? 
                              `${record.student.user.firstName} ${record.student.user.lastName}` :
                              record.staff ? 
                              `${record.staff.firstName} ${record.staff.lastName}` :
                              'Unknown'
                            }
                          </p>
                          {record.student?.class && (
                            <p className="text-xs text-text-secondary">
                              {record.student.class.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm text-text">
                          {format(new Date(record.scanTime), 'h:mm a')}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDistanceToNow(new Date(record.scanTime), { addSuffix: true })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(record.method)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary capitalize">
                        {record.scanType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={record.student ? `/school/students/${record.student.id}` : '#'}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - Updated with all 6 navigation links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href="/school/attendance/devices"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center">
            <QrCode className="h-5 w-5 text-akoma-green" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Devices</p>
            <p className="text-xs text-text-secondary">Manage scanners</p>
          </div>
        </Link>

        <Link
          href="/school/attendance/student-ids"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center">
            <User className="h-5 w-5 text-akoma-green" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Student IDs</p>
            <p className="text-xs text-text-secondary">Generate QR codes</p>
          </div>
        </Link>

        <Link
          href="/school/attendance/staff-ids"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-akoma-green" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Staff IDs</p>
            <p className="text-xs text-text-secondary">Generate QR codes</p>
          </div>
        </Link>

        <Link
          href="/school/attendance/reports"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center">
            <BarChart className="h-5 w-5 text-akoma-green" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Reports</p>
            <p className="text-xs text-text-secondary">View analytics</p>
          </div>
        </Link>

        <Link
          href="/school/attendance/setup"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Setup Guide</p>
            <p className="text-xs text-text-secondary">How to set up</p>
          </div>
        </Link>

        <Link
          href="/school/attendance/export"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-akoma-green/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-akoma-green" />
          </div>
          <div>
            <p className="font-medium text-text text-sm">Export</p>
            <p className="text-xs text-text-secondary">PDF & Excel</p>
          </div>
        </Link>
      </div>
    </div>
  );
}