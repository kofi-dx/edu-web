/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  GraduationCap,
  ArrowRight,
  Loader2,
  CheckCircle,
  Info,
  School,
  User,
  Mail,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  submitGovernmentApplication,
  submitPrivateApplication,
  GHANA_REGIONS,
  SCHOOL_LEVELS,
  PAYMENT_PLANS,
  type GovernmentApplicationData,
  type PrivateApplicationData
} from '@/lib/services/publicService';

// ============================================
// TYPES
// ============================================

type Tab = 'government' | 'private';

interface GovernmentFormData {
  schoolName: string;
  gesCode: string;
  district: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  headteacherName: string;
  headteacherEmail: string;
  headteacherPhone: string;
  schoolLevel: 'primary' | 'jhs' | 'shs' | 'combined' | '';
}

interface PrivateFormData {
  schoolName: string;
  district: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  schoolLevel: 'primary' | 'jhs' | 'shs' | 'combined' | '';
  paymentPlan: 'basic' | 'premium' | 'enterprise';
  registrationCertificate: string;
  businessLicense: string;
  taxClearance: string;
}

// ============================================
// COMPONENT
// ============================================

export default function SchoolApplicationPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('government');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Government form
  const [govtForm, setGovtForm] = useState<GovernmentFormData>({
    schoolName: '',
    gesCode: '',
    district: '',
    region: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    headteacherName: '',
    headteacherEmail: '',
    headteacherPhone: '',
    schoolLevel: '',
  });

  // Private form
  const [privateForm, setPrivateForm] = useState<PrivateFormData>({
    schoolName: '',
    district: '',
    region: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    schoolLevel: '',
    paymentPlan: 'basic',
    registrationCertificate: '',
    businessLicense: '',
    taxClearance: '',
  });

  // ============================================
  // HANDLERS
  // ============================================

  const handleGovtChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setGovtForm({ ...govtForm, [e.target.name]: e.target.value });
  };

  const handlePrivateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setPrivateForm({ ...privateForm, [e.target.name]: e.target.value });
  };

  const validateGovt = (): string | null => {
    if (!govtForm.schoolName.trim()) return 'School name is required';
    if (!govtForm.gesCode.trim()) return 'GES code is required';
    if (!/^[A-Z]{3}-[0-9]{5}$/.test(govtForm.gesCode)) {
      return 'GES code must be in format ABC-12345';
    }
    if (!govtForm.district.trim()) return 'District is required';
    if (!govtForm.region) return 'Region is required';
    if (!govtForm.address.trim()) return 'Address is required';
    if (!govtForm.contactEmail.trim()) return 'Contact email is required';
    if (!govtForm.contactPhone.trim()) return 'Contact phone is required';
    if (!/^[0-9]{10,15}$/.test(govtForm.contactPhone)) {
      return 'Contact phone must be 10-15 digits';
    }
    if (!govtForm.headteacherName.trim()) return 'Headteacher name is required';
    if (!govtForm.headteacherEmail.trim()) return 'Headteacher email is required';
    if (!govtForm.headteacherPhone.trim()) return 'Headteacher phone is required';
    if (!/^[0-9]{10,15}$/.test(govtForm.headteacherPhone)) {
      return 'Headteacher phone must be 10-15 digits';
    }
    if (!govtForm.schoolLevel) return 'School level is required';
    return null;
  };

  const validatePrivate = (): string | null => {
    if (!privateForm.schoolName.trim()) return 'School name is required';
    if (!privateForm.district.trim()) return 'District is required';
    if (!privateForm.region) return 'Region is required';
    if (!privateForm.address.trim()) return 'Address is required';
    if (!privateForm.contactEmail.trim()) return 'Contact email is required';
    if (!privateForm.contactPhone.trim()) return 'Contact phone is required';
    if (!/^[0-9]{10,15}$/.test(privateForm.contactPhone)) {
      return 'Contact phone must be 10-15 digits';
    }
    if (!privateForm.directorName.trim()) return 'Director name is required';
    if (!privateForm.directorEmail.trim()) return 'Director email is required';
    if (!privateForm.directorPhone.trim()) return 'Director phone is required';
    if (!/^[0-9]{10,15}$/.test(privateForm.directorPhone)) {
      return 'Director phone must be 10-15 digits';
    }
    if (!privateForm.schoolLevel) return 'School level is required';
    return null;
  };

  const handleGovtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    const error = validateGovt();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const payload: GovernmentApplicationData = {
        schoolName: govtForm.schoolName.trim(),
        gesCode: govtForm.gesCode.trim().toUpperCase(),
        district: govtForm.district.trim(),
        region: govtForm.region,
        address: govtForm.address.trim(),
        contactEmail: govtForm.contactEmail.trim().toLowerCase(),
        contactPhone: govtForm.contactPhone.trim(),
        headteacherName: govtForm.headteacherName.trim(),
        headteacherEmail: govtForm.headteacherEmail.trim().toLowerCase(),
        headteacherPhone: govtForm.headteacherPhone.trim(),
        schoolLevel: govtForm.schoolLevel as any,
      };

      const result = await submitGovernmentApplication(payload);

      toast.success('Application submitted successfully!');

      // Redirect to success page
      router.push(
        `/register/success?id=${result.applicationId}&name=${encodeURIComponent(
          govtForm.schoolName
        )}&type=public`
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        'Failed to submit application. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    const error = validatePrivate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const payload: PrivateApplicationData = {
        schoolName: privateForm.schoolName.trim(),
        district: privateForm.district.trim(),
        region: privateForm.region,
        address: privateForm.address.trim(),
        contactEmail: privateForm.contactEmail.trim().toLowerCase(),
        contactPhone: privateForm.contactPhone.trim(),
        directorName: privateForm.directorName.trim(),
        directorEmail: privateForm.directorEmail.trim().toLowerCase(),
        directorPhone: privateForm.directorPhone.trim(),
        schoolLevel: privateForm.schoolLevel as any,
        paymentPlan: privateForm.paymentPlan,
        registrationCertificate: privateForm.registrationCertificate.trim() || undefined,
        businessLicense: privateForm.businessLicense.trim() || undefined,
        taxClearance: privateForm.taxClearance.trim() || undefined,
      };

      const result = await submitPrivateApplication(payload);

      toast.success('Application submitted successfully!');

      // Redirect to success page
      router.push(
        `/register/success?id=${result.applicationId}&name=${encodeURIComponent(
          privateForm.schoolName
        )}&type=private`
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        'Failed to submit application. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-background">

      {/* Main */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-akoma-green/10 flex items-center justify-center mx-auto mb-4">
            
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <School className="h-8 w-8 text-akoma-green" />
          </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">
            Register Your School
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Join Ghana&apos;s digital education platform and unlock modern tools
            for your teachers, students, and parents.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Before you begin
              </p>
              <ul className="text-xs text-blue-700 mt-1 space-y-0.5 list-disc list-inside">
                <li>Applications are reviewed within 1-2 business days</li>
                <li>You&apos;ll receive login credentials by email once approved</li>
                <li>Government schools register for free</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('government')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'government'
                    ? 'text-akoma-green'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Government School
                {activeTab === 'government' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-akoma-green" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('private')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'private'
                    ? 'text-akoma-green'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Private School
                {activeTab === 'private' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-akoma-green" />
                )}
              </button>
            </div>
          </div>

          {/* Government Form */}
          {activeTab === 'government' && (
            <form onSubmit={handleGovtSubmit} className="p-6 md:p-8 space-y-6">
              {/* School Information */}
              <FormSection
                title="School Information"
                icon={School}
                description="Basic details about your school"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="School Name"
                    name="schoolName"
                    value={govtForm.schoolName}
                    onChange={handleGovtChange}
                    placeholder="e.g., Achimota Basic School"
                    required
                    className="md:col-span-2"
                  />
                  <FormInput
                    label="GES Code"
                    name="gesCode"
                    value={govtForm.gesCode}
                    onChange={handleGovtChange}
                    placeholder="ABC-12345"
                    hint="Format: 3 letters, dash, 5 digits"
                    required
                  />
                  <FormSelect
                    label="School Level"
                    name="schoolLevel"
                    value={govtForm.schoolLevel}
                    onChange={handleGovtChange}
                    options={SCHOOL_LEVELS.map((l) => ({
                      value: l.value,
                      label: l.label,
                    }))}
                    placeholder="Select school level"
                    required
                  />
                  <FormSelect
                    label="Region"
                    name="region"
                    value={govtForm.region}
                    onChange={handleGovtChange}
                    options={GHANA_REGIONS.map((r) => ({
                      value: r,
                      label: r,
                    }))}
                    placeholder="Select region"
                    required
                  />
                  <FormInput
                    label="District"
                    name="district"
                    value={govtForm.district}
                    onChange={handleGovtChange}
                    placeholder="e.g., Accra Metropolitan"
                    required
                  />
                  <div className="md:col-span-2">
                    <FormTextarea
                      label="Address"
                      name="address"
                      value={govtForm.address}
                      onChange={handleGovtChange}
                      placeholder="Full physical address of the school"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </FormSection>

              {/* Contact Information */}
              <FormSection
                title="Contact Information"
                icon={Mail}
                description="How we can reach the school"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={govtForm.contactEmail}
                    onChange={handleGovtChange}
                    placeholder="school@example.com"
                    required
                  />
                  <FormInput
                    label="Contact Phone"
                    name="contactPhone"
                    type="tel"
                    value={govtForm.contactPhone}
                    onChange={handleGovtChange}
                    placeholder="0244123456"
                    hint="10-15 digits"
                    required
                  />
                </div>
              </FormSection>

              {/* Headteacher Information */}
              <FormSection
                title="Headteacher Information"
                icon={User}
                description="The headteacher will become the school admin account"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Headteacher Name"
                    name="headteacherName"
                    value={govtForm.headteacherName}
                    onChange={handleGovtChange}
                    placeholder="e.g., Mr. Kwame Mensah"
                    required
                    className="md:col-span-2"
                  />
                  <FormInput
                    label="Headteacher Email"
                    name="headteacherEmail"
                    type="email"
                    value={govtForm.headteacherEmail}
                    onChange={handleGovtChange}
                    placeholder="headteacher@example.com"
                    hint="Login credentials will be sent here"
                    required
                  />
                  <FormInput
                    label="Headteacher Phone"
                    name="headteacherPhone"
                    type="tel"
                    value={govtForm.headteacherPhone}
                    onChange={handleGovtChange}
                    placeholder="0244123456"
                    hint="10-15 digits"
                    required
                  />
                </div>
              </FormSection>

              {/* Terms */}
              <TermsCheckbox
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
              />

              {/* Submit */}
              <SubmitButton
                loading={loading}
                text="Submit Government Application"
              />
            </form>
          )}

          {/* Private Form */}
          {activeTab === 'private' && (
            <form onSubmit={handlePrivateSubmit} className="p-6 md:p-8 space-y-6">
              {/* School Information */}
              <FormSection
                title="School Information"
                icon={School}
                description="Basic details about your school"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="School Name"
                    name="schoolName"
                    value={privateForm.schoolName}
                    onChange={handlePrivateChange}
                    placeholder="e.g., Bright Future Academy"
                    required
                    className="md:col-span-2"
                  />
                  <FormSelect
                    label="School Level"
                    name="schoolLevel"
                    value={privateForm.schoolLevel}
                    onChange={handlePrivateChange}
                    options={SCHOOL_LEVELS.map((l) => ({
                      value: l.value,
                      label: l.label,
                    }))}
                    placeholder="Select school level"
                    required
                  />
                  <FormSelect
                    label="Region"
                    name="region"
                    value={privateForm.region}
                    onChange={handlePrivateChange}
                    options={GHANA_REGIONS.map((r) => ({
                      value: r,
                      label: r,
                    }))}
                    placeholder="Select region"
                    required
                  />
                  <FormInput
                    label="District"
                    name="district"
                    value={privateForm.district}
                    onChange={handlePrivateChange}
                    placeholder="e.g., Accra Metropolitan"
                    required
                  />
                  <div className="md:col-span-2">
                    <FormTextarea
                      label="Address"
                      name="address"
                      value={privateForm.address}
                      onChange={handlePrivateChange}
                      placeholder="Full physical address of the school"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </FormSection>

              {/* Contact Information */}
              <FormSection
                title="Contact Information"
                icon={Mail}
                description="How we can reach the school"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={privateForm.contactEmail}
                    onChange={handlePrivateChange}
                    placeholder="school@example.com"
                    required
                  />
                  <FormInput
                    label="Contact Phone"
                    name="contactPhone"
                    type="tel"
                    value={privateForm.contactPhone}
                    onChange={handlePrivateChange}
                    placeholder="0244123456"
                    hint="10-15 digits"
                    required
                  />
                </div>
              </FormSection>

              {/* Director Information */}
              <FormSection
                title="Director Information"
                icon={User}
                description="The director will become the school admin account"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Director Name"
                    name="directorName"
                    value={privateForm.directorName}
                    onChange={handlePrivateChange}
                    placeholder="e.g., Mrs. Ama Owusu"
                    required
                    className="md:col-span-2"
                  />
                  <FormInput
                    label="Director Email"
                    name="directorEmail"
                    type="email"
                    value={privateForm.directorEmail}
                    onChange={handlePrivateChange}
                    placeholder="director@example.com"
                    hint="Login credentials will be sent here"
                    required
                  />
                  <FormInput
                    label="Director Phone"
                    name="directorPhone"
                    type="tel"
                    value={privateForm.directorPhone}
                    onChange={handlePrivateChange}
                    placeholder="0244123456"
                    hint="10-15 digits"
                    required
                  />
                </div>
              </FormSection>

              {/* Payment Plan */}
              <FormSection
                title="Payment Plan"
                icon={FileText}
                description="Choose a plan that fits your school"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PAYMENT_PLANS.map((plan) => (
                    <button
                      key={plan.value}
                      type="button"
                      onClick={() =>
                        setPrivateForm({
                          ...privateForm,
                          paymentPlan: plan.value,
                        })
                      }
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        privateForm.paymentPlan === plan.value
                          ? 'border-akoma-green bg-akoma-green/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-text capitalize">
                          {plan.label}
                        </p>
                        {privateForm.paymentPlan === plan.value && (
                          <CheckCircle className="h-4 w-4 text-akoma-green" />
                        )}
                      </div>
                      <p className="text-lg font-bold text-akoma-green mb-1">
                        {plan.price}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {plan.description}
                      </p>
                    </button>
                  ))}
                </div>
              </FormSection>

              {/* Documents (Optional) */}
              <FormSection
                title="Documents (Optional)"
                icon={FileText}
                description="You can upload documents later, or paste links now"
              >
                <div className="space-y-4">
                  <FormInput
                    label="Registration Certificate URL"
                    name="registrationCertificate"
                    value={privateForm.registrationCertificate}
                    onChange={handlePrivateChange}
                    placeholder="https://..."
                    type="url"
                  />
                  <FormInput
                    label="Business License URL"
                    name="businessLicense"
                    value={privateForm.businessLicense}
                    onChange={handlePrivateChange}
                    placeholder="https://..."
                    type="url"
                  />
                  <FormInput
                    label="Tax Clearance URL"
                    name="taxClearance"
                    value={privateForm.taxClearance}
                    onChange={handlePrivateChange}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </FormSection>

              {/* Terms */}
              <TermsCheckbox
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
              />

              {/* Submit */}
              <SubmitButton
                loading={loading}
                text="Submit Private Application"
              />
            </form>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-akoma-green hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

function FormSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-akoma-green" />
        </div>
        <div>
          <h3 className="font-semibold text-text">{title}</h3>
          {description && (
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
      />
      {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none text-sm"
      />
    </div>
  );
}

function TermsCheckbox({
  agreeTerms,
  setAgreeTerms,
}: {
  agreeTerms: boolean;
  setAgreeTerms: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <input
        type="checkbox"
        checked={agreeTerms}
        onChange={(e) => setAgreeTerms(e.target.checked)}
        className="mt-0.5 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
      />
      <label className="text-sm text-text-secondary">
        I confirm that the information provided is accurate and I agree to
        Akoma Edu&apos;s{' '}
        <Link href="/terms" className="text-akoma-green hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-akoma-green hover:underline">
          Privacy Policy
        </Link>
        . I understand that providing false information may result in
        rejection.
      </label>
    </div>
  );
}

function SubmitButton({
  loading,
  text,
}: {
  loading: boolean;
  text: string;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="w-full bg-akoma-green hover:bg-akoma-dark text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          {text}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}