/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Download,
  RefreshCw,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudents, deleteStudent } from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

interface Student {
  id: string;
  admissionNumber: string;
  enrollmentStatus: 'active' | 'pending' | 'transferred' | 'graduated' | 'withdrawn';
  isActive: boolean;
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

interface StudentStats {
  total: number;
  active: number;
  pending: number;
  graduated: number;
  withdrawn: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    pending: 0,
    graduated: 0,
    withdrawn: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [currentPage, filterStatus]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filterStatus !== 'all') params.status = filterStatus;

      const data = await getStudents(params);
      
      // ✅ data has the correct shape: { students, total, page, totalPages }
      let list = data?.students || [];
      const total = data?.total || 0;
      const totalPages = data?.totalPages || 1;
      
      // Client-side search
      if (searchTerm && list.length > 0) {
        const search = searchTerm.toLowerCase();
        list = list.filter((s: Student) =>
          s.user?.firstName?.toLowerCase().includes(search) ||
          s.user?.lastName?.toLowerCase().includes(search) ||
          s.user?.email?.toLowerCase().includes(search) ||
          s.admissionNumber?.toLowerCase().includes(search)
        );
      }
      
      setStudents(list);
      setTotalPages(totalPages || Math.ceil(total / itemsPerPage) || 1);
      
      // Calculate stats from all data
      const all = list;
      setStats({
        total: total || list.length,
        active: all.filter((s: Student) => s.enrollmentStatus === 'active').length,
        pending: all.filter((s: Student) => s.enrollmentStatus === 'pending').length,
        graduated: all.filter((s: Student) => s.enrollmentStatus === 'graduated').length,
        withdrawn: all.filter((s: Student) => s.enrollmentStatus === 'withdrawn').length,
      });
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    setActionLoading(true);
    try {
      await deleteStudent(selectedStudent.id);
      toast.success('Student removed successfully');
      setShowDeleteModal(false);
      setSelectedStudent(null);
      await fetchStudents();
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
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'Active'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Pending'
      },
      transferred: {
        color: 'bg-blue-100 text-blue-700',
        icon: <UserCheck className="h-3.5 w-3.5" />,
        label: 'Transferred'
      },
      graduated: {
        color: 'bg-purple-100 text-purple-700',
        icon: <GraduationCap className="h-3.5 w-3.5" />,
        label: 'Graduated'
      },
      withdrawn: {
        color: 'bg-red-100 text-red-700',
        icon: <UserX className="h-3.5 w-3.5" />,
        label: 'Withdrawn'
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Student Management</h1>
          <p className="text-text-secondary">
            Manage all students in your school
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudents}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/school/students/add">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Graduated</p>
          <p className="text-2xl font-bold text-purple-600">{stats.graduated}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Withdrawn</p>
          <p className="text-2xl font-bold text-red-600">{stats.withdrawn}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Admission Number
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Class
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Enrolled
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No students found</p>
                    <Link href="/school/students/add">
                      <Button variant="outline" className="mt-4">
                        Add your first student
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-akoma-green">
                            {student.user.firstName?.[0]}{student.user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Mail className="h-3 w-3" />
                            {student.user.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Phone className="h-3 w-3" />
                            {student.user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {student.admissionNumber}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {student.class ? (
                        <div>
                          <p className="text-sm text-text">{student.class.name}</p>
                          <p className="text-xs text-text-secondary">{student.class.level}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-text-secondary">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.enrollmentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm text-text-secondary">
                          {format(new Date(student.enrolledAt), 'PPP')}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDistanceToNow(new Date(student.enrolledAt), { addSuffix: true })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/school/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/school/students/${student.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} students
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Student</h3>
                <p className="text-sm text-text-secondary">
                  Remove {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this student? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  This will permanently delete the student&apos;s record and all associated data.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
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