/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  MapPin,
  UserPlus,
  Mail,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Download,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPendingApplications, verifySchool } from '@/lib/services/adminService';
import { format, formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private' | 'international';
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  region: string;
  district: string;
  contactEmail: string;
  contactPhone: string;
  appliedBy: string;
  appliedByEmail: string;
  appliedByPhone: string;
  appliedByRole: string;
  submittedAt: string;
  applicationStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  isActive: boolean;
  level: string;
  gesCode?: string;
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
}

interface ApplicationStats {
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export default function PendingApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, [currentPage, filterType, filterRegion]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getPendingApplications();
      
      if (data) {
        const apps = data.applications || [];
        setApplications(apps);
        
        // Calculate stats
        const submitted = apps.filter((a: Application) => a.applicationStatus === 'submitted').length;
        const approved = apps.filter((a: Application) => a.applicationStatus === 'approved').length;
        const rejected = apps.filter((a: Application) => a.applicationStatus === 'rejected').length;
        
        setStats({
          total: apps.length,
          submitted,
          approved,
          rejected
        });
        
        setTotalPages(Math.ceil(apps.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setActionLoading(true);
    try {
      await verifySchool(applicationId, { 
        status: 'approved',
        notes: approvalNotes || 'Application approved by Platform Admin'
      });
      
      toast.success('Application approved successfully!');
      setShowApproveModal(false);
      setApprovalNotes('');
      setSelectedApp(null);
      await fetchApplications();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    try {
      await verifySchool(applicationId, { 
        status: 'rejected',
        notes: rejectReason
      });
      
      toast.success('Application rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApp(null);
      await fetchApplications();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      submitted: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Pending Review'
      },
      approved: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Rejected'
      },
    };
    const config = configs[status] || configs.submitted;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appliedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || app.type === filterType;
    const matchesRegion = filterRegion === 'all' || app.region === filterRegion;
    
    return matchesSearch && matchesType && matchesRegion;
  });

  // Paginate
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique regions for filter
  const regions = [...new Set(applications.map(app => app.region).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Pending Applications</h1>
          <p className="text-text-secondary">
            Review and manage school registration applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
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
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Applications</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by school name, code, or applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="international">International</option>
            </select>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {paginatedApps.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedApps.map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: School Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-akoma-green" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-text truncate">{app.name}</h3>
                          {getStatusBadge(app.applicationStatus)}
                          {getTypeBadge(app.type)}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {app.district}, {app.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserPlus className="h-3.5 w-3.5" />
                            {app.appliedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {app.appliedByEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(app.submittedAt), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-secondary">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}
                          </span>
                        </div>
                        {app.gesCode && (
                          <p className="text-xs text-text-secondary mt-1">
                            GES Code: <span className="font-mono">{app.gesCode}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/platform/applications/${app.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    
                    {app.applicationStatus === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowApproveModal(true);
                          }}
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectModal(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-akoma-green mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-text">No Pending Applications</h3>
            <p className="text-text-secondary">All caught up! There are no applications waiting for review.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
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

      {/* Approve Modal */}
      {showApproveModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Approve Application</h3>
                <p className="text-sm text-text-secondary">
                  Approve <strong>{selectedApp.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Approving this application will:
                    <br />• Generate a school code
                    <br />• Create a school admin account
                    <br />• Send login credentials via email
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedApp(null);
                  setApprovalNotes('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleApprove(selectedApp.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve Application'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Reject Application</h3>
                <p className="text-sm text-text-secondary">
                  Reject <strong>{selectedApp.name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this application..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
                  rows={3}
                  required
                />
                {!rejectReason.trim() && actionLoading === false && (
                  <p className="text-xs text-red-500 mt-1">Please provide a reason</p>
                )}
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Rejecting this application will:
                    <br />• Notify the applicant via email
                    <br />• Include the rejection reason
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedApp(null);
                  setRejectReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedApp.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Processing...' : 'Reject Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}