/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPendingStudents, approveStudent } from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

interface PendingStudent {
  id: string;
  admissionNumber: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    schoolId: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function PendingStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    setLoading(true);
    try {
      // Get school ID from user context or storage
      const schoolId = user?.schoolId || '';
      const data = await getPendingStudents(schoolId);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to fetch pending students:', error);
      toast.error('Failed to load pending students');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      await approveStudent(studentId);
      toast.success('Student approved successfully');
      await fetchPendingStudents();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to approve student');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading pending students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/school/students" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Pending Approvals</h1>
          <p className="text-text-secondary">Review and approve student registrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-text-secondary">Pending:</span>
            <span className="text-lg font-bold text-yellow-600">{students.length}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingStudents}
            className="gap-2 ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending List */}
      {students.length > 0 ? (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">
                      {student.user.firstName} {student.user.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {student.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {student.user.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(student.createdAt), 'PPP')}
                      </span>
                      <span className="text-xs text-text-secondary">
                        ({formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })})
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Admission: <span className="font-mono">{student.admissionNumber}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => handleApprove(student.id)}
                    disabled={actionLoading === student.id}
                  >
                    {actionLoading === student.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Link href={`/school/students/${student.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <CheckCircle className="h-12 w-12 text-akoma-green mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text">No Pending Approvals</h3>
          <p className="text-text-secondary">All student registrations have been reviewed.</p>
        </div>
      )}
    </div>
  );
}