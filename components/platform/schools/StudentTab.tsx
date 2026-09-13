/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, UserCheck, UserX } from 'lucide-react';
import { getSchoolStudents } from '@/lib/services/adminService';
import { toast } from 'sonner';

interface StudentTabProps {
  schoolId: string;
}

interface StudentStats {
  total: number;
  byStatus: {
    active: number;
    pending: number;
    graduated: number;
    withdrawn: number;
  };
}

export function StudentTab({ schoolId }: StudentTabProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSchoolStudents(schoolId);
      if (data) {
        setStats(data.stats);
        setStudents(data.students || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      toast.error('Failed to load student data');
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
            <Users className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Students</p>
          </div>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <p className="text-sm text-text-secondary">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.byStatus.active || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-text-secondary">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats?.byStatus.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserX className="h-4 w-4 text-red-500" />
            <p className="text-sm text-text-secondary">Withdrawn</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats?.byStatus.withdrawn || 0}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4">Enrollment Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-text-secondary">Active</span>
            <span className="text-sm font-medium text-green-600">{stats?.byStatus.active || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-text-secondary">Pending Approval</span>
            <span className="text-sm font-medium text-yellow-600">{stats?.byStatus.pending || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-text-secondary">Graduated</span>
            <span className="text-sm font-medium text-blue-600">{stats?.byStatus.graduated || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-text-secondary">Withdrawn</span>
            <span className="text-sm font-medium text-red-600">{stats?.byStatus.withdrawn || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Students (Aggregated) */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Recent Enrollments</h3>
          <div className="space-y-2">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-text">
                    {student.admissionNumber || 'N/A'}
                  </p>
                  <p className="text-xs text-text-secondary">Class: {student.class || 'Not Assigned'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  student.enrollmentStatus === 'active' ? 'bg-green-100 text-green-700' :
                  student.enrollmentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {student.enrollmentStatus || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}