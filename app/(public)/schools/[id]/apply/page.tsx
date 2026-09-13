/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/schools/[id]/apply/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  School2,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPublicSchoolDetail,
  submitAdmissionApplication,
  type PublicSchoolDetail,
} from '@/lib/services/publicsService';

// ============================================
// FORM STATE
// ============================================

interface FormState {
  // Parent
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: 'father' | 'mother' | 'guardian' | 'other';
  // Student
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth: string;
  studentGender: '' | 'male' | 'female' | 'other';
  desiredLevel: string;
  previousSchool: string;
  // Other
  notes: string;
}

const INITIAL_FORM: FormState = {
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  parentRelationship: 'father',
  studentFirstName: '',
  studentLastName: '',
  studentDateOfBirth: '',
  studentGender: '',
  desiredLevel: '',
  previousSchool: '',
  notes: '',
};

// ============================================
// VALIDATION
// ============================================

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};

  if (!form.parentFirstName.trim()) errors.parentFirstName = 'Required';
  if (!form.parentLastName.trim()) errors.parentLastName = 'Required';

  if (!form.parentEmail.trim()) {
    errors.parentEmail = 'Required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim())) {
    errors.parentEmail = 'Enter a valid email address';
  }

  if (!form.parentPhone.trim()) {
    errors.parentPhone = 'Required';
  } else if (form.parentPhone.replace(/\D/g, '').length < 9) {
    errors.parentPhone = 'Enter a valid phone number';
  }

  if (!form.studentFirstName.trim()) errors.studentFirstName = 'Required';
  if (!form.studentLastName.trim()) errors.studentLastName = 'Required';
  if (!form.desiredLevel) errors.desiredLevel = 'Please select a level';

  return errors;
}

// ============================================
// HELPERS
// ============================================

function formatLevel(level: string): string {
  return level
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================
// PAGE
// ============================================

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const schoolId = params?.id as string;

  const [school, setSchool] = useState<PublicSchoolDetail | null>(null);
  const [schoolLoading, setSchoolLoading] = useState(true);
  const [schoolError, setSchoolError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ============================================
  // LOAD SCHOOL
  // ============================================
  useEffect(() => {
    if (!schoolId) return;

    let mounted = true;
    setSchoolLoading(true);
    setSchoolError(null);

    (async () => {
      try {
        const data = await getPublicSchoolDetail(schoolId);
        if (mounted) setSchool(data);
      } catch (err: any) {
        if (!mounted) return;
        setSchoolError(
          err?.response?.data?.error?.message || 'Failed to load school'
        );
      } finally {
        if (mounted) setSchoolLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [schoolId]);

  // ============================================
  // FIELD HANDLERS
  // ============================================
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const newErrors = validate({ ...form, [key]: value });
      setErrors((prev) => ({ ...prev, [key]: newErrors[key] }));
    }
  };

  const handleBlur = (key: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [key]: newErrors[key] }));
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(form);
    setErrors(validationErrors);
    setTouched(
      Object.keys(form).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as Partial<Record<keyof FormState, boolean>>
      )
    );

    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitAdmissionApplication(schoolId, {
        parentFirstName: form.parentFirstName.trim(),
        parentLastName: form.parentLastName.trim(),
        parentEmail: form.parentEmail.trim().toLowerCase(),
        parentPhone: form.parentPhone.trim(),
        parentRelationship: form.parentRelationship,
        studentFirstName: form.studentFirstName.trim(),
        studentLastName: form.studentLastName.trim(),
        studentDateOfBirth: form.studentDateOfBirth || undefined,
        studentGender: form.studentGender || undefined,
        desiredLevel: form.desiredLevel,
        previousSchool: form.previousSchool.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      // Redirect to success page with application ID
      router.push(
        `/schools/${schoolId}/apply/success?applicationId=${result.application.id}`
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to submit application. Please try again.';
      setSubmitError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#0B6B4F]" />
      </div>
    );
  }

  // ============================================
  // SCHOOL ERROR
  // ============================================
  if (schoolError || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#17201D] mb-2">
            Cannot Load School
          </h1>
          <p className="text-text-secondary mb-6">
            {schoolError || 'This school is not available for applications.'}
          </p>
          <Link href="/schools">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // FORM
  // ============================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="container px-4 mx-auto py-8">
          <Link
            href={`/schools/${school.id}`}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-[#0B6B4F] transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to school
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center shrink-0">
              <School2 className="h-6 w-6 text-[#0B6B4F]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#17201D]">
                Apply for Admission
              </h1>
              <p className="text-text-secondary mt-1">
                Applying to{' '}
                <span className="font-medium text-[#17201D]">
                  {school.name}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-10">
        <div className="container px-4 mx-auto max-w-3xl">
          {/* Submit error banner */}
          {submitError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  Could not submit application
                </p>
                <p className="text-sm text-red-700 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* ============================================ */}
            {/* PARENT INFORMATION */}
            {/* ============================================ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#0B6B4F]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#17201D]">
                    Parent / Guardian Information
                  </h2>
                  <p className="text-xs text-text-secondary">
                    The person responsible for this child
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label="First Name"
                  required
                  error={touched.parentFirstName ? errors.parentFirstName : undefined}
                  fieldKey="parentFirstName"
                >
                  <input
                    type="text"
                    value={form.parentFirstName}
                    onChange={(e) => updateField('parentFirstName', e.target.value)}
                    onBlur={() => handleBlur('parentFirstName')}
                    placeholder="Kwame"
                    className="input"
                  />
                </Field>

                <Field
                  label="Last Name"
                  required
                  error={touched.parentLastName ? errors.parentLastName : undefined}
                  fieldKey="parentLastName"
                >
                  <input
                    type="text"
                    value={form.parentLastName}
                    onChange={(e) => updateField('parentLastName', e.target.value)}
                    onBlur={() => handleBlur('parentLastName')}
                    placeholder="Mensah"
                    className="input"
                  />
                </Field>

                <Field
                  label="Email Address"
                  required
                  error={touched.parentEmail ? errors.parentEmail : undefined}
                  fieldKey="parentEmail"
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input
                      type="email"
                      value={form.parentEmail}
                      onChange={(e) => updateField('parentEmail', e.target.value)}
                      onBlur={() => handleBlur('parentEmail')}
                      placeholder="kwame@example.com"
                      className="input pl-10"
                    />
                  </div>
                </Field>

                <Field
                  label="Phone Number"
                  required
                  error={touched.parentPhone ? errors.parentPhone : undefined}
                  fieldKey="parentPhone"
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input
                      type="tel"
                      value={form.parentPhone}
                      onChange={(e) => updateField('parentPhone', e.target.value)}
                      onBlur={() => handleBlur('parentPhone')}
                      placeholder="+233 50 123 4567"
                      className="input pl-10"
                    />
                  </div>
                </Field>

                <Field label="Relationship to Student" required fieldKey="parentRelationship">
                  <select
                    value={form.parentRelationship}
                    onChange={(e) =>
                      updateField(
                        'parentRelationship',
                        e.target.value as FormState['parentRelationship']
                      )
                    }
                    className="input"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ============================================ */}
            {/* STUDENT INFORMATION */}
            {/* ============================================ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-[#0B6B4F]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#17201D]">
                    Student Information
                  </h2>
                  <p className="text-xs text-text-secondary">
                    The child you&apos;re applying for
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label="First Name"
                  required
                  error={touched.studentFirstName ? errors.studentFirstName : undefined}
                  fieldKey="studentFirstName"
                >
                  <input
                    type="text"
                    value={form.studentFirstName}
                    onChange={(e) => updateField('studentFirstName', e.target.value)}
                    onBlur={() => handleBlur('studentFirstName')}
                    placeholder="Ama"
                    className="input"
                  />
                </Field>

                <Field
                  label="Last Name"
                  required
                  error={touched.studentLastName ? errors.studentLastName : undefined}
                  fieldKey="studentLastName"
                >
                  <input
                    type="text"
                    value={form.studentLastName}
                    onChange={(e) => updateField('studentLastName', e.target.value)}
                    onBlur={() => handleBlur('studentLastName')}
                    placeholder="Mensah"
                    className="input"
                  />
                </Field>

                <Field label="Date of Birth" fieldKey="studentDateOfBirth">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <input
                      type="date"
                      value={form.studentDateOfBirth}
                      onChange={(e) => updateField('studentDateOfBirth', e.target.value)}
                      className="input pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </Field>

                <Field label="Gender" fieldKey="studentGender">
                  <select
                    value={form.studentGender}
                    onChange={(e) =>
                      updateField('studentGender', e.target.value as FormState['studentGender'])
                    }
                    className="input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field
                  label="Desired Level / Class"
                  required
                  error={touched.desiredLevel ? errors.desiredLevel : undefined}
                  fieldKey="desiredLevel"
                >
                  <select
                    value={form.desiredLevel}
                    onChange={(e) => updateField('desiredLevel', e.target.value)}
                    onBlur={() => handleBlur('desiredLevel')}
                    className="input"
                  >
                    <option value="">Select a level</option>
                    {school.availableLevels.length > 0 ? (
                      school.availableLevels.map((level) => (
                        <option key={level} value={level}>
                          {formatLevel(level)}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="basic_1">Basic 1</option>
                        <option value="basic_2">Basic 2</option>
                        <option value="basic_3">Basic 3</option>
                        <option value="basic_4">Basic 4</option>
                        <option value="basic_5">Basic 5</option>
                        <option value="basic_6">Basic 6</option>
                        <option value="jhs_1">JHS 1</option>
                        <option value="jhs_2">JHS 2</option>
                        <option value="jhs_3">JHS 3</option>
                      </>
                    )}
                  </select>
                </Field>

                <Field label="Previous School (optional)" fieldKey="previousSchool">
                  <input
                    type="text"
                    value={form.previousSchool}
                    onChange={(e) => updateField('previousSchool', e.target.value)}
                    placeholder="Name of previous school"
                    className="input"
                  />
                </Field>
              </div>
            </div>

            {/* ============================================ */}
            {/* ADDITIONAL NOTES */}
            {/* ============================================ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-[#17201D]">
                  Additional Notes (optional)
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Anything you&apos;d like the school to know
                </p>
              </div>
              <div className="p-6">
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any relevant information (medical, special needs, etc.)"
                  rows={4}
                  className="input resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-text-secondary mt-1 text-right">
                  {form.notes.length}/500
                </p>
              </div>
            </div>

            {/* ============================================ */}
            {/* SUBMIT */}
            {/* ============================================ */}
            <div className="bg-[#0B6B4F]/5 rounded-2xl border border-[#0B6B4F]/20 p-6">
              <div className="flex items-start gap-3 mb-5">
                <CheckCircle2 className="h-5 w-5 text-[#0B6B4F] shrink-0 mt-0.5" />
                <div className="text-sm text-text-secondary">
                  By submitting this application, you confirm that the
                  information provided is accurate. The school will review your                  application and contact you via email.
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white py-6 text-base rounded-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Inline input styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          outline: none;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          background: white;
          color: #17201d;
        }
        .input:focus {
          border-color: #0b6b4f;
          box-shadow: 0 0 0 3px rgba(11, 107, 79, 0.1);
        }
      `}</style>
    </div>
  );
}

// ============================================
// FIELD WRAPPER
// ============================================

function Field({
  label,
  required,
  error,
  fieldKey,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  fieldKey: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={fieldKey}>
      <label className="block text-sm font-medium text-[#17201D] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}