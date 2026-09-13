/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  MapPin,
  Briefcase,
  Building2,
  CreditCard,
  CheckCircle,
  XCircle,
  School,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTeacherById, deleteTeacher, type Teacher } from '@/lib/services/schoolAdminService';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const data = await getTeacherById(teacherId);
      setTeacher(data);
    } catch (error: any) {
      console.error('Failed to fetch teacher:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load teacher details');
      router.push('/school/teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;
    
    setActionLoading(true);
    try {
      await deleteTeacher(teacher.id);
      toast.success('Teacher removed successfully');
      router.push('/school/teachers');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove teacher');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
        <XCircle className="h-4 w-4" />
        Inactive
      </span>
    );
  };

  const getEmploymentBadge = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      full_time: { color: 'bg-blue-100 text-blue-700', label: 'Full Time' },
      part_time: { color: 'bg-purple-100 text-purple-700', label: 'Part Time' },
      contract: { color: 'bg-orange-100 text-orange-700', label: 'Contract' },
      volunteer: { color: 'bg-green-100 text-green-700', label: 'Volunteer' },
    };
    const config = configs[type] || configs.full_time;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-akoma-green animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Teacher not found</p>
        <Link href="/school/teachers">
          <Button variant="outline" className="mt-4">
            Back to Teachers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/school/teachers" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Teachers
        </Link>
        <div className="flex gap-2">
          <Link href={`/school/teachers/${teacher.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-akoma-green">
                {teacher.user.firstName?.[0]}{teacher.user.lastName?.[0] || ''}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    {teacher.user.firstName} {teacher.user.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-text-secondary">
                      <span className="font-mono">{teacher.employeeNumber}</span>
                    </span>
                    {getStatusBadge(teacher.isActive)}
                    {getEmploymentBadge(teacher.employmentType)}
                  </div>
                </div>
                <div className="text-sm text-text-secondary text-right">
                  <p>Hired: {formatDate(teacher.hiredAt)}</p>
                  <p>{teacher.experience || 0} years experience</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  <a href={`mailto:${teacher.user.email}`} className="text-akoma-green hover:underline">
                    {teacher.user.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-text-secondary" />
                  <a href={`tel:${teacher.user.phone}`} className="text-text hover:text-akoma-green">
                    {teacher.user.phone}
                  </a>
                </div>
                {teacher.district && teacher.region && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-text-secondary" />
                    <span className="text-text">{teacher.district}, {teacher.region}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Classes</p>
          <p className="text-2xl font-bold text-text">{teacher.classes?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Subjects</p>
          <p className="text-2xl font-bold text-text">{teacher.subjects?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Experience</p>
          <p className="text-2xl font-bold text-text">{teacher.experience || 0} yrs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Specializations</p>
          <p className="text-2xl font-bold text-text">{teacher.specializations?.length || 0}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Personal Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Full Name</dt>
              <dd className="text-text font-medium">{teacher.user.firstName} {teacher.user.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Date of Birth</dt>
              <dd className="text-text">{formatDate(teacher.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Gender</dt>
              <dd className="text-text">{getGenderLabel(teacher.gender)}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Nationality</dt>
              <dd className="text-text">{teacher.nationality || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Ghana Card Number</dt>
              <dd className="text-text font-mono">{teacher.ghanaCardNumber || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-akoma-green" />
            Contact Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Email</dt>
              <dd className="text-text">
                <a href={`mailto:${teacher.user.email}`} className="text-akoma-green hover:underline">
                  {teacher.user.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Phone</dt>
              <dd className="text-text">
                <a href={`tel:${teacher.user.phone}`} className="text-text hover:text-akoma-green">
                  {teacher.user.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Address</dt>
              <dd className="text-text">{teacher.address || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">District</dt>
              <dd className="text-text">{teacher.district || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Region</dt>
              <dd className="text-text">{teacher.region || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Emergency Contact</dt>
              <dd className="text-text">
                {teacher.emergencyContactName || 'Not specified'}
                {teacher.emergencyContactPhone && ` (${teacher.emergencyContactPhone})`}
              </dd>
            </div>
          </dl>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-akoma-green" />
            Professional Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Qualifications</dt>
              <dd className="text-text">{teacher.qualifications || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Specializations</dt>
              <dd className="text-text">
                {teacher.specializations && teacher.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.specializations.map((spec) => (
                      <span key={spec} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Subjects Taught</dt>
              <dd className="text-text">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.subjects.map((subject) => (
                      <span key={subject} className="px-2 py-0.5 bg-akoma-green/10 text-akoma-green rounded text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Experience</dt>
              <dd className="text-text">{teacher.experience || 0} years</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Employment Type</dt>
              <dd className="text-text">{getEmploymentBadge(teacher.employmentType)}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Employee Number</dt>
              <dd className="text-text font-mono">{teacher.employeeNumber}</dd>
            </div>
          </dl>
        </div>

        {/* GES Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-akoma-green" />
            GES Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">GES Number</dt>
              <dd className="text-text font-mono">{teacher.gesNumber || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">GES Status</dt>
              <dd className="text-text">
                {teacher.gesStatus ? (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    teacher.gesStatus === 'active' ? 'bg-green-100 text-green-700' :
                    teacher.gesStatus === 'transferred' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {teacher.gesStatus.charAt(0).toUpperCase() + teacher.gesStatus.slice(1)}
                  </span>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">NTC License Number</dt>
              <dd className="text-text font-mono">{teacher.ntcLicenseNumber || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">NTC License Expiry</dt>
              <dd className="text-text">{formatDate(teacher.ntcLicenseExpiry)}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Class Teacher</dt>
              <dd className="text-text">
                {teacher.classTeacher ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <XCircle className="h-4 w-4" />
                    No
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Bank Details (Premium) */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-akoma-green" />
            Bank Details
          </h3>
          <p className="text-sm text-text-secondary mb-4">For payroll processing</p>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Bank Name</dt>
              <dd className="text-text">{teacher.bankName || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Bank Branch</dt>
              <dd className="text-text">{teacher.bankBranch || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Account Number</dt>
              <dd className="text-text font-mono">{teacher.accountNumber || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Account Name</dt>
              <dd className="text-text">{teacher.accountName || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Classes Assigned */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <School className="h-5 w-5 text-akoma-green" />
            Classes Assigned
          </h3>
          {teacher.classes && teacher.classes.length > 0 ? (
            <ul className="space-y-2">
              {teacher.classes.map((cls) => (
                <li key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text">{cls.name}</p>
                    <p className="text-xs text-text-secondary">{cls.level}</p>
                  </div>
                  <Link href={`/school/classes/${cls.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary">No classes assigned</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Teacher</h3>
                <p className="text-sm text-text-secondary">
                  Remove {teacher.user.firstName} {teacher.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this teacher? This action cannot be undone.
              </p>
              {teacher.classes && teacher.classes.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This teacher is currently assigned to {teacher.classes.length} class(es). 
                    Please reassign these classes before removing.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={actionLoading || (teacher.classes && teacher.classes.length > 0)}
              >
                {actionLoading ? 'Removing...' : 'Remove Teacher'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}