/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Mail,
  Calendar,
  FileText,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getApplicationStatus,
  type ApplicationStatus
} from '@/lib/services/publicService';

// ============================================
// COMPONENT
// ============================================

export default function ApplicationStatusPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [data, setData] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [applicationId]);

  const fetchStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getApplicationStatus(applicationId);
      setData(result);
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        'Failed to load application status';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      toast.success('Application ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading application status...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-text mb-2">
              Application Not Found
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              {error ||
                'We couldn\'t find an application with this ID. Please check the ID and try again.'}
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => fetchStatus()}
                className="w-full bg-akoma-green hover:bg-akoma-dark text-white gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STATUS CONFIG
  // ============================================

  const statusConfig = {
    submitted: {
      label: 'Pending Review',
      description: 'Your application is currently being reviewed by our team.',
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    approved: {
      label: 'Approved',
      description: 'Congratulations! Your school has been approved.',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      gradient: 'from-akoma-green to-green-700',
    },
    rejected: {
      label: 'Application Rejected',
      description: 'Unfortunately, your application was not approved.',
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      gradient: 'from-red-500 to-red-600',
    },
  };

  const config =
    statusConfig[data.applicationStatus as keyof typeof statusConfig] ||
    statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Hero status card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className={`bg-linear-to-r ${config.gradient} p-6 md:p-8 text-white`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <StatusIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold">
                    {config.label}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium capitalize">
                    {data.status}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Application ID */}
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Application ID
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 truncate">
                  {applicationId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <InfoItem
                icon={Building2}
                label="School Name"
                value={data.name}
              />
              <InfoItem
                icon={FileText}
                label="Application Type"
                value={data.name ? 'School Registration' : 'School Application'}
              />
              <InfoItem
                icon={Calendar}
                label="Submitted"
                value={formatDate(data.submittedAt)}
              />
              {data.reviewedAt && (
                <InfoItem
                  icon={Calendar}
                  label="Reviewed"
                  value={formatDate(data.reviewedAt)}
                />
              )}
            </div>

            {/* Rejection reason */}
            {data.applicationStatus === 'rejected' && data.rejectionReason && (
              <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Reason for Rejection
                    </p>
                    <p className="text-sm text-red-700">
                      {data.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status-specific sections */}
        {data.applicationStatus === 'submitted' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-akoma-green" />
              What happens next?
            </h2>
            <div className="space-y-4">
              <TimelineItem
                number={1}
                title="Under Review"
                description="Our team is reviewing your application. This usually takes 1-2 business days."
                status="active"
              />
              <TimelineItem
                number={2}
                title="Decision Made"
                description="You will be notified by email once a decision is made."
                status="pending"
              />
              <TimelineItem
                number={3}
                title="Access Granted"
                description="If approved, login credentials will be sent to your registered email."
                status="pending"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Check Your Email
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    We&apos;ll send updates to your registered email address. Make
                    sure to check your spam folder too.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.applicationStatus === 'approved' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-akoma-green" />
              You&apos;re all set!
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm font-medium text-green-800 mb-1">
                  🎉 Welcome to Akoma Edu
                </p>
                <p className="text-xs text-green-700">
                  Login credentials have been sent to your registered email
                  address. Use them to sign in and start managing your school.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login" className="flex-1">
                  <Button className="w-full bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                    Sign In Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/support" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {data.applicationStatus === 'rejected' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              What can you do?
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-800">
                  Your application was not approved. You can review the reason
                  above, address any issues, and submit a new application.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register/school" className="flex-1">
                  <Button className="w-full bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Reapply
                  </Button>
                </Link>
                <Link href="/support" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-text-secondary">
          <p>
            Need help?{' '}
            <Link href="/support" className="text-akoma-green hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-text-secondary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-text truncate">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({
  number,
  title,
  description,
  status,
}: {
  number: number;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'done';
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
          status === 'done'
            ? 'bg-akoma-green text-white'
            : status === 'active'
            ? 'bg-akoma-green/10 text-akoma-green ring-2 ring-akoma-green/20'
            : 'bg-gray-100 text-text-secondary'
        }`}
      >
        {status === 'done' ? <Check className="h-4 w-4" /> : number}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={`text-sm font-medium ${
            status === 'pending' ? 'text-text-secondary' : 'text-text'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}