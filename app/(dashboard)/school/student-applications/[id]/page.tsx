/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/school/student-applications/[id]/page.tsx
'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  School2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getStudentApplication,
  approveStudentApplication,
  rejectStudentApplication,
  getClasses,
  type AdmissionApplicationSummary,
} from '@/lib/services/schoolAdminService';

// ============================================
// HELPERS
// ============================================

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatLevel(level: string): string {
  return level
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}


// ============================================
// PAGE
// ============================================

export default function ApplicationReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const applicationId = params?.id as string;

  const [application, setApplication] = useState<AdmissionApplicationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);

  // Approve state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveClassId, setApproveClassId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approving, setApproving] = useState(false);

  // Reject state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // ============================================
  // LOAD
  // ============================================
  useEffect(() => {
    if (!applicationId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await getStudentApplication(applicationId);
        if (!mounted) return;
        setApplication(data);

        // Load classes only if pending
        if (data.status === 'pending') {
          const cls = await getClasses().catch(() => []);
            const classList = Array.isArray(cls)
            ? cls
            : Array.isArray((cls as any)?.classes)
            ? (cls as any).classes
            : [];
            if (mounted) setClasses(classList);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(
          err?.response?.data?.error?.message || 'Failed to load application'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  // ============================================
  // APPROVE
  // ============================================
  const handleApprove = async () => {
    if (!approveClassId) {
      toast.error('Please select a class');
      return;
    }
    setApproving(true);
    try {
      const result = await approveStudentApplication(applicationId, {
        classId: approveClassId,
        notes: approveNotes.trim() || undefined,
      });

      toast.success(result.message || 'Application approved');

      if (result.parentCreated && result.tempPassword) {
        toast.info(
          `Parent account created. Temp password: ${result.tempPassword}`,
          { duration: 15000 }
        );
      }
      if (result.studentTempPassword) {
        toast.info(
          `Student account created. Temp password: ${result.studentTempPassword}`,
          { duration: 15000 }
        );
      }

      router.push('/school/student-applications');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message || 'Failed to approve application'
      );
    } finally {
      setApproving(false);
    }
  };

  // ============================================
  // REJECT
  // ============================================
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setRejecting(true);
    try {
      const result = await rejectStudentApplication(applicationId, {
        reason: rejectReason.trim(),
      });
      toast.success(result.message || 'Application rejected');
      router.push('/school/student-applications');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message || 'Failed to reject application'
      );
    } finally {
      setRejecting(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-akoma-green mx-auto mb-3" />
          <p className="text-text-secondary">Loading application...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================
  if (error || !application) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text mb-2">
            Application Not Found
          </h1>
          <p className="text-text-secondary mb-6">
            {error || "We couldn't load this application."}
          </p>
          <Link href="/school/student-applications">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = application.status === 'pending';

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/school/student-applications"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-akoma-green transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Review Application</h1>
            <p className="text-text-secondary mt-1">
              Application ID: <span className="font-mono text-xs">{application.id}</span>
            </p>
          </div>
          <StatusPill status={application.status} />
        </div>
      </div>

      {/* Student card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-text">Student Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Full Name"
            value={`${application.studentFirstName} ${application.studentLastName}`}
          />
          <InfoRow
            icon={<GraduationCap className="h-4 w-4" />}
            label="Desired Level"
            value={formatLevel(application.desiredLevel)}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Date of Birth"
            value={application.studentDateOfBirth || '—'}
          />
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Gender"
            value={
              application.studentGender
                ? application.studentGender.charAt(0).toUpperCase() +
                  application.studentGender.slice(1)
                : '—'
            }
          />
          {application.previousSchool && (
            <InfoRow
              icon={<School2 className="h-4 w-4" />}
              label="Previous School"
              value={application.previousSchool}
            />
          )}
        </div>
      </div>

      {/* Parent card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="font-semibold text-text">Parent / Guardian Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Full Name"
            value={`${application.parentFirstName} ${application.parentLastName}`}
          />
          <InfoRow
            icon={<Users className="h-4 w-4" />}
            label="Relationship"
            value={
              application.parentRelationship.charAt(0).toUpperCase() +
              application.parentRelationship.slice(1)
            }
          />
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={application.parentEmail}
          />
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={application.parentPhone}
          />
        </div>
      </div>

      {/* Notes */}
      {application.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-text">Parent&apos;s Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-text whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        </div>
      )}

      {/* Review info (if already processed) */}
      {!isPending && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="font-semibold text-text">Review Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow
              icon={<Clock className="h-4 w-4" />}
              label="Reviewed At"
              value={formatDate(application.reviewedAt)}
            />
            {application.reviewNotes && (
              <InfoRow
                icon={<FileText className="h-4 w-4" />}
                label="Review Notes"
                value={application.reviewNotes}
              />
            )}
            {application.rejectionReason && (
              <InfoRow
                icon={<XCircle className="h-4 w-4" />}
                label="Rejection Reason"
                value={application.rejectionReason}
              />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setApproveOpen(true);
                setRejectOpen(false);
              }}
              className="flex-1 bg-akoma-green hover:bg-akoma-dark text-white gap-2 py-6"
            >
              <CheckCircle2 className="h-5 w-5" />
              Approve & Enroll
            </Button>
            <Button
              onClick={() => {
                setRejectOpen(true);
                setApproveOpen(false);
              }}
              variant="outline"
              className="flex-1 gap-2 py-6 border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-5 w-5" />
              Reject Application
            </Button>
          </div>

          {/* Approve form */}
          {approveOpen && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  On approval, a <strong>parent account</strong> and a{' '}
                  <strong>student account</strong> will be created automatically.
                  Temporary passwords will be shown and emailed to the parent.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Assign to Class <span className="text-red-500">*</span>
                </label>
                {classes.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    No classes available. Create a class first.
                  </p>
                ) : (
                  <select
                    value={approveClassId}
                    onChange={(e) => setApproveClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} — {formatLevel(cls.level || '')}
                        {cls.capacity
                          ? ` (${cls.studentCount || 0}/${cls.capacity})`
                          : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Review Notes (optional)
                </label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Any notes for internal record..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              <Button
                onClick={handleApprove}
                disabled={approving || !approveClassId}
                className="w-full bg-akoma-green hover:bg-akoma-dark text-white py-5"
              >
                {approving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Confirm Approval'
                )}
              </Button>
            </div>
          )}

          {/* Reject form */}
          {rejectOpen && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Explain why this application is being rejected. This will be shared with the parent."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none"
                />
                <p className="text-xs text-text-secondary mt-1 text-right">
                  {rejectReason.length}/500
                </p>
              </div>

              <Button
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5"
              >
                {rejecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-text wrap-break-word">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-blue-100 text-blue-700',
    withdrawn: 'bg-gray-100 text-gray-700',
  };
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5" />,
    approved: <CheckCircle2 className="h-3.5 w-3.5" />,
    rejected: <XCircle className="h-3.5 w-3.5" />,
    waitlisted: <Clock className="h-3.5 w-3.5" />,
    withdrawn: <XCircle className="h-3.5 w-3.5" />,
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {icons[status] || icons.pending}
      {label}
    </span>
  );
}