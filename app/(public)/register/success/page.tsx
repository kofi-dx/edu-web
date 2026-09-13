/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Mail,
  GraduationCap,
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================
// COMPONENT
// ============================================

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolType, setSchoolType] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id') || '';
    const name = searchParams.get('name') || '';
    const type = searchParams.get('type') || '';

    setApplicationId(id);
    setSchoolName(name);
    setSchoolType(type);
  }, [searchParams]);

  const handleCopy = async () => {
    if (!applicationId) return;
    try {
      await navigator.clipboard.writeText(applicationId);
      setCopied(true);
      toast.success('Application ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Green Header */}
          <div className="bg-linear-to-r from-akoma-green to-green-700 p-8 text-center text-white relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Application Submitted! 🎉
            </h1>
            <p className="text-white/80 max-w-md mx-auto">
              {schoolName
                ? `${schoolName} has been successfully submitted for review.`
                : 'Your school application has been successfully submitted for review.'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Application ID */}
            {applicationId && (
              <div className="bg-akoma-green/5 border border-akoma-green/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-akoma-green" />
                  <p className="text-xs font-medium text-akoma-green uppercase tracking-wider">
                    Your Application ID
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm md:text-base font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 truncate">
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
                <p className="text-xs text-text-secondary mt-2">
                  ⚠️ Save this ID to check your application status later.
                </p>
              </div>
            )}

            {/* School Type Badge */}
            {schoolType && (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {schoolType === 'public' ? (
                    <>
                      <Building2 className="h-3.5 w-3.5" />
                      Government School Application
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-3.5 w-3.5" />
                      Private School Application
                    </>
                  )}
                </span>
              </div>
            )}

            {/* What Happens Next */}
            <div>
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-akoma-green" />
                What happens next?
              </h2>
              <div className="space-y-3">
                <StepItem
                  number={1}
                  title="Review Process"
                  description="Our team will review your application. This usually takes 1-2 business days."
                  icon={FileText}
                />
                <StepItem
                  number={2}
                  title="Approval Notification"
                  description="Once approved, login credentials will be sent to your registered email address."
                  icon={Mail}
                />
                <StepItem
                  number={3}
                  title="Access Your Dashboard"
                  description="Use the credentials to sign in and set up your school's classes, teachers, and students."
                  icon={ShieldCheck}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                  Go to Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {applicationId && (
                <Link
                  href={`/apply/status/${applicationId}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Check Status
                  </Button>
                </Link>
              )}
            </div>

            {/* Support */}
            <div className="text-center text-xs text-text-secondary pt-2">
              <p>
                Didn&apos;t receive an email?{' '}
                <Link href="/support" className="text-akoma-green hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP ITEM COMPONENT
// ============================================

function StepItem({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-akoma-green">{number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="h-3.5 w-3.5 text-text-secondary" />
          <p className="text-sm font-medium text-text">{title}</p>
        </div>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
}