/* eslint-disable @typescript-eslint/no-unused-vars */
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
  CalendarClock,
  ListChecks,
  Ban,
  Play, 
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getStudentApplication,
  approveStudentApplication,
  rejectStudentApplication,
  markApplicationUnderReview,
  scheduleApplicationExam,
  recordApplicationExamResult,
  waitlistApplication,
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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  under_review: 'Under Review',
  exam_scheduled: 'Exam Scheduled',
  exam_completed: 'Exam Completed',
  interview_scheduled: 'Interview Scheduled',
  interview_completed: 'Interview Completed',
  document_required: 'Documents Required',
  documents_submitted: 'Documents Submitted',
  waitlisted: 'Waitlisted',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

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
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showExamModal, setShowExamModal] = useState(false);
  const [showExamResultModal, setShowExamResultModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // ============================================
  // LOAD
  // ============================================
  const load = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentApplication(applicationId);
      setApplication(data);

      // Load classes if it's not terminal
      const isTerminal = ['approved', 'rejected', 'withdrawn'].includes(data.status);
      if (!isTerminal) {
        const cls = await getClasses().catch(() => []);
        const classList = Array.isArray(cls)
          ? cls
          : Array.isArray((cls as any)?.classes)
          ? (cls as any).classes
          : [];
        setClasses(classList);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  // ============================================
  // ACTIONS
  // ============================================
  const run = async (fn: () => Promise<any>, successMsg: string) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      await load();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Action failed');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = () =>
    run(
      () => markApplicationUnderReview(applicationId),
      'Marked as under review'
    );

  const handleWaitlist = (reason: string) =>
    run(
      () => waitlistApplication(applicationId, reason),
      'Moved to waitlist'
    ).then((ok) => ok && setShowWaitlistModal(false));

  const handleScheduleExam = (data: {
    examDate: string;
    examVenue: string;
    examNotes?: string;
  }) =>
    run(
      () => scheduleApplicationExam(applicationId, data),
      'Exam scheduled — parent notified'
    ).then((ok) => ok && setShowExamModal(false));

  const handleRecordExamResult = (data: {
    examResult: 'passed' | 'failed';
    examScore?: number;
    notes?: string;
  }) =>
    run(
      () => recordApplicationExamResult(applicationId, data),
      `Exam result recorded: ${data.examResult}`
    ).then((ok) => ok && setShowExamResultModal(false));

  const handleApprove = (classId: string, notes: string) =>
    run(
      () => approveStudentApplication(applicationId, { classId, notes }),
      'Application approved — student enrolled'
    ).then((ok) => {
      if (ok) {
        setShowApproveModal(false);
        router.push('/school/student-applications');
      }
    });

  const handleReject = (reason: string) =>
    run(
      () => rejectStudentApplication(applicationId, { reason }),
      'Application rejected'
    ).then((ok) => {
      if (ok) {
        setShowRejectModal(false);
        router.push('/school/student-applications');
      }
    });

  // ============================================
  // LOADING / ERROR
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

  if (error || !application) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-text mb-2">Application Not Found</h1>
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
          <div className="flex flex-col items-start md:items-end gap-2">
            <StatusPill status={application.status} />
            <p className="text-xs text-text-secondary">
              Next action:{' '}
              <span className="font-medium text-text">
                {application.nextActionBy === 'parent' ? 'Parent' : 'School'}
              </span>
            </p>
          </div>
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
          <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={`${application.studentFirstName} ${application.studentLastName}`} />
          <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="Desired Level" value={formatLevel(application.desiredLevel)} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={application.studentDateOfBirth || '—'} />
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Gender"
            value={
              application.studentGender
                ? application.studentGender.charAt(0).toUpperCase() + application.studentGender.slice(1)
                : '—'
            }
          />
          {application.previousSchool && (
            <InfoRow icon={<School2 className="h-4 w-4" />} label="Previous School" value={application.previousSchool} />
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
          <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={`${application.parentFirstName} ${application.parentLastName}`} />
          <InfoRow
            icon={<Users className="h-4 w-4" />}
            label="Relationship"
            value={application.parentRelationship.charAt(0).toUpperCase() + application.parentRelationship.slice(1)}
          />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={application.parentEmail} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={application.parentPhone} />
        </div>
      </div>

      {/* Exam details (if applicable) */}
      {application.examDate && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm">
          <div className="p-6 border-b border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-text">Entrance Exam</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date & Time" value={formatDate(application.examDate)} />
            <InfoRow icon={<School2 className="h-4 w-4" />} label="Venue" value={application.examVenue || '—'} />
            {application.examResult && application.examResult !== 'pending' && (
              <InfoRow
                icon={<ListChecks className="h-4 w-4" />}
                label="Result"
                value={application.examResult === 'passed' ? 'Passed' : 'Failed'}
              />
            )}
            {application.examScore != null && (
              <InfoRow icon={<ListChecks className="h-4 w-4" />} label="Score" value={`${application.examScore}`} />
            )}
            {application.examNotes && (
              <div className="md:col-span-2">
                <InfoRow icon={<FileText className="h-4 w-4" />} label="Notes" value={application.examNotes} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes from parent */}
      {application.notes && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-text">Parent&apos;s Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-text whitespace-pre-wrap">{application.notes}</p>
          </div>
        </div>
      )}

      {/* Review details */}
      {application.reviewedAt && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="font-semibold text-text">Review Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Reviewed At" value={formatDate(application.reviewedAt)} />
            {application.reviewNotes && (
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Review Notes" value={application.reviewNotes} />
            )}
            {application.rejectionReason && (
              <div className="md:col-span-2">
                <InfoRow icon={<XCircle className="h-4 w-4" />} label="Rejection Reason" value={application.rejectionReason} />
              </div>
            )}
            {application.waitlistReason && (
              <div className="md:col-span-2">
                <InfoRow icon={<Clock className="h-4 w-4" />} label="Waitlist Reason" value={application.waitlistReason} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage history */}
      {application.stageHistory && application.stageHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <History className="h-5 w-5 text-slate-600" />
            </div>
            <h2 className="font-semibold text-text">Activity Timeline</h2>
          </div>
          <div className="p-6">
            <ol className="space-y-3">
              {application.stageHistory
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-akoma-green mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-text">
                        {STATUS_LABELS[entry.stage] || entry.stage}
                      </p>
                      <p className="text-xs text-text-secondary">{formatDate(entry.at)}</p>
                      {entry.meta && Object.keys(entry.meta).length > 0 && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {Object.entries(entry.meta)
                            .filter(([_, v]) => v != null && v !== '')
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        </div>
      )}

      {/* Action panel */}
      <ActionPanel
        application={application}
        actionLoading={actionLoading}
        onMarkUnderReview={handleMarkUnderReview}
        onOpenScheduleExam={() => setShowExamModal(true)}
        onOpenExamResult={() => setShowExamResultModal(true)}
        onOpenApprove={() => setShowApproveModal(true)}
        onOpenReject={() => setShowRejectModal(true)}
        onOpenWaitlist={() => setShowWaitlistModal(true)}
      />

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {showExamModal && (
        <ScheduleExamModal
          onCancel={() => setShowExamModal(false)}
          onSubmit={handleScheduleExam}
          loading={actionLoading}
        />
      )}

      {showExamResultModal && (
        <ExamResultModal
          onCancel={() => setShowExamResultModal(false)}
          onSubmit={handleRecordExamResult}
          loading={actionLoading}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          classes={classes}
          onCancel={() => setShowApproveModal(false)}
          onSubmit={handleApprove}
          loading={actionLoading}
        />
      )}

      {showRejectModal && (
        <RejectModal
          onCancel={() => setShowRejectModal(false)}
          onSubmit={handleReject}
          loading={actionLoading}
        />
      )}

      {showWaitlistModal && (
        <WaitlistModal
          onCancel={() => setShowWaitlistModal(false)}
          onSubmit={handleWaitlist}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
    under_review: 'bg-indigo-100 text-indigo-700',
    exam_scheduled: 'bg-blue-100 text-blue-700',
    exam_completed: 'bg-cyan-100 text-cyan-700',
    waitlisted: 'bg-slate-100 text-slate-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-700',
  };
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5" />,
    under_review: <Clock className="h-3.5 w-3.5" />,
    exam_scheduled: <CalendarClock className="h-3.5 w-3.5" />,
    exam_completed: <CheckCircle2 className="h-3.5 w-3.5" />,
    waitlisted: <Clock className="h-3.5 w-3.5" />,
    approved: <CheckCircle2 className="h-3.5 w-3.5" />,
    rejected: <XCircle className="h-3.5 w-3.5" />,
    withdrawn: <XCircle className="h-3.5 w-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
      {icons[status] || icons.pending}
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ActionPanel({
  application,
  actionLoading,
  onMarkUnderReview,
  onOpenScheduleExam,
  onOpenExamResult,
  onOpenApprove,
  onOpenReject,
  onOpenWaitlist,
}: {
  application: AdmissionApplicationSummary;
  actionLoading: boolean;
  onMarkUnderReview: () => void;
  onOpenScheduleExam: () => void;
  onOpenExamResult: () => void;
  onOpenApprove: () => void;
  onOpenReject: () => void;
  onOpenWaitlist: () => void;
}) {
  const s = application.status;

  // Terminal — no actions
  if (['approved', 'rejected', 'withdrawn'].includes(s)) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-sm text-text-secondary">
          This application has been finalized. No further action is available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-text mb-4">Available Actions</h2>

      <div className="flex flex-wrap gap-3">
        {s === 'pending' && (
          <Button
            onClick={onMarkUnderReview}
            disabled={actionLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Play className="h-4 w-4" />
            Mark Under Review
          </Button>
        )}

        {['pending', 'under_review'].includes(s) && (
          <Button
            onClick={onOpenScheduleExam}
            disabled={actionLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <CalendarClock className="h-4 w-4" />
            Schedule Exam
          </Button>
        )}

        {s === 'exam_scheduled' && (
          <Button
            onClick={onOpenExamResult}
            disabled={actionLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
          >
            <ListChecks className="h-4 w-4" />
            Record Exam Result
          </Button>
        )}

        {s !== 'waitlisted' && (
          <Button
            onClick={onOpenWaitlist}
            disabled={actionLoading}
            variant="outline"
            className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Clock className="h-4 w-4" />
            Move to Waitlist
          </Button>
        )}

        <Button
          onClick={onOpenApprove}
          disabled={actionLoading}
          className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve & Enroll
        </Button>

        <Button
          onClick={onOpenReject}
          disabled={actionLoading}
          variant="outline"
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
        >
          <Ban className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MODAL COMPONENTS
// ============================================

function ModalShell({
  title,
  onCancel,
  children,
}: {
  title: string;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-text mb-4">{title}</h2>
        {children}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 hidden"
          aria-label="close"
        />
      </div>
    </div>
  );
}

function ScheduleExamModal({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (data: { examDate: string; examVenue: string; examNotes?: string }) => void;
  loading: boolean;
}) {
  const [examDate, setExamDate] = useState('');
  const [examVenue, setExamVenue] = useState('');
  const [examNotes, setExamNotes] = useState('');

  return (
    <ModalShell title="Schedule Entrance Exam" onCancel={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Exam Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Venue <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={examVenue}
            onChange={(e) => setExamVenue(e.target.value)}
            placeholder="e.g. Main Examination Hall"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={examNotes}
            onChange={(e) => setExamNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Things to bring, arrival time, etc."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                examDate,
                examVenue: examVenue.trim(),
                examNotes: examNotes.trim() || undefined,
              })
            }
            disabled={loading || !examDate || !examVenue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule Exam'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function ExamResultModal({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (data: { examResult: 'passed' | 'failed'; examScore?: number; notes?: string }) => void;
  loading: boolean;
}) {
  const [examResult, setExamResult] = useState<'passed' | 'failed'>('passed');
  const [examScore, setExamScore] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ModalShell title="Record Exam Result" onCancel={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Result <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <label className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${examResult === 'passed' ? 'bg-green-50 border-green-500 text-green-800' : 'border-gray-200'}`}>
              <input
                type="radio"
                value="passed"
                checked={examResult === 'passed'}
                onChange={() => setExamResult('passed')}
                className="sr-only"
              />
              <CheckCircle2 className="h-4 w-4" /> Passed
            </label>
            <label className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${examResult === 'failed' ? 'bg-red-50 border-red-500 text-red-800' : 'border-gray-200'}`}>
              <input
                type="radio"
                value="failed"
                checked={examResult === 'failed'}
                onChange={() => setExamResult('failed')}
                className="sr-only"
              />
              <XCircle className="h-4 w-4" /> Failed
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Score (optional)
          </label>
          <input
            type="number"
            value={examScore}
            onChange={(e) => setExamScore(e.target.value)}
            placeholder="e.g. 85"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                examResult,
                examScore: examScore ? Number(examScore) : undefined,
                notes: notes.trim() || undefined,
              })
            }
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Result'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function ApproveModal({
  classes,
  onCancel,
  onSubmit,
  loading,
}: {
  classes: any[];
  onCancel: () => void;
  onSubmit: (classId: string, notes: string) => void;
  loading: boolean;
}) {
  const [classId, setClassId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ModalShell title="Approve & Enroll Student" onCancel={onCancel}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-text-secondary bg-akoma-green/5 rounded-lg p-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-akoma-green" />
          <p>
            On approval, a <strong>parent account</strong> and{' '}
            <strong>student account</strong> will be created automatically. Temporary passwords
            will be emailed to the parent.
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
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm"
            >
              <option value="">Select a class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} — {formatLevel(cls.level || '')}
                  {cls.capacity ? ` (${cls.studentCount || 0}/${cls.capacity})` : ''}
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
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(classId, notes)}
            disabled={loading || !classId}
            className="bg-akoma-green hover:bg-akoma-dark text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Approval'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function RejectModal({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <ModalShell title="Reject Application" onCancel={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Reason for Rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="This will be shared with the parent."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
          />
          <p className="text-xs text-text-secondary mt-1 text-right">{reason.length}/500</p>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(reason.trim())}
            disabled={loading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function WaitlistModal({
  onCancel,
  onSubmit,
  loading,
}: {
  onCancel: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <ModalShell title="Move to Waitlist" onCancel={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Class is full. Will notify if a spot opens."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-akoma-green text-sm resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(reason.trim())}
            disabled={loading}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Move to Waitlist'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}