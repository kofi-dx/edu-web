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
  Plus,
  Download,
  RefreshCw,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getParents, deleteParent } from '@/lib/services/schoolAdminService';

// ✅ Updated interface with both students and children
interface Parent {
  id: string;
  occupation: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  students?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class?: {
      name: string;
    };
  }[];
  children?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class?: {
      name: string;
    };
  }[];
}

interface ParentStats {
  total: number;
  verified: number;
  unverified: number;
  byRelationship: Record<string, number>;
}

// Define the student type for the children array
interface StudentChild {
  id: string;
  admissionNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
  class?: {
    name: string;
  };
}

const relationshipLabels: Record<string, string> = {
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
  other: 'Other'
};

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [stats, setStats] = useState<ParentStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    byRelationship: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchParents();
  }, [currentPage, filterVerified]);

const fetchParents = async () => {
  setLoading(true);
  try {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (filterVerified !== 'all') params.verified = filterVerified;

    const data = await getParents(params);
    
    // ✅ Add debug logging
    if (data?.parents?.length > 0) {
    }
      
      let list = data?.parents || [];
      const total = data?.total || 0;
      const totalPages = data?.totalPages || 1;
      
      // Client-side search
      if (searchTerm && list.length > 0) {
        const search = searchTerm.toLowerCase();
        list = list.filter((p: Parent) =>
          p.user?.firstName?.toLowerCase().includes(search) ||
          p.user?.lastName?.toLowerCase().includes(search) ||
          p.user?.email?.toLowerCase().includes(search) ||
          p.user?.phone?.toLowerCase().includes(search)
        );
      }
      
      setParents(list);
      setTotalPages(totalPages || Math.ceil(total / itemsPerPage) || 1);
      
      // Calculate stats
      const all = list;
      const byRelationship: Record<string, number> = {};
      all.forEach((p: Parent) => {
        byRelationship[p.relationship] = (byRelationship[p.relationship] || 0) + 1;
      });
      
      setStats({
        total: total || list.length,
        verified: all.filter((p: Parent) => p.isVerified).length,
        unverified: all.filter((p: Parent) => !p.isVerified).length,
        byRelationship
      });
    } catch (error) {
      console.error('Failed to fetch parents:', error);
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedParent) return;
    
    setActionLoading(true);
    try {
      await deleteParent(selectedParent.id);
      toast.success('Parent removed successfully');
      setShowDeleteModal(false);
      setSelectedParent(null);
      await fetchParents();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove parent');
    } finally {
      setActionLoading(false);
    }
  };

  const getVerifiedBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3.5 w-3.5" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <XCircle className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  const getRelationshipBadge = (relationship: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      father: { color: 'bg-blue-100 text-blue-700', label: 'Father' },
      mother: { color: 'bg-pink-100 text-pink-700', label: 'Mother' },
      guardian: { color: 'bg-purple-100 text-purple-700', label: 'Guardian' },
      other: { color: 'bg-gray-100 text-gray-700', label: 'Other' },
    };
    const config = configs[relationship] || configs.other;
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
          <p className="text-text-secondary">Loading parents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Parent Management</h1>
          <p className="text-text-secondary">
            Manage all parents and guardians in your school
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParents}
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
          <Link href="/school/parents/add">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Parent
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Verified</p>
          <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.unverified}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Relationships</p>
          <p className="text-2xl font-bold text-akoma-green">{Object.keys(stats.byRelationship).length}</p>
        </div>
      </div>

      {/* Relationship Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byRelationship).map(([rel, count]) => (
            <div key={rel} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <span className="text-sm text-text-secondary">{relationshipLabels[rel] || rel}:</span>
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
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterVerified}
              onChange={(e) => {
                setFilterVerified(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Parent
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Relationship
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Children
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
              {parents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No parents found</p>
                    <Link href="/school/parents/add">
                      <Button variant="outline" className="mt-4">
                        Add your first parent
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                parents.map((parent) => (
                  <tr key={parent.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-akoma-green">
                            {parent.user.firstName?.[0]}{parent.user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {parent.user.firstName} {parent.user.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {parent.occupation || 'No occupation'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-text-secondary" />
                          <span className="text-sm text-text">{parent.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-text-secondary" />
                          <span className="text-sm text-text">{parent.user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRelationshipBadge(parent.relationship)}
                    </td>
                    {/* ✅ Fixed Children Column */}
                    <td className="px-6 py-4">
                      {(() => {
                        const children = (parent.students || parent.children || []) as StudentChild[];
                        if (children.length > 0) {
                          return (
                            <div>
                              {children.map((student) => (
                                <p key={student.id} className="text-sm text-text">
                                  {student.user?.firstName || 'Unknown'} {student.user?.lastName || 'Student'}
                                  {student.class && (
                                    <span className="text-xs text-text-secondary ml-1">
                                      ({student.class.name})
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return <span className="text-sm text-text-secondary">No children</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {getVerifiedBadge(parent.isVerified)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/school/parents/${parent.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/school/parents/${parent.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedParent(parent);
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
              {Math.min(currentPage * itemsPerPage, parents.length)} of {parents.length} parents
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
      {showDeleteModal && selectedParent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Parent</h3>
                <p className="text-sm text-text-secondary">
                  Remove {selectedParent.user.firstName} {selectedParent.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this parent? This action cannot be undone.
              </p>
              {selectedParent.students && selectedParent.students.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This parent has {selectedParent.students.length} child(ren) linked.
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
                  setSelectedParent(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading || (selectedParent.students && selectedParent.students.length > 0)}
              >
                {actionLoading ? 'Removing...' : 'Remove Parent'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}