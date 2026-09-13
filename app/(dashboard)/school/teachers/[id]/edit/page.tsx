/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  BookOpen,
  Building2,
  CreditCard,
  BadgeCheck,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Users,
  GraduationCap,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTeacherById, updateTeacher, type Teacher } from '@/lib/services/schoolAdminService';

interface FormData {
  // Personal Information
  dateOfBirth: string;
  gender: string;
  nationality: string;
  ghanaCardNumber: string;
  
  // Contact Information
  address: string;
  district: string;
  region: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Professional Information
  qualifications: string;
  specializations: string[];
  subjects: string[];
  experience: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'volunteer';
  
  // GES Information
  gesNumber: string;
  gesStatus: 'pending' | 'active' | 'transferred';
  ntcLicenseNumber: string;
  ntcLicenseExpiry: string;
  
  // Bank Details
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountName: string;
  
  // Assignment
  classTeacher: boolean;
  formClassId: string;
  
  // Status
  isActive: boolean;
}

export default function EditTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: '',
    gender: '',
    nationality: 'Ghanaian',
    ghanaCardNumber: '',
    address: '',
    district: '',
    region: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    qualifications: '',
    specializations: [],
    subjects: [],
    experience: 0,
    employmentType: 'full_time',
    gesNumber: '',
    gesStatus: 'pending',
    ntcLicenseNumber: '',
    ntcLicenseExpiry: '',
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountName: '',
    classTeacher: false,
    formClassId: '',
    isActive: true
  });
  
  const [newSubject, setNewSubject] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

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
      
      // Populate form with teacher data
      setFormData({
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        gender: data.gender || '',
        nationality: data.nationality || 'Ghanaian',
        ghanaCardNumber: data.ghanaCardNumber || '',
        address: data.address || '',
        district: data.district || '',
        region: data.region || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        qualifications: data.qualifications || '',
        specializations: data.specializations || [],
        subjects: data.subjects || [],
        experience: data.experience || 0,
        employmentType: data.employmentType || 'full_time',
        gesNumber: data.gesNumber || '',
        gesStatus: data.gesStatus || 'pending',
        ntcLicenseNumber: data.ntcLicenseNumber || '',
        ntcLicenseExpiry: data.ntcLicenseExpiry ? new Date(data.ntcLicenseExpiry).toISOString().split('T')[0] : '',
        bankName: data.bankName || '',
        bankBranch: data.bankBranch || '',
        accountNumber: data.accountNumber || '',
        accountName: data.accountName || '',
        classTeacher: data.classTeacher || false,
        formClassId: data.formClassId || '',
        isActive: data.isActive
      });
    } catch (error: any) {
      console.error('Failed to fetch teacher:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load teacher details');
      router.push('/school/teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpecialization.trim()]
      });
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (specialization: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(s => s !== specialization)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      const updateData: any = {
        // Personal
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        nationality: formData.nationality || 'Ghanaian',
        ghanaCardNumber: formData.ghanaCardNumber || undefined,
        
        // Contact
        address: formData.address || undefined,
        district: formData.district || undefined,
        region: formData.region || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        
        // Professional
        qualifications: formData.qualifications || undefined,
        specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
        subjects: formData.subjects.length > 0 ? formData.subjects : undefined,
        experience: formData.experience,
        employmentType: formData.employmentType,
        
        // GES
        gesNumber: formData.gesNumber || undefined,
        gesStatus: formData.gesStatus || undefined,
        ntcLicenseNumber: formData.ntcLicenseNumber || undefined,
        ntcLicenseExpiry: formData.ntcLicenseExpiry || undefined,
        
        // Bank
        bankName: formData.bankName || undefined,
        bankBranch: formData.bankBranch || undefined,
        accountNumber: formData.accountNumber || undefined,
        accountName: formData.accountName || undefined,
        
        // Assignment
        classTeacher: formData.classTeacher,
        formClassId: formData.formClassId || undefined,
        
        // Status
        isActive: formData.isActive
      };

      await updateTeacher(teacherId, updateData);
      toast.success('Teacher updated successfully!');
      router.push(`/school/teachers/${teacherId}`);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to update teacher');
      }
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-4xl mx-auto">
      <Link href={`/school/teachers/${teacherId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Teacher Profile
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Teacher</h1>
          <p className="text-text-secondary">
            Editing {teacher.user.firstName} {teacher.user.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Status:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
            />
            <span className={`text-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Ghanaian"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Ghana Card Number
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  name="ghanaCardNumber"
                  value={formData.ghanaCardNumber}
                  onChange={handleChange}
                  placeholder="GHA-XXXXXXXXXX-X"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-akoma-green" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Accra"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Accra Metro"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Greater Accra"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Emergency Contact Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Emergency contact name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Emergency Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="0244987654"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-akoma-green" />
            Professional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1.5">
                Qualifications
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder="B.Ed Mathematics, M.Ed Education"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="5"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subjects & Specializations */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-akoma-green" />
            Subjects & Specializations
          </h3>
          
          {/* Subjects */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-1.5">
              Subjects Taught
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add subject (e.g., Mathematics)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubject}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-akoma-green/10 text-akoma-green rounded-full text-sm"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {formData.subjects.length === 0 && (
                <p className="text-sm text-text-secondary">No subjects added yet</p>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Specializations
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add specialization (e.g., Mathematics)"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialization();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSpecialization}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(spec)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {formData.specializations.length === 0 && (
                <p className="text-sm text-text-secondary">No specializations added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* GES Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-akoma-green" />
            GES Information
          </h3>
          <p className="text-sm text-text-secondary mb-4">For government schools</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                GES Number
              </label>
              <input
                type="text"
                name="gesNumber"
                value={formData.gesNumber}
                onChange={handleChange}
                placeholder="GES-12345"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                GES Status
              </label>
              <select
                name="gesStatus"
                value={formData.gesStatus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                NTC License Number
              </label>
              <input
                type="text"
                name="ntcLicenseNumber"
                value={formData.ntcLicenseNumber}
                onChange={handleChange}
                placeholder="TCH-67890"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                NTC License Expiry
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="date"
                  name="ntcLicenseExpiry"
                  value={formData.ntcLicenseExpiry}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-akoma-green" />
            Bank Details
          </h3>
          <p className="text-sm text-text-secondary mb-4">For payroll processing</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="GCB Bank"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Bank Branch
              </label>
              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                placeholder="Accra Main"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Full name as per bank"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-akoma-green" />
            Assignment
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="classTeacher"
                checked={formData.classTeacher}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
              />
              <span className="text-sm text-text">This teacher is a class teacher</span>
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Important Information</p>
              <ul className="text-sm text-blue-700 space-y-1 mt-1 list-disc list-inside">
                <li>Changes will be saved to the teacher&apos;s profile</li>
                <li>All fields are optional except Name, Email, Phone, and Employment Type</li>
                <li>The teacher will not be notified of profile updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t border-gray-100 pt-6">
          <Link href={`/school/teachers/${teacherId}`}>
            <Button variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}