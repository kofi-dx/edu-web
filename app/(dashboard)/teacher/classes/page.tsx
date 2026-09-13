/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Search,
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// ✅ Use getMyTeacherClasses instead of getTeacherClasses
import { getMyTeacherClasses } from '@/lib/services/schoolAdminService';

interface Class {
  id: string;
  name: string;
  code: string;
  level: string;
  studentCount: number;
  capacity: number;
  roomNumber: string;
  isActive: boolean;
}

const levelLabels: Record<string, string> = {
  basic_1: 'Basic 1',
  basic_2: 'Basic 2',
  basic_3: 'Basic 3',
  basic_4: 'Basic 4',
  basic_5: 'Basic 5',
  basic_6: 'Basic 6',
  jhs_1: 'JHS 1',
  jhs_2: 'JHS 2',
  jhs_3: 'JHS 3',
  shs_1: 'SHS 1',
  shs_2: 'SHS 2',
  shs_3: 'SHS 3'
};

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // ✅ Use getMyTeacherClasses (no argument needed)
      const data = await getMyTeacherClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const search = searchTerm.toLowerCase();
    return cls.name.toLowerCase().includes(search) ||
           cls.code.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Classes</h1>
          <p className="text-text-secondary">
            Classes you are assigned to teach
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchClasses}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Classes</p>
          <p className="text-2xl font-bold text-text">{classes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Students</p>
          <p className="text-2xl font-bold text-text">
            {classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active Classes</p>
          <p className="text-2xl font-bold text-green-600">
            {classes.filter(c => c.isActive).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No classes found</p>
          <p className="text-sm text-text-secondary">You haven&apos;t been assigned to any classes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => (
            <Link key={cls.id} href={`/teacher/classes/${cls.id}`}>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{cls.name}</h3>
                    <p className="text-sm text-text-secondary">{cls.code}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {levelLabels[cls.level] || cls.level}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-text-secondary" />
                    <span>{cls.studentCount || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-text-secondary">Room:</span>
                    <span>{cls.roomNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {cls.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">{cls.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <span className="text-sm text-akoma-green flex items-center gap-1">
                    View
                    <ChevronRight className="h-4 w-4" />
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