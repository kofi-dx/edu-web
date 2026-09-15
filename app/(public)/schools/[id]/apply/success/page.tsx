/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/schools/[id]/apply/success/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Mail,
  FileText,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Home,
  Search as SearchIcon,
  CalendarClock, 
  XCircle, 
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getApplicationStatus,
  type AdmissionApplication,
} from '@/lib/services/publicsService';

// ============================================
// PAGE
// ============================================

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SuccessPageInner />
    </Suspense>
  );
}

function SuccessPageInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const schoolId = params?.id as string;
  const applicationId = searchParams?.get('applicationId') || '';

  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(!!applicationId);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationStatus(applicationId);
      setApplication(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Could not load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleCopy = async () => {
    if (!applicationId) return;
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingScreen />;

  // Error state
  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#17201D] mb-2">Application Submitted</h1>
          <p className="text-text-secondary mb-6">
            {error ||
              "We couldn't load your application details, but your submission was received. Keep the reference ID below."}
          </p>
          {applicationId && (
            <ReferenceCard applicationId={applicationId} copied={copied} onCopy={handleCopy} />
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schools">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Browse Schools
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPending = application.status === 'pending';

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#17201D] mb-3">Application Submitted!</h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Thank you, {application.parentFirstName}. We&apos;ve received your application for{' '}
            <span className="font-medium text-[#17201D]">
              {application.studentFirstName} {application.studentLastName}
            </span>{' '}
            to{' '}
            <span className="font-medium text-[#17201D]">
              {application.school?.name || 'the school'}
            </span>
            .
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container px-4 mx-auto max-w-3xl space-y-6">
          {/* Reference ID */}
          <ReferenceCard applicationId={application.id} copied={copied} onCopy={handleCopy} />

          {/* Exam notice (if scheduled) */}
          {application.examDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <CalendarClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Entrance Exam Scheduled</h3>
                  <p className="text-sm text-blue-800">
                    <strong>Date:</strong> {formatDate(application.examDate)}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Venue:</strong> {application.examVenue}
                  </p>
                  {application.examNotes && (
                    <p className="text-sm text-blue-700 mt-2 whitespace-pre-wrap">
                      {application.examNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exam result (if completed) */}
          {application.examResult && application.examResult !== 'pending' && (
            <div
              className={`rounded-2xl p-6 border ${
                application.examResult === 'passed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    application.examResult === 'passed' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {application.examResult === 'passed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-semibold mb-1 ${
                      application.examResult === 'passed' ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    Exam {application.examResult === 'passed' ? 'Passed' : 'Not Passed'}
                  </h3>
                  {application.examScore != null && (
                    <p
                      className={`text-sm ${
                        application.examResult === 'passed' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      Score: <strong>{application.examScore}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Waitlist notice */}
          {application.status === 'waitlisted' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">You&apos;re on the Waitlist</h3>
                  <p className="text-sm text-slate-700">
                    {application.waitlistReason ||
                      "The school has placed your application on the waitlist. We'll notify you if a spot becomes available."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-[#17201D]">Application Summary</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <SummaryRow
                label="Student"
                value={`${application.studentFirstName} ${application.studentLastName}`}
              />
              <SummaryRow label="Desired Level" value={formatLevel(application.desiredLevel)} />
              <SummaryRow
                label="Parent / Guardian"
                value={`${application.parentFirstName} ${application.parentLastName}`}
              />
              <SummaryRow label="Contact Email" value={application.parentEmail} />
              {application.school && (
                <SummaryRow label="School" value={application.school.name} />
              )}
              <div>
                <p className="text-xs text-text-secondary mb-1">Status</p>
                <StatusBadge status={application.status} />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-[#17201D]">What Happens Next</h2>
            </div>
            <div className="p-6">
              <DynamicTimeline application={application} />
            </div>
          </div>

          {/* Live status link */}
          <div className="text-center">
            <Link href={`/schools/${schoolId}/apply/status/${application.id}`}>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Live Status Page
              </Button>
            </Link>
            <p className="text-xs text-text-secondary mt-2">
              Bookmark this page to check your status anytime.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/schools">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <SearchIcon className="h-4 w-4" />
                Browse More Schools
              </Button>
            </Link>
            {isPending && (
              <Link href={`/schools/${schoolId}`}>
                <Button className="gap-2 w-full sm:w-auto bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white">
                  Back to School
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Note */}
          <div className="text-center text-sm text-text-secondary pt-4">
            <p>
              A confirmation email has been sent to{' '}
              <span className="font-medium text-[#17201D]">{application.parentEmail}</span>.
            </p>
            <p className="mt-1">
              Questions? Contact the school directly using the details on their page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F] mb-4" />
        <p>Loading application details...</p>
      </div>
    </div>
  );
}

function ReferenceCard({
  applicationId,
  copied,
  onCopy,
}: {
  applicationId: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="bg-[#0B6B4F]/5 border border-[#0B6B4F]/20 rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-[#0B6B4F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#17201D] mb-1">Your Application Reference</p>
          <p className="text-xs text-text-secondary mb-3">
            Save this ID to check your application status later.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-[#0B6B4F]/20 p-3">
            <code className="flex-1 text-xs font-mono text-[#17201D] break-all">
              {applicationId}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 p-1.5 rounded-md hover:bg-[#0B6B4F]/10 transition-colors"
              aria-label="Copy reference ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-[#0B6B4F]" />
              )}
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 mt-2">Copied to clipboard</p>}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className="text-sm font-medium text-[#17201D]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    under_review: 'bg-indigo-100 text-indigo-700',
    exam_scheduled: 'bg-blue-100 text-blue-700',
    exam_completed: 'bg-cyan-100 text-cyan-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-slate-100 text-slate-700',
    withdrawn: 'bg-gray-100 text-gray-700',
  };
  const labels: Record<string, string> = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    exam_scheduled: 'Exam Scheduled',
    exam_completed: 'Exam Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    withdrawn: 'Withdrawn',
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// ============================================
// DYNAMIC TIMELINE
// ============================================

function DynamicTimeline({ application }: { application: AdmissionApplication }) {
  const status = application.status;
  const submittedAt = application.createdAt;
  const reviewedAt = application.reviewedAt;
  const examDate = application.examDate;

  type StepState = 'complete' | 'current' | 'upcoming' | 'failed';
  interface Step {
    icon: React.ReactNode;
    title: string;
    description: string;
    state: StepState;
  }

  const steps: Step[] = [];

  // Step 1 — always: submission
  steps.push({
    icon: <FileText className="h-4 w-4" />,
    title: 'Application Submitted',
    description: `Received on ${formatDate(submittedAt)}`,
    state: 'complete',
  });

  // Step 2 — always: acknowledgment email
  steps.push({
    icon: <Mail className="h-4 w-4" />,
    title: 'Acknowledgment Email Sent',
    description: 'Check your inbox for confirmation',
    state: 'complete',
  });

  // Step 3 — school review
  if (status === 'pending') {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'School Review',
      description: 'The school is reviewing your application',
      state: 'current',
    });
  } else if (['under_review', 'exam_scheduled', 'exam_completed', 'waitlisted', 'approved', 'rejected'].includes(status)) {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'School Review',
      description: `Reviewed on ${reviewedAt ? formatDate(reviewedAt) : 'N/A'}`,
      state: 'complete',
    });
  }

  // Step 4 — exam (if applicable)
  if (['exam_scheduled', 'exam_completed'].includes(status)) {
    steps.push({
      icon: <CalendarClock className="h-4 w-4" />,
      title: 'Entrance Exam',
      description:
        status === 'exam_scheduled'
          ? `Scheduled for ${examDate ? formatDate(examDate) : 'TBD'} at ${application.examVenue || 'TBD'}`
          : `Completed${application.examResult ? ` — ${application.examResult}` : ''}`,
      state: status === 'exam_scheduled' ? 'current' : 'complete',
    });
  }

  // Step 5 — final decision
  if (status === 'approved') {
    steps.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: 'Approved — Accounts Created',
      description:
        'Parent & student accounts were created. Check your email for login details.',
      state: 'complete',
    });
  } else if (status === 'rejected') {
    steps.push({
      icon: <XCircle className="h-4 w-4" />,
      title: 'Application Rejected',
      description: application.rejectionReason
        ? `Reason: ${application.rejectionReason}`
        : 'See the email we sent for details.',
      state: 'failed',
    });
  } else if (status === 'waitlisted') {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'Waitlisted',
      description:
        application.waitlistReason ||
        'The school will contact you if a spot opens up.',
      state: 'current',
    });
  } else if (status === 'withdrawn') {
    steps.push({
      icon: <XCircle className="h-4 w-4" />,
      title: 'Application Withdrawn',
      description: 'You have withdrawn this application.',
      state: 'failed',
    });
  } else {
    // Still in progress — upcoming decision
    steps.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: 'Decision',
      description: 'You will be notified by email.',
      state: 'upcoming',
    });
  }

  return (
    <ol className="space-y-4">
      {steps.map((step, idx) => (
        <li key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                step.state === 'complete'
                  ? 'bg-green-100 text-green-600'
                  : step.state === 'current'
                  ? 'bg-[#0B6B4F] text-white'
                  : step.state === 'failed'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.icon}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-0.5 flex-1 mt-1 mb-1 ${
                  step.state === 'complete'
                    ? 'bg-green-200'
                    : step.state === 'failed'
                    ? 'bg-red-200'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-sm font-medium text-[#17201D]">{step.title}</p>
            <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ============================================
// HELPERS
// ============================================

function formatDate(iso: string): string {
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