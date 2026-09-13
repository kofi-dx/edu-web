/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAllCurricula, publishCurriculum, archiveCurriculum } from '@/lib/services/adminService';
import { format } from 'date-fns';

interface Curriculum {
  id: string;
  name: string;
  description: string;
  source: 'government' | 'school' | 'international' | 'custom';
  sourceName: string;
  visibility: 'public' | 'private' | 'shared' | 'pending';
  version: string;
  year: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  isActive: boolean;
  createdAt: string;
  publishedAt?: string;
  levels?: any[];
}

interface CurriculumStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export default function CurriculumPage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [stats, setStats] = useState<CurriculumStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCurricula();
  }, [currentPage, filterSource, filterStatus]);

  const fetchCurricula = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filterSource !== 'all') params.source = filterSource;
      if (filterStatus !== 'all') params.status = filterStatus;

      const data = await getAllCurricula(params);
      
      if (data) {
        let list = data.curricula || [];
        
        // Client-side search
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          list = list.filter((c: Curriculum) =>
            c.name.toLowerCase().includes(search) ||
            c.description?.toLowerCase().includes(search) ||
            c.sourceName?.toLowerCase().includes(search)
          );
        }
        
        setCurricula(list);
        setTotalPages(data.totalPages || 1);
        
        // Calculate stats from all curricula
        const all = data.curricula || [];
        setStats({
          total: data.total || 0,
          published: all.filter((c: Curriculum) => c.status === 'published').length,
          draft: all.filter((c: Curriculum) => c.status === 'draft').length,
          archived: all.filter((c: Curriculum) => c.status === 'archived').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch curricula:', error);
      toast.error('Failed to load curricula');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await publishCurriculum(id);
      toast.success('Curriculum published successfully');
      await fetchCurricula();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to publish curriculum');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id: string) => {
    setActionLoading(id);
    try {
      await archiveCurriculum(id);
      toast.success('Curriculum archived successfully');
      await fetchCurricula();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to archive curriculum');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      published: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'Published'
      },
      draft: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Draft'
      },
      archived: {
        color: 'bg-gray-100 text-gray-700',
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Archived'
      },
      under_review: {
        color: 'bg-blue-100 text-blue-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Under Review'
      },
    };
    const config = configs[status] || configs.draft;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      government: {
        color: 'bg-blue-100 text-blue-700',
        icon: <Building2 className="h-3.5 w-3.5" />,
        label: 'Government'
      },
      school: {
        color: 'bg-purple-100 text-purple-700',
        icon: <Building2 className="h-3.5 w-3.5" />,
        label: 'School'
      },
      international: {
        color: 'bg-indigo-100 text-indigo-700',
        icon: <Globe className="h-3.5 w-3.5" />,
        label: 'International'
      },
      custom: {
        color: 'bg-gray-100 text-gray-700',
        icon: <BookOpen className="h-3.5 w-3.5" />,
        label: 'Custom'
      },
    };
    const config = configs[source] || configs.custom;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      public: { color: 'bg-green-100 text-green-700', label: 'Public' },
      private: { color: 'bg-gray-100 text-gray-700', label: 'Private' },
      shared: { color: 'bg-blue-100 text-blue-700', label: 'Shared' },
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    };
    const config = configs[visibility] || configs.pending;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading curricula...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Curriculum Management</h1>
          <p className="text-text-secondary">
            Manage all curricula on the Akoma Edu platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCurricula}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/platform/curriculum/create">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Plus className="h-4 w-4" />
              Create Curriculum
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Curricula</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search curricula by name, description, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Sources</option>
              <option value="government">Government</option>
              <option value="school">School</option>
              <option value="international">International</option>
              <option value="custom">Custom</option>
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Curricula Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Curriculum
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Source
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Version
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Visibility
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Levels
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {curricula.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No curricula found</p>
                    <Link href="/platform/curriculum/create">
                      <Button variant="outline" className="mt-4">
                        Create your first curriculum
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                curricula.map((curriculum) => (
                  <tr key={curriculum.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text">{curriculum.name}</p>
                        <p className="text-xs text-text-secondary truncate max-w-xs">
                          {curriculum.description || 'No description'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {format(new Date(curriculum.createdAt), 'PPP')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getSourceBadge(curriculum.source)}
                      {curriculum.sourceName && (
                        <p className="text-xs text-text-secondary mt-1">{curriculum.sourceName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        v{curriculum.version}
                      </code>
                      {curriculum.year && (
                        <p className="text-xs text-text-secondary mt-1">{curriculum.year}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getVisibilityBadge(curriculum.visibility)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(curriculum.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text">
                        {curriculum.levels?.length || 0}
                      </span>
                      <p className="text-xs text-text-secondary">Levels</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/platform/curriculum/${curriculum.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/platform/curriculum/${curriculum.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {curriculum.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handlePublish(curriculum.id)}
                            disabled={actionLoading === curriculum.id}
                          >
                            {actionLoading === curriculum.id ? (
                              <div className="w-4 h-4 border-2 border-akoma-green border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {curriculum.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                            onClick={() => handleArchive(curriculum.id)}
                            disabled={actionLoading === curriculum.id}
                          >
                            {actionLoading === curriculum.id ? (
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
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
              {Math.min(currentPage * itemsPerPage, curricula.length)} of {curricula.length} curricula
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