/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getMyAttendance } from '@/lib/services/schoolAdminService';  // ✅ Changed

export default function StudentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const result = await getMyAttendance();  // ✅ No studentId
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || { total: 0, present: 0, absent: 0, late: 0, attendanceRate: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Attendance</h1>
        <p className="text-text-secondary">Track your attendance record</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Present</p>
              <p className="text-xl font-bold text-text">{summary.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Absent</p>
              <p className="text-xl font-bold text-text">{summary.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Late</p>
              <p className="text-xl font-bold text-text">{summary.late}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Rate</p>
              <p className="text-xl font-bold text-text">{summary.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-text">Recent Records</h2>
        </div>

        {data?.attendance && data.attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Arrived</th>
                </tr>
              </thead>
              <tbody>
                {data.attendance.map((record: any) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm text-text">{record.date}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{record.arrivedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarCheck className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No attendance records yet</p>
          </div>
        )}
      </div>
    </div>
  );
}