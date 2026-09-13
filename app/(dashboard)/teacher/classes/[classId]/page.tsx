/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  User,
  BookOpen,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getClassById } from '@/lib/services/schoolAdminService';

interface Student {
  id: string;
  admissionNumber: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface ClassDetail {
  id: string;
  name: string;
  code: string;
  level: string;
  academicYear: string;
  roomNumber: string;
  capacity: number;
  studentCount: number;
  isActive: boolean;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  students?: Student[];
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

export default function TeacherClassDetailPage() {
  const params = useParams();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const classId = params.classId as string;

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    setLoading(true);
    try {
      const data = await getClassById(classId);
      setClassData(data);
    } catch (error) {
      console.error('Failed to fetch class:', error);
      toast.error('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Class not found</p>
        <Link href="/teacher/classes">
          <Button variant="outline" className="mt-4">Back to Classes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/teacher/classes">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text">{classData.name}</h1>
          <p className="text-text-secondary">{classData.code}</p>
        </div>
        <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
          <QrCode className="h-4 w-4" />
          Take Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Students</p>
          <p className="text-2xl font-bold text-text">{classData.studentCount || 0}</p>
          <p className="text-xs text-text-secondary">Capacity: {classData.capacity}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Level</p>
          <p className="text-2xl font-bold text-akoma-green">{levelLabels[classData.level] || classData.level}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Room</p>
          <p className="text-2xl font-bold text-blue-600">{classData.roomNumber || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Status</p>
          <div className="mt-1">
            {classData.isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="h-3.5 w-3.5" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <XCircle className="h-3.5 w-3.5" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Class Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Class Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Name</p>
                <p className="text-sm font-medium text-text">{classData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Academic Year</p>
                <p className="text-sm font-medium text-text">{classData.academicYear || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Teacher</p>
                <p className="text-sm font-medium text-text">
                  {classData.teacher ? `${classData.teacher.firstName} ${classData.teacher.lastName}` : 'Not Assigned'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Room</p>
                <p className="text-sm font-medium text-text">{classData.roomNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Roster */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Student Roster
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {classData.studentCount || 0} students enrolled
          </p>
        </div>
        <div className="overflow-x-auto">
          {classData.students && classData.students.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Admission Number
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {classData.students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {student.admissionNumber || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-text">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{student.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary">{student.user.phone || 'N/A'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No students enrolled in this class</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}