/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Users, Briefcase } from 'lucide-react';
import { getSchoolTeachers } from '@/lib/services/adminService';
import { toast } from 'sonner';

interface TeacherTabProps {
  schoolId: string;
}

export function TeacherTab({ schoolId }: TeacherTabProps) {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSchoolTeachers(schoolId);
      if (data) {
        setTeachers(data.teachers || []);
        setTotal(data.total || 0);
        setActiveCount(data.stats?.active || 0);
      }
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
      toast.error('Failed to load teacher data');
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Teachers</p>
          </div>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-green-500" />
            <p className="text-sm text-text-secondary">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <p className="text-sm text-text-secondary">Inactive</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{total - activeCount}</p>
        </div>
      </div>

      {/* Teacher List (Aggregated) */}
      {teachers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Teacher Overview</h3>
          <div className="space-y-3">
            {teachers.slice(0, 10).map((teacher) => (
              <div key={teacher.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-text">{teacher.name || 'Unknown'}</p>
                  <p className="text-xs text-text-secondary">
                    {teacher.employeeNumber || 'N/A'} • {teacher.qualifications || 'No qualifications'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
            {teachers.length > 10 && (
              <p className="text-xs text-text-secondary text-center pt-2">
                +{teachers.length - 10} more teachers
              </p>
            )}
          </div>
        </div>
      )}

      {teachers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No teachers found for this school</p>
        </div>
      )}
    </div>
  );
}