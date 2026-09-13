/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
// app/(dashboard)/platform/schools/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Building2, 
  Users, 
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllSchoolsSummary } from '@/lib/services/adminService';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private' | 'international';
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  region: string;
  district: string;
  contactEmail: string;
  contactPhone: string;
  studentCount?: number;
  teacherCount?: number;
  isActive: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export default function SchoolsPage() {
  useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchSchools();
  }, [currentPage, filterType, filterStatus, searchTerm]);


const fetchSchools = async () => {
  setLoading(true);
  try {
    const response = await getAllSchoolsSummary();
    
    if (response) {
      // response.schools is already filtered/summarized
      let list = response.schools || [];
      
      // Apply client-side filters
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        list = list.filter((s: any) =>
          s.name?.toLowerCase().includes(term) ||
          s.code?.toLowerCase().includes(term)
        );
      }
      if (filterType !== 'all') {
        list = list.filter((s: any) => s.type === filterType);
      }
      if (filterStatus !== 'all') {
        list = list.filter((s: any) => s.status === filterStatus);
      }
      
      // Paginate client-side
      const total = list.length;
      const start = (currentPage - 1) * itemsPerPage;
      const paginated = list.slice(start, start + itemsPerPage);
      
      setSchools(paginated);
      setTotalSchools(total);
      setTotalPages(Math.ceil(total / itemsPerPage) || 1);
    }
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    toast.error('Failed to load schools');
  } finally {
    setLoading(false);
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
      suspended: { 
        color: 'bg-red-100 text-red-700', 
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Suspended'
      },
      rejected: { 
        color: 'bg-gray-100 text-gray-700', 
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Rejected'
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      public: { color: 'bg-blue-100 text-blue-700', label: 'Public' },
      private: { color: 'bg-purple-100 text-purple-700', label: 'Private' },
      international: { color: 'bg-indigo-100 text-indigo-700', label: 'International' },
    };
    const config = configs[type] || configs.public;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Schools</h1>
          <p className="text-text-secondary text-sm">Manage all schools on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search schools by name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="all">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="international">International</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Schools</p>
          <p className="text-2xl font-bold text-text">{totalSchools}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {schools.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {schools.filter(s => s.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {schools.filter(s => s.status === 'suspended').length}
          </p>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  School
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Code
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Stats
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No schools found</p>
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text">{school.name}</p>
                        <p className="text-xs text-text-secondary">{school.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {school.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(school.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-text">{school.district}</p>
                        <p className="text-xs text-text-secondary">{school.region}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(school.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-text-secondary" />
                          {school.studentCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-text-secondary" />
                          {school.teacherCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/platform/schools/${school.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/platform/schools/${school.id}/manage`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </Link>
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
              {Math.min(currentPage * itemsPerPage, totalSchools)} of {totalSchools} schools
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
    </div>
  );
}