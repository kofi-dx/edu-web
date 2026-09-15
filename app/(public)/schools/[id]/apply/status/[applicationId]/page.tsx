/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/schools/[id]/apply/status/[applicationId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarClock,
  FileText,
  RefreshCw,
  Home,
  Search as SearchIcon,
  ListChecks,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getApplicationStatus,
  type AdmissionApplication,
} from '@/lib/services/publicsService';

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

export default function ApplicationStatusPage() {
  const params = useParams<{ id: string; applicationId: string }>();
  const schoolId = params?.id as string;
  const applicationId = params?.applicationId as string;

  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!applicationId) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getApplicationStatus(applicationId);
      setApplication(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          'Application not found. Please check the reference ID.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F]" />
      </div>
    );
  }

  // Error state
  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#17201D] mb-2">Application Not Found</h1>
          <p className="text-text-secondary mb-6">
            {error || 'We could not find an application with that reference ID.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schools">
              <Button variant="outline" className="gap-2">
                <SearchIcon className="h-4 w-4" />
                Browse Schools
              </Button>
            </Link>
            <Link href={`/schools/${schoolId}`}>
              <Button className="bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white gap-2">
                <Home className="h-4 w-4" />
                School Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container px-4 mx-auto py-8 max-w-3xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <Link
                href={`/schools/${schoolId}`}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-[#0B6B4F] transition-colors mb-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to school
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-[#17201D]">
                Application Status
              </h1>
              <p className="text-text-secondary mt-1">
                {application.school?.name || 'School'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => load(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Status overview */}
      <section className="py-8">
        <div className="container px-4 mx-auto max-w-3xl space-y-6">
          {/* Big status card */}
          <BigStatusCard application={application} />

          {/* Student + parent summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-[#17201D]">Application Summary</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow
                label="Student"
                value={`${application.studentFirstName} ${application.studentLastName}`}
              />
              <InfoRow label="Desired Level" value={formatLevel(application.desiredLevel)} />
              <InfoRow
                label="Parent / Guardian"
                value={`${application.parentFirstName} ${application.parentLastName}`}
              />
              <InfoRow label="Reference ID" value={application.id} mono />
              <InfoRow label="Submitted" value={formatDate(application.createdAt)} />
              {application.reviewedAt && (
                <InfoRow label="Last Reviewed" value={formatDate(application.reviewedAt)} />
              )}
            </div>
          </div>

          {/* Exam details */}
          {application.examDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <CalendarClock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Entrance Exam {application.examResult === 'pending' ? 'Scheduled' : 'Completed'}
                  </h3>
                  <p className="text-sm text-blue-800">
                    <strong>Date:</strong> {formatDate(application.examDate)}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Venue:</strong> {application.examVenue || '—'}
                  </p>
                  {application.examScore != null && (
                    <p className="text-sm text-blue-800">
                      <strong>Score:</strong> {application.examScore}
                    </p>
                  )}
                  {application.examNotes && (
                    <p className="text-sm text-blue-700 mt-2 whitespace-pre-wrap">
                      {application.examNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {application.status === 'rejected' && application.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Reason for Rejection</h3>
                  <p className="text-sm text-red-800 whitespace-pre-wrap">
                    {application.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waitlist reason */}
          {application.status === 'waitlisted' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">You&apos;re on the Waitlist</h3>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {application.waitlistReason ||
                      "The school will notify you if a spot becomes available."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-[#17201D]">Application Timeline</h2>
            </div>
            <div className="p-6">
              <Timeline application={application} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/schools">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <SearchIcon className="h-4 w-4" />
                Browse More Schools
              </Button>
            </Link>
            <Link href={`/schools/${schoolId}/apply/success?applicationId=${application.id}`}>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <ExternalLink className="h-4 w-4" />
                View Success Page
              </Button>
            </Link>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-text-secondary pt-4">
            Keep your reference ID safe. You&apos;ll need it to check your status anytime.
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-sm font-medium text-[#17201D] wrap-break-word ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function BigStatusCard({ application }: { application: AdmissionApplication }) {
  const status = application.status;

  const config: Record<
    string,
    { bg: string; border: string; icon: React.ReactNode; title: string; desc: string }
  > = {
    pending: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <Clock className="h-8 w-8 text-amber-600" />,
      title: 'Application Pending',
      desc: 'Your application is waiting to be reviewed by the school.',
    },
    under_review: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: 'Under Review',
      desc: 'The school is currently reviewing your application.',
    },
    exam_scheduled: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <CalendarClock className="h-8 w-8 text-blue-600" />,
      title: 'Entrance Exam Scheduled',
      desc: 'Please make sure your child attends the exam at the date shown below.',
    },
    exam_completed: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      icon: <ListChecks className="h-8 w-8 text-cyan-600" />,
      title: 'Exam Completed',
      desc: 'The exam has been taken. The school will review the results and get in touch.',
    },
    waitlisted: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      icon: <Clock className="h-8 w-8 text-slate-600" />,
      title: 'Waitlisted',
      desc: 'Your application is on the waitlist. We will notify you if a spot opens up.',
    },
    approved: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle2 className="h-8 w-8 text-green-600" />,
      title: 'Application Approved!',
      desc: 'Congratulations! Check your email for parent and student login details.',
    },
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="h-8 w-8 text-red-600" />,
      title: 'Application Not Accepted',
      desc: 'Unfortunately your application was not successful at this time.',
    },
    withdrawn: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: <Ban className="h-8 w-8 text-gray-600" />,
      title: 'Application Withdrawn',
      desc: 'This application has been withdrawn.',
    },
  };

  const c = config[status] || config.pending;

  return (
    <div className={`rounded-2xl border p-6 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">{c.icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-[#17201D] mb-1">{c.title}</h2>
          <p className="text-sm text-[#17201D]/80">{c.desc}</p>
        </div>
      </div>
    </div>
  );
}

function Timeline({ application }: { application: AdmissionApplication }) {
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

  steps.push({
    icon: <FileText className="h-4 w-4" />,
    title: 'Application Submitted',
    description: `Received on ${formatDate(submittedAt)}`,
    state: 'complete',
  });

  if (status === 'pending') {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'School Review',
      description: 'The school is reviewing your application',
      state: 'current',
    });
  } else if (
    ['under_review', 'exam_scheduled', 'exam_completed', 'waitlisted', 'approved', 'rejected'].includes(
      status
    )
  ) {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'School Review',
      description: `Reviewed on ${reviewedAt ? formatDate(reviewedAt) : 'N/A'}`,
      state: 'complete',
    });
  }

  if (['exam_scheduled', 'exam_completed'].includes(status)) {
    steps.push({
      icon: <CalendarClock className="h-4 w-4" />,
      title: 'Entrance Exam',
      description:
        status === 'exam_scheduled'
          ? `Scheduled for ${examDate ? formatDate(examDate) : 'TBD'}`
          : `Completed${application.examResult ? ` — ${application.examResult}` : ''}`,
      state: status === 'exam_scheduled' ? 'current' : 'complete',
    });
  }

  if (status === 'approved') {
    steps.push({
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: 'Approved — Accounts Created',
      description: 'Check your email for login credentials.',
      state: 'complete',
    });
  } else if (status === 'rejected') {
    steps.push({
      icon: <XCircle className="h-4 w-4" />,
      title: 'Application Rejected',
      description: application.rejectionReason || 'See email for details.',
      state: 'failed',
    });
  } else if (status === 'waitlisted') {
    steps.push({
      icon: <Clock className="h-4 w-4" />,
      title: 'Waitlisted',
      description:
        application.waitlistReason || 'Will notify if a spot opens up.',
      state: 'current',
    });
  } else if (status === 'withdrawn') {
    steps.push({
      icon: <Ban className="h-4 w-4" />,
      title: 'Withdrawn',
      description: 'This application has been withdrawn.',
      state: 'failed',
    });
  } else {
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