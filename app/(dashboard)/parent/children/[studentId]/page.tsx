/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  GraduationCap,
  School,
  Mail,
  Phone,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getChildOverview } from '@/lib/services/schoolAdminService';

export default function ChildOverviewPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, [studentId]);

  const fetchOverview = async () => {
    try {
      const result = await getChildOverview(studentId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch child:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load child details');
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Child not found</p>
        <Link href="/parent/children">
          <Button variant="outline" className="mt-4">Back to Children</Button>
        </Link>
      </div>
    );
  }

  const student = data.student;
  const user = student.user;
  const classData = student.class;

  return (
    <div className="space-y-6">
      <Link
        href="/parent/children"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Children
      </Link>

      {/* Header */}
      <div className="bg-linear-to-r from-akoma-green to-akoma-dark rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-white/80 text-sm font-mono">{student.admissionNumber}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href={`/parent/children/${studentId}/progress`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
          <BookOpen className="h-5 w-5 text-akoma-green" />
          <span className="text-xs font-medium text-text">Progress</span>
        </Link>
        <Link
          href={`/parent/children/${studentId}/attendance`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
          <CalendarCheck className="h-5 w-5 text-akoma-green" />
          <span className="text-xs font-medium text-text">Attendance</span>
        </Link>
        <Link
          href={`/parent/children/${studentId}/assessments`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
          <ClipboardList className="h-5 w-5 text-akoma-green" />
          <span className="text-xs font-medium text-text">Assessments</span>
        </Link>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-akoma-green" />
          Student Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text">{user?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Phone</p>
              <p className="text-sm text-text">{user?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Info */}
      {classData && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-akoma-green" />
            Class Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <GraduationCap className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Class</p>
                <p className="text-sm text-text">{classData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <School className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">School</p>
                <p className="text-sm text-text">{classData.school?.name || 'N/A'}</p>
              </div>
            </div>
            {classData.teacher && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                <UserCheck className="h-4 w-4 text-text-secondary" />
                <div>
                  <p className="text-xs text-text-secondary">Class Teacher</p>
                  <p className="text-sm text-text">
                    {classData.teacher.firstName} {classData.teacher.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}