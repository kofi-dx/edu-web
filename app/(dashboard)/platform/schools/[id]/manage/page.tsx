/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/platform/schools/[id]/manage/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSchoolById, activateSchool, suspendSchool } from '@/lib/services/adminService';

interface School {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  isActive: boolean;
  contactEmail: string;
  contactPhone: string;
  type: string;
  region: string;
  district: string;
}

export default function ManageSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    fetchSchool();
  }, [schoolId]);

  const fetchSchool = async () => {
    setLoading(true);
    try {
      // Use the admin service which has the correct API path
      const data = await getSchoolById(schoolId);
      if (data) {
        setSchool(data);
      } else {
        toast.error('School not found');
      }
    } catch (error) {
      console.error('Failed to fetch school:', error);
      toast.error('Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'activate' | 'suspend' | 'reject') => {
    setActionLoading(true);
    try {
      let response;
      
      if (action === 'activate') {
        response = await activateSchool(schoolId);
        toast.success('School activated successfully!');
      } else if (action === 'suspend') {
        response = await suspendSchool(schoolId);
        toast.success('School suspended successfully!');
      } else if (action === 'reject') {
        // For reject, we need to use the verify endpoint
        const { verifySchool } = await import('@/lib/services/adminService');
        response = await verifySchool(schoolId, { status: 'rejected' });
        toast.success('Application rejected successfully!');
      }
      
      if (response) {
        await fetchSchool();
        setConfirmAction(null);
        // Redirect to school details after action
        router.push(`/platform/schools/${schoolId}`);
      }
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(error?.response?.data?.error?.message || 'Action failed');
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
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Pending'
      },
      suspended: { 
        color: 'bg-red-100 text-red-700', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Suspended'
      },
      rejected: { 
        color: 'bg-gray-100 text-gray-700', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Rejected'
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
      <div className="p-6 flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">School not found</h2>
          <Link href="/platform/schools">
            <Button className="mt-4">Back to Schools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href={`/platform/schools/${schoolId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to School Details
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Manage School</h1>
        <p className="text-text-secondary">
          {school.name} ({school.code})
        </p>
        <div className="mt-2 flex items-center gap-3">
          {getStatusBadge(school.status)}
          <span className="text-sm text-text-secondary">•</span>
          <span className="text-sm text-text-secondary">{school.type.charAt(0).toUpperCase() + school.type.slice(1)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-text mb-4">Current Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-text-secondary">Status</span>
              <span className="font-medium text-text">{school.status.charAt(0).toUpperCase() + school.status.slice(1)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-text-secondary">Active</span>
              <span className={`font-medium ${school.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {school.isActive ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-text-secondary">Contact Email</span>
              <span className="text-text">{school.contactEmail}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-secondary">Contact Phone</span>
              <span className="text-text">{school.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-text mb-4">Actions</h2>
          <div className="space-y-4">
            {/* Activate */}
            {school.status !== 'active' && school.status !== 'rejected' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-900">Activate School</h3>
                      <p className="text-sm text-green-700">
                        Approve and activate this school on the platform
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setConfirmAction('activate')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading}
                  >
                    Activate
                  </Button>
                </div>
              </div>
            )}

            {/* Suspend */}
            {school.status === 'active' && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900">Suspend School</h3>
                      <p className="text-sm text-red-700">
                        Temporarily suspend this school from the platform
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setConfirmAction('suspend')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={actionLoading}
                  >
                    Suspend
                  </Button>
                </div>
              </div>
            )}

            {/* Reject */}
            {school.status === 'pending' && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Reject Application</h3>
                      <p className="text-sm text-gray-700">
                        Reject this school&apos;s application
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setConfirmAction('reject')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-medium text-text mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/platform/schools/${schoolId}`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Building2 className="h-4 w-4" />
                    View School Details
                  </Button>
                </Link>
                <Link href={`/platform/schools/${schoolId}/stats`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    View Statistics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-text mb-2">
              Confirm {confirmAction}
            </h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to <strong>{confirmAction}</strong> <br />
              <span className="font-medium">{school.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(confirmAction as 'activate' | 'suspend' | 'reject')}
                className={
                  confirmAction === 'activate' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : confirmAction === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Yes, ${confirmAction}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}