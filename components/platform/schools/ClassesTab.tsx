/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Users, Building2 } from 'lucide-react';
import { getSchoolClasses } from '@/lib/services/adminService';
import { toast } from 'sonner';

interface ClassesTabProps {
  schoolId: string;
}

export function ClassesTab({ schoolId }: ClassesTabProps) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSchoolClasses(schoolId);
      if (data) {
        setClasses(data.classes || []);
        setTotal(data.total || 0);
        setTotalStudents(data.stats?.totalStudents || 0);
      }
    } catch (error) {
      console.error('Failed to fetch class data:', error);
      toast.error('Failed to load class data');
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
            <BookOpen className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Classes</p>
          </div>
          <p className="text-2xl font-bold text-text">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Total Students</p>
          </div>
          <p className="text-2xl font-bold text-text">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Avg. Per Class</p>
          </div>
          <p className="text-2xl font-bold text-text">
            {total > 0 ? Math.round(totalStudents / total) : 0}
          </p>
        </div>
      </div>

      {/* Class List */}
      {classes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Class Overview</h3>
          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-text">{cls.name}</p>
                  <p className="text-xs text-text-secondary">
                    {cls.code || 'No code'} • {cls.level || 'N/A'} • {cls.teacher || 'No teacher assigned'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text">
                    {cls.studentCount || 0} / {cls.capacity || 0} students
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cls.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {classes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No classes found for this school</p>
        </div>
      )}
    </div>
  );
}