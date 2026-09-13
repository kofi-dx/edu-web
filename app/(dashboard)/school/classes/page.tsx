/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getClasses, deleteClass } from '@/lib/services/schoolAdminService';

interface Class {
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
  };
  school?: {
    id: string;
    name: string;
  };
}

interface ClassStats {
  total: number;
  active: number;
  inactive: number;
  byLevel: Record<string, number>;
  totalStudents: number;
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

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<ClassStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byLevel: {},
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchClasses();
  }, [currentPage, filterLevel, filterStatus]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filterLevel !== 'all') params.level = filterLevel;
      if (filterStatus !== 'all') params.status = filterStatus;

      const data = await getClasses(params);
      
      let list = data?.classes || [];
      const total = data?.total || 0;
      const totalPages = data?.totalPages || 1;
      
      // Client-side search
      if (searchTerm && list.length > 0) {
        const search = searchTerm.toLowerCase();
        list = list.filter((c: Class) =>
          c.name?.toLowerCase().includes(search) ||
          c.code?.toLowerCase().includes(search) ||
          c.teacher?.firstName?.toLowerCase().includes(search) ||
          c.teacher?.lastName?.toLowerCase().includes(search)
        );
      }
      
      setClasses(list);
      setTotalPages(totalPages || Math.ceil(total / itemsPerPage) || 1);
      
      // Calculate stats
      const all = list;
      const byLevel: Record<string, number> = {};
      all.forEach((c: Class) => {
        byLevel[c.level] = (byLevel[c.level] || 0) + 1;
      });
      
      setStats({
        total: total || list.length,
        active: all.filter((c: Class) => c.isActive).length,
        inactive: all.filter((c: Class) => !c.isActive).length,
        byLevel,
        totalStudents: all.reduce((sum: number, c: Class) => sum + (c.studentCount || 0), 0)
      });
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    
    setActionLoading(true);
    try {
      await deleteClass(selectedClass.id);
      toast.success('Class removed successfully');
      setShowDeleteModal(false);
      setSelectedClass(null);
      await fetchClasses();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove class');
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

  const getLevelBadge = (level: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      basic_1: { color: 'bg-green-100 text-green-700', label: 'Basic 1' },
      basic_2: { color: 'bg-green-200 text-green-800', label: 'Basic 2' },
      basic_3: { color: 'bg-green-300 text-green-900', label: 'Basic 3' },
      basic_4: { color: 'bg-blue-100 text-blue-700', label: 'Basic 4' },
      basic_5: { color: 'bg-blue-200 text-blue-800', label: 'Basic 5' },
      basic_6: { color: 'bg-blue-300 text-blue-900', label: 'Basic 6' },
      jhs_1: { color: 'bg-purple-100 text-purple-700', label: 'JHS 1' },
      jhs_2: { color: 'bg-purple-200 text-purple-800', label: 'JHS 2' },
      jhs_3: { color: 'bg-purple-300 text-purple-900', label: 'JHS 3' },
      shs_1: { color: 'bg-indigo-100 text-indigo-700', label: 'SHS 1' },
      shs_2: { color: 'bg-indigo-200 text-indigo-800', label: 'SHS 2' },
      shs_3: { color: 'bg-indigo-300 text-indigo-900', label: 'SHS 3' },
    };
    const config = configs[level] || { color: 'bg-gray-100 text-gray-700', label: level };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Class Management</h1>
          <p className="text-text-secondary">
            Manage all classes in your school
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClasses}
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
          <Link href="/school/classes/add">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Plus className="h-4 w-4" />
              Create Class
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
          <p className="text-sm text-text-secondary">Students</p>
          <p className="text-2xl font-bold text-akoma-green">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Levels</p>
          <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.byLevel).length}</p>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byLevel).map(([level, count]) => (
            <div key={level} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <span className="text-sm text-text-secondary">{levelLabels[level] || level}:</span>
              <span className="text-sm font-bold text-akoma-green">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by class name, code, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Levels</option>
              <option value="basic_1">Basic 1</option>
              <option value="basic_2">Basic 2</option>
              <option value="basic_3">Basic 3</option>
              <option value="basic_4">Basic 4</option>
              <option value="basic_5">Basic 5</option>
              <option value="basic_6">Basic 6</option>
              <option value="jhs_1">JHS 1</option>
              <option value="jhs_2">JHS 2</option>
              <option value="jhs_3">JHS 3</option>
              <option value="shs_1">SHS 1</option>
              <option value="shs_2">SHS 2</option>
              <option value="shs_3">SHS 3</option>
            </select>
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

      {/* Classes Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Class
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Code
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Level
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Teacher
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Students
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
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No classes found</p>
                    <Link href="/school/classes/add">
                      <Button variant="outline" className="mt-4">
                        Create your first class
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <School className="h-5 w-5 text-akoma-green" />
                        </div>
                        <div>
                          <p className="font-medium text-text">{cls.name}</p>
                          <p className="text-xs text-text-secondary">
                            Room {cls.roomNumber || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {cls.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {getLevelBadge(cls.level)}
                    </td>
                    <td className="px-6 py-4">
                      {cls.teacher ? (
                        <div>
                          <p className="text-sm text-text">
                            {cls.teacher.firstName} {cls.teacher.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">Teacher</p>
                        </div>
                      ) : (
                        <span className="text-sm text-text-secondary">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-text-secondary" />
                        <span className="text-sm font-medium text-text">
                          {cls.studentCount || 0} / {cls.capacity || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(cls.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/school/classes/${cls.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/school/classes/${cls.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedClass(cls);
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
              {Math.min(currentPage * itemsPerPage, classes.length)} of {classes.length} classes
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
      {showDeleteModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Class</h3>
                <p className="text-sm text-text-secondary">
                  Remove {selectedClass.name}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this class? This action cannot be undone.
              </p>
              {selectedClass.studentCount > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This class has {selectedClass.studentCount} student(s). 
                    Please reassign them before removing.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedClass(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading || selectedClass.studentCount > 0}
              >
                {actionLoading ? 'Removing...' : 'Remove Class'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}