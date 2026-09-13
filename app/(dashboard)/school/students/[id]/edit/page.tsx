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
  UserPlus,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudentById, updateStudent, getClasses } from '@/lib/services/schoolAdminService';

interface Student {
  id: string;
  admissionNumber: string;
  enrollmentStatus: 'active' | 'pending' | 'transferred' | 'graduated' | 'withdrawn';
  isActive: boolean;
  dateOfBirth?: string;
  gender?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  enrolledAt: string;
  classId?: string;
  class?: {
    id: string;
    name: string;
    level: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface Class {
  id: string;
  name: string;
  code: string;
  level: string;
  capacity: number;
  studentCount: number;
}

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    classId: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    emergencyContact: '',
    medicalNotes: '',
    enrollmentStatus: 'active' as 'active' | 'pending' | 'transferred' | 'graduated' | 'withdrawn'
  });

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch student details
      const studentData = await getStudentById(studentId);
      if (studentData) {
        setStudent(studentData);
        setFormData({
          firstName: studentData.user?.firstName || '',
          lastName: studentData.user?.lastName || '',
          email: studentData.user?.email || '',
          phone: studentData.user?.phone || '',
          dateOfBirth: studentData.dateOfBirth || '',
          gender: studentData.gender || '',
          classId: studentData.class?.id || '',
          guardianName: studentData.guardianName || '',
          guardianPhone: studentData.guardianPhone || '',
          guardianEmail: studentData.guardianEmail || '',
          emergencyContact: studentData.emergencyContact || '',
          medicalNotes: studentData.medicalNotes || '',
          enrollmentStatus: studentData.enrollmentStatus || 'active'
        });
      }

      // Fetch classes
      setLoadingClasses(true);
      const classesData = await getClasses();
      if (classesData) {
        const classesList = classesData.data || classesData;
        setClasses(Array.isArray(classesList) ? classesList : []);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
      setLoadingClasses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Student name is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Prepare update data
    const updateData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      classId: formData.classId || null,
      guardianName: formData.guardianName.trim() || null,
      guardianPhone: formData.guardianPhone.trim() || null,
      guardianEmail: formData.guardianEmail.trim() || null,
      emergencyContact: formData.emergencyContact.trim() || null,
      medicalNotes: formData.medicalNotes.trim() || null,
      enrollmentStatus: formData.enrollmentStatus
    };

    setSaving(true);
    try {
      await updateStudent(studentId, updateData);
      toast.success('Student updated successfully!', {
        description: `${formData.firstName} ${formData.lastName}'s information has been updated.`,
        duration: 4000,
        icon: '✅'
      });
      router.push(`/school/students/${studentId}`);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to update student');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-text">Student not found</h2>
        <Link href="/school/students">
          <Button className="mt-4">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href={`/school/students/${studentId}`} 
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Student Profile
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Student</h1>
          <p className="text-text-secondary">
            Update information for {student.user.firstName} {student.user.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Admission: <span className="font-mono text-text">{student.admissionNumber}</span>
          </span>
        </div>
      </div>

      {/* Form */}
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
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Kwame"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Mensah"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0244123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
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
          </div>
        </div>

        {/* Class Assignment */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-akoma-green" />
            Class Assignment
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Assign to Class
            </label>
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="text-text-secondary text-sm">
                No classes available. Please create a class first.
                <Link href="/school/classes/add" className="text-akoma-green hover:underline ml-2">
                  Create Class
                </Link>
              </div>
            ) : (
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">No Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level}) - {cls.studentCount}/{cls.capacity} students
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-akoma-green" />
            Guardian Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Name
              </label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Mr. Kwame Mensah"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Phone
              </label>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="0244987654"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Email
              </label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                placeholder="guardian@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-akoma-green" />
            Additional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="0244999999"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Medical Notes
              </label>
              <input
                type="text"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                placeholder="Allergic to peanuts, asthma, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-akoma-green" />
            Status
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Enrollment Status
            </label>
            <select
              name="enrollmentStatus"
              value={formData.enrollmentStatus}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="transferred">Transferred</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
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
                <li>Changes will be saved immediately</li>
                <li>The student&apos;s login credentials will remain the same</li>
                <li>Guardian notifications will be sent if email/phone is updated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={`/school/students/${studentId}`}>
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
              <Loader2 className="h-4 w-4 animate-spin" />
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