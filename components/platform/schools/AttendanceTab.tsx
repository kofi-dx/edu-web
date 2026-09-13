/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { Calendar, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { getSchoolAttendance } from '@/lib/services/adminService';
import { toast } from 'sonner';

interface AttendanceTabProps {
  schoolId: string;
}

interface AttendanceSummary {
  totalRecords: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
}

export function AttendanceTab({ schoolId }: AttendanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSchoolAttendance(schoolId);
      if (data) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Attendance Rate</p>
          </div>
          <p className="text-2xl font-bold text-akoma-green">{summary?.attendanceRate || 0}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <p className="text-sm text-text-secondary">Present</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{summary?.present || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-text-secondary">Late</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{summary?.late || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="h-4 w-4 text-red-500" />
            <p className="text-sm text-text-secondary">Absent</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary?.absent || 0}</p>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4">Attendance Summary</h3>
        
        <div className="space-y-4">
          {/* Attendance Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Overall Attendance</span>
              <span className="font-medium text-text">{summary?.attendanceRate || 0}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-akoma-green rounded-full transition-all duration-500"
                style={{ width: `${summary?.attendanceRate || 0}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summary?.present || 0}</p>
              <p className="text-xs text-text-secondary">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary?.late || 0}</p>
              <p className="text-xs text-text-secondary">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{summary?.absent || 0}</p>
              <p className="text-xs text-text-secondary">Absent</p>
            </div>
          </div>

          <div className="text-center text-xs text-text-secondary pt-4 border-t border-gray-100">
            Total Records: {summary?.totalRecords || 0}
          </div>
        </div>
      </div>
    </div>
  );
}