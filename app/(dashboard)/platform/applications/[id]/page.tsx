/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Check,
  X,
  RefreshCw,
  Download,
  Printer,
  Globe,
  School,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSchoolById, verifySchool } from '@/lib/services/adminService';
import { format, formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private' | 'international';
  level: 'primary' | 'jhs' | 'shs' | 'combined';
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  region: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  gesCode?: string;
  districtCode?: string;
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
  website?: string;
  logo?: string;
  appliedBy: string;
  appliedByEmail: string;
  appliedByPhone: string;
  appliedByRole: string;
  submittedAt: string;
  applicationStatus: 'draft' | 'submitted' | 'approved' | 'rejected';
  isActive: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  registrationCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const data = await getSchoolById(applicationId);
      if (data) {
        setApplication(data);
      } else {
        toast.error('Application not found');
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      await verifySchool(application.id, {
        status: 'approved',
        notes: approvalNotes || 'Application approved by Platform Admin'
      });

      toast.success('Application approved successfully!');
      setShowApproveModal(false);
      setApprovalNotes('');
      await fetchApplication();
      
      // Redirect to school details after approval
      router.push(`/platform/schools/${application.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await verifySchool(application.id, {
        status: 'rejected',
        notes: rejectReason
      });

      toast.success('Application rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      await fetchApplication();
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
        icon: <Clock className="h-4 w-4" />,
        label: 'Pending Review'
      },
      approved: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Rejected'
      },
    };
    const config = configs[status] || configs.submitted;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
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

  const getLevelBadge = (level: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      primary: { color: 'bg-green-100 text-green-700', label: 'Primary' },
      jhs: { color: 'bg-orange-100 text-orange-700', label: 'JHS' },
      shs: { color: 'bg-purple-100 text-purple-700', label: 'SHS' },
      combined: { color: 'bg-indigo-100 text-indigo-700', label: 'Combined' },
    };
    const config = configs[level] || configs.primary;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderDetails = () => {
    if (!application) return null;

    return (
      <div className="space-y-6">
        {/* School Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-akoma-green" />
            School Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">School Name</p>
              <p className="text-base font-medium text-text">{application.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">School Code</p>
              <p className="text-base font-mono text-text">{application.code || 'Not assigned yet'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">School Type</p>
              <p>{getTypeBadge(application.type)}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Level</p>
              <p>{getLevelBadge(application.level)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-text-secondary">Location</p>
              <p className="text-text">{application.address || 'Not provided'}</p>
              <p className="text-sm text-text-secondary">{application.district}, {application.region}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-akoma-green" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Contact Email</p>
                <a href={`mailto:${application.contactEmail}`} className="text-sm text-akoma-green hover:underline">
                  {application.contactEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Contact Phone</p>
                <a href={`tel:${application.contactPhone}`} className="text-sm text-text hover:underline">
                  {application.contactPhone}
                </a>
              </div>
            </div>
            {application.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Website</p>
                  <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-sm text-akoma-green hover:underline">
                    {application.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applicant Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Applicant Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Full Name</p>
              <p className="text-text">{application.appliedBy}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Role</p>
              <p className="text-text capitalize">{application.appliedByRole.replace('_', ' ')}</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <a href={`mailto:${application.appliedByEmail}`} className="text-sm text-akoma-green hover:underline">
                  {application.appliedByEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Phone</p>
                <a href={`tel:${application.appliedByPhone}`} className="text-sm text-text hover:underline">
                  {application.appliedByPhone}
                </a>
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-text-secondary">Submitted</p>
              <p className="text-text">
                {format(new Date(application.submittedAt), 'PPP')} at {format(new Date(application.submittedAt), 'p')}
              </p>
              <p className="text-xs text-text-secondary">
                ({formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })})
              </p>
            </div>
          </div>
        </div>

        {/* Government Information */}
        {(application.gesCode || application.districtCode) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <School className="h-5 w-5 text-akoma-green" />
              Government Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.gesCode && (
                <div>
                  <p className="text-sm text-text-secondary">GES Code</p>
                  <p className="text-sm font-mono text-text">{application.gesCode}</p>
                </div>
              )}
              {application.districtCode && (
                <div>
                  <p className="text-sm text-text-secondary">District Code</p>
                  <p className="text-sm font-mono text-text">{application.districtCode}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Director Information */}
        {application.directorName && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-akoma-green" />
              Director Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Name</p>
                <p className="text-text">{application.directorName}</p>
              </div>
              {application.directorEmail && (
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <a href={`mailto:${application.directorEmail}`} className="text-sm text-akoma-green hover:underline">
                    {application.directorEmail}
                  </a>
                </div>
              )}
              {application.directorPhone && (
                <div>
                  <p className="text-sm text-text-secondary">Phone</p>
                  <a href={`tel:${application.directorPhone}`} className="text-sm text-text hover:underline">
                    {application.directorPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => {
    if (!application) return null;

    const historyItems = [
      {
        id: 'submitted',
        event: 'Application Submitted',
        description: `Application submitted by ${application.appliedBy}`,
        timestamp: application.submittedAt,
        status: 'completed'
      },
      ...(application.reviewedAt ? [{
        id: 'reviewed',
        event: application.applicationStatus === 'approved' ? 'Application Approved' : 'Application Rejected',
        description: application.applicationStatus === 'approved' 
          ? `Approved with notes: ${application.approvalNotes || 'No additional notes'}`
          : `Rejected: ${application.rejectionReason || 'No reason provided'}`,
        timestamp: application.reviewedAt,
        status: application.applicationStatus === 'approved' ? 'completed' : 'failed'
      }] : [])
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-akoma-green" />
          Application Timeline
        </h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {historyItems.map((item) => (
              <div key={item.id} className="relative pl-10">
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.status === 'completed' 
                    ? 'bg-green-100' 
                    : item.status === 'failed'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  {item.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : item.status === 'failed' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                
                {/* Content */}
                <div>
                  <p className="font-medium text-text">{item.event}</p>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {format(new Date(item.timestamp), 'PPP')} at {format(new Date(item.timestamp), 'p')}
                    {' '}({formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })})
                  </p>
                </div>
              </div>
            ))}
            
            {historyItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-text-secondary">No history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">Application not found</h2>
          <Link href="/platform/applications/pending">
            <Button className="mt-4">Back to Applications</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/platform/applications/pending" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplication}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
              {application.logo ? (
                <img src={application.logo} alt={application.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <Building2 className="h-7 w-7 text-akoma-green" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-text">{application.name}</h1>
                {getStatusBadge(application.applicationStatus)}
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                <span className="text-text-secondary">{application.district}, {application.region}</span>
                <span className="text-text-secondary">•</span>
                {getTypeBadge(application.type)}
                <span className="text-text-secondary">•</span>
                {getLevelBadge(application.level)}
                {application.code && (
                  <>
                    <span className="text-text-secondary">•</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-text-secondary">
                      {application.code}
                    </code>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
                <Clock className="h-4 w-4" />
                Submitted {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {application.applicationStatus === 'submitted' && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="default"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => setShowApproveModal(true)}
                disabled={actionLoading}
              >
                <Check className="h-4 w-4" />
                Approve Application
              </Button>
              <Button
                variant="outline"
                size="default"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['details', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'details' | 'history')}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-akoma-green text-akoma-green'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' ? renderDetails() : renderHistory()}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Approve Application</h3>
                <p className="text-sm text-text-secondary">
                  Approve <strong>{application.name}</strong>
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
                  setApprovalNotes('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
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
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Reject Application</h3>
                <p className="text-sm text-text-secondary">
                  Reject <strong>{application.name}</strong>
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
                  setRejectReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
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