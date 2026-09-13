/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTeachers, deleteTeacher, type Teacher as TeacherType } from '@/lib/services/schoolAdminService';

// Use the exported Teacher type from the service
type Teacher = TeacherType;

interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
  fullTime: number;
  partTime: number;
  contract: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    active: 0,
    inactive: 0,
    fullTime: 0,
    partTime: 0,
    contract: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, filterStatus]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filterStatus !== 'all') params.status = filterStatus;

      const data = await getTeachers(params);
      
      let list = data?.teachers || [];
      const total = data?.total || 0;
      const totalPages = data?.totalPages || 1;
      
      // Client-side search
      if (searchTerm && list.length > 0) {
        const search = searchTerm.toLowerCase();
        list = list.filter((t: Teacher) =>
          t.user?.firstName?.toLowerCase().includes(search) ||
          t.user?.lastName?.toLowerCase().includes(search) ||
          t.user?.email?.toLowerCase().includes(search) ||
          t.employeeNumber?.toLowerCase().includes(search)
        );
      }
      
      setTeachers(list);
      setTotalPages(totalPages || Math.ceil(total / itemsPerPage) || 1);
      
      // Calculate stats
      const all = list;
      setStats({
        total: total || list.length,
        active: all.filter((t: Teacher) => t.isActive).length,
        inactive: all.filter((t: Teacher) => !t.isActive).length,
        fullTime: all.filter((t: Teacher) => t.employmentType === 'full_time').length,
        partTime: all.filter((t: Teacher) => t.employmentType === 'part_time').length,
        contract: all.filter((t: Teacher) => t.employmentType === 'contract').length,
      });
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    
    setActionLoading(true);
    try {
      await deleteTeacher(selectedTeacher.id);
      toast.success('Teacher removed successfully');
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      await fetchTeachers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove teacher');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3.5 w-3.5" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <XCircle className="h-3.5 w-3.5" />
        Inactive
      </span>
    );
  };

  const getEmploymentBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      full_time: { color: 'bg-blue-100 text-blue-700', label: 'Full Time' },
      part_time: { color: 'bg-purple-100 text-purple-700', label: 'Part Time' },
      contract: { color: 'bg-orange-100 text-orange-700', label: 'Contract' },
      volunteer: { color: 'bg-green-100 text-green-700', label: 'Volunteer' },
    };
    const config = configs[type] || configs.full_time;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };



  // Helper to safely display subjects
  const getSubjects = (teacher: Teacher) => {
    return teacher.subjects || [];
  };

  // Helper to display experience
  const getExperience = (teacher: Teacher) => {
    return teacher.experience || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Teacher Management</h1>
          <p className="text-text-secondary">
            Manage all teachers in your school
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTeachers}
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
          <Link href="/school/teachers/add">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
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
          <p className="text-sm text-text-secondary">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Full Time</p>
          <p className="text-2xl font-bold text-blue-600">{stats.fullTime}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Part Time</p>
          <p className="text-2xl font-bold text-purple-600">{stats.partTime}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or employee number..."
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
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Teacher
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Employee Number
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Employment
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Subjects
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No teachers found</p>
                    <Link href="/school/teachers/add">
                      <Button variant="outline" className="mt-4">
                        Add your first teacher
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-akoma-green">
                            {teacher.user.firstName?.[0]}{teacher.user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {teacher.user.firstName} {teacher.user.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Mail className="h-3 w-3" />
                            {teacher.user.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Phone className="h-3 w-3" />
                            {teacher.user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {teacher.employeeNumber}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getEmploymentBadge(teacher.employmentType)}
                        <p className="text-xs text-text-secondary">
                          {getExperience(teacher)} years exp.
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getSubjects(teacher).length > 0 ? (
                          getSubjects(teacher).slice(0, 3).map((subject) => (
                            <span key={subject} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-text-secondary">No subjects</span>
                        )}
                        {getSubjects(teacher).length > 3 && (
                          <span className="text-xs text-text-secondary">
                            +{getSubjects(teacher).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(teacher.isActive)}
                      {teacher.classes && teacher.classes.length > 0 && (
                        <p className="text-xs text-text-secondary mt-1">
                          {teacher.classes.length} classes
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/school/teachers/${teacher.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/school/teachers/${teacher.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedTeacher(teacher);
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
              {Math.min(currentPage * itemsPerPage, teachers.length)} of {teachers.length} teachers
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
      {showDeleteModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Teacher</h3>
                <p className="text-sm text-text-secondary">
                  Remove {selectedTeacher.user.firstName} {selectedTeacher.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this teacher? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  This will permanently delete the teacher&apos;s record and all associated data.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
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
                {actionLoading ? 'Removing...' : 'Remove Teacher'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}