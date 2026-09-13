/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Building2,
  UserPlus,
  Edit,
  Trash2,
  RefreshCw,
  Printer,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudentById, deleteStudent } from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

interface Student {
  id: string;
  admissionNumber: string;
  enrollmentStatus: 'active' | 'pending' | 'transferred' | 'graduated' | 'withdrawn';
  isActive: boolean;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  enrolledAt: string;
  class?: {
    id: string;
    name: string;
    level: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await getStudentById(studentId);
      if (data) {
        setStudent(data);
      }
    } catch (error) {
      console.error('Failed to fetch student:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteStudent(studentId);
      toast.success('Student removed successfully');
      router.push('/school/students');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove student');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      active: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Active'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-4 w-4" />,
        label: 'Pending'
      },
      transferred: {
        color: 'bg-blue-100 text-blue-700',
        icon: <UserPlus className="h-4 w-4" />,
        label: 'Transferred'
      },
      graduated: {
        color: 'bg-purple-100 text-purple-700',
        icon: <GraduationCap className="h-4 w-4" />,
        label: 'Graduated'
      },
      withdrawn: {
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Withdrawn'
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-text">Student not found</h2>
        <Link href="/school/students">
          <Button className="mt-4">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/school/students" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudent}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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
          <Link href={`/school/students/${studentId}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-akoma-green">
              {student.user.firstName?.[0]}{student.user.lastName?.[0] || ''}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text">
                {student.user.firstName} {student.user.lastName}
              </h1>
              {getStatusBadge(student.enrollmentStatus)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {student.user.email}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {student.user.phone}
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {student.class ? student.class.name : 'Not Assigned'}
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Admission: {student.admissionNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Full Name</p>
              <p className="text-text">{student.user.firstName} {student.user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Admission Number</p>
              <p className="text-text font-mono">{student.admissionNumber}</p>
            </div>
            {student.dateOfBirth && (
              <div>
                <p className="text-sm text-text-secondary">Date of Birth</p>
                <p className="text-text">{format(new Date(student.dateOfBirth), 'PPP')}</p>
              </div>
            )}
            {student.gender && (
              <div>
                <p className="text-sm text-text-secondary">Gender</p>
                <p className="text-text capitalize">{student.gender}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-text-secondary">Enrolled</p>
              <p className="text-text">{format(new Date(student.enrolledAt), 'PPP')}</p>
              <p className="text-xs text-text-secondary">
                {formatDistanceToNow(new Date(student.enrolledAt), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Class</p>
              <p className="text-text">{student.class ? student.class.name : 'Not Assigned'}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guardian Information */}
          {(student.guardianName || student.guardianPhone || student.guardianEmail) && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-akoma-green" />
                Guardian
              </h3>
              <div className="space-y-2 text-sm">
                {student.guardianName && (
                  <div>
                    <p className="text-text-secondary">Name</p>
                    <p className="text-text">{student.guardianName}</p>
                  </div>
                )}
                {student.guardianPhone && (
                  <div>
                    <p className="text-text-secondary">Phone</p>
                    <p className="text-text">{student.guardianPhone}</p>
                  </div>
                )}
                {student.guardianEmail && (
                  <div>
                    <p className="text-text-secondary">Email</p>
                    <p className="text-text">{student.guardianEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(student.emergencyContact || student.medicalNotes) && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-akoma-green" />
                Additional Information
              </h3>
              <div className="space-y-2 text-sm">
                {student.emergencyContact && (
                  <div>
                    <p className="text-text-secondary">Emergency Contact</p>
                    <p className="text-text">{student.emergencyContact}</p>
                  </div>
                )}
                {student.medicalNotes && (
                  <div>
                    <p className="text-text-secondary">Medical Notes</p>
                    <p className="text-text">{student.medicalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Student</h3>
                <p className="text-sm text-text-secondary">
                  Remove {student.user.firstName} {student.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this student? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  This will permanently delete the student&apos;s record and all associated data.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? 'Removing...' : 'Remove Student'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}