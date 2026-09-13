/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Users,
  AlertCircle,
  UserPlus,
  School,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addParent, getClasses, getSchoolId, getStudentsByClass } from '@/lib/services/schoolAdminService';

interface Class {
  id: string;
  name: string;
  level: string;
}

interface Student {
  id: string;
  admissionNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface FormData {
  // Parent Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  
  // Student Linking
  linkType: 'existing' | 'new';
  classId: string;
  studentId: string;
  
  // New Student (if linkType === 'new')
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
}

export default function AddParentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    // Parent
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    relationship: 'father',
    
    // Student Linking
    linkType: 'existing',
    classId: '',
    studentId: '',
    
    // New Student
    studentFirstName: '',
    studentLastName: '',
    studentEmail: '',
    studentPhone: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (formData.classId && formData.linkType === 'existing') {
      fetchStudents(formData.classId);
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await getClasses({ limit: 100 });
      setClasses(data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClass(classId);
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleLinkTypeChange = (type: 'existing' | 'new') => {
    setFormData({ ...formData, linkType: type, studentId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Parent Details
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Parent name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Parent email is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Parent phone is required');
      return;
    }

    // Validate Student Linking
    if (formData.linkType === 'existing' && !formData.studentId) {
      toast.error('Please select a student to link');
      return;
    }

    if (formData.linkType === 'new') {
      if (!formData.studentFirstName.trim() || !formData.studentLastName.trim()) {
        toast.error('Student name is required');
        return;
      }
      if (!formData.studentEmail.trim()) {
        toast.error('Student email is required');
        return;
      }
    }

  const schoolId = await getSchoolId();
  
    const parentData = {
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      occupation: formData.occupation.trim() || undefined,
      relationship: formData.relationship,
    schoolId: schoolId,
      // Include linking info
      linkType: formData.linkType,
    studentId: formData.linkType === 'existing' ? formData.studentId : undefined,
      // New student data
      student: formData.linkType === 'new' ? {
        firstName: formData.studentFirstName.trim(),
        lastName: formData.studentLastName.trim(),
        email: formData.studentEmail.trim(),
        phone: formData.studentPhone.trim()
      } : undefined
    };

    
  setLoading(true);
  try {
    // Remove the 'result' variable if not used
    await addParent(parentData);
    
    const message = formData.linkType === 'existing' 
      ? `${formData.firstName} ${formData.lastName} has been registered and linked to the student.`
      : `${formData.firstName} ${formData.lastName} has been registered and a new student has been created.`;
    
    toast.success('Parent added successfully!', {
      description: message,
      duration: 5000,
      icon: '🎉',
      action: {
        label: 'View Parents',
        onClick: () => router.push('/school/parents')
      }
    });
    
    setTimeout(() => {
      router.push('/school/parents');
    }, 1500);
  } catch (error: any) {
    const errorData = error?.response?.data;
    if (errorData?.error?.details?.errors) {
      errorData.error.details.errors.forEach((err: any) => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      toast.error(errorData?.error?.message || 'Failed to add parent');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/school/parents" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Parents
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Add Parent</h1>
          <p className="text-text-secondary">Register a parent and link to their child</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Parent Information
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
                  placeholder="parent@example.com"
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
                Occupation
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Engineer, Teacher"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                required
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Linking */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-akoma-green" />
            Link to Student
          </h3>

          {/* Link Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => handleLinkTypeChange('existing')}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.linkType === 'existing'
                  ? 'border-akoma-green bg-akoma-green/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 mx-auto mb-1 text-text-secondary" />
              <span className="text-sm font-medium text-text">Existing Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkTypeChange('new')}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.linkType === 'new'
                  ? 'border-akoma-green bg-akoma-green/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UserPlus className="h-5 w-5 mx-auto mb-1 text-text-secondary" />
              <span className="text-sm font-medium text-text">New Student</span>
            </button>
          </div>

          {/* Existing Student */}
          {formData.linkType === 'existing' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                    required={formData.linkType === 'existing'}
                    disabled={loadingClasses}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.level})
                      </option>
                    ))}
                  </select>
                </div>
                {loadingClasses && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading classes...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                    required={formData.linkType === 'existing'}
                    disabled={!formData.classId || loadingStudents}
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName} ({student.admissionNumber})
                      </option>
                    ))}
                  </select>
                </div>
                {loadingStudents && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading students...
                  </div>
                )}
                {formData.classId && students.length === 0 && !loadingStudents && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No students found in this class. Please add students first or create a new student.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* New Student */}
          {formData.linkType === 'new' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Student First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentFirstName"
                  value={formData.studentFirstName}
                  onChange={handleChange}
                  placeholder="Ama"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required={formData.linkType === 'new'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Student Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentLastName"
                  value={formData.studentLastName}
                  onChange={handleChange}
                  placeholder="Mensah"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required={formData.linkType === 'new'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required={formData.linkType === 'new'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Student Phone
                </label>
                <input
                  type="tel"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleChange}
                  placeholder="0244123456"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          )}
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
                <li>The parent will receive login credentials via email</li>
                <li>Parents can view their child&apos;s progress and attendance</li>
                {formData.linkType === 'new' && (
                  <li>The new student will be enrolled in the selected class</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/school/parents">
            <Button variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Adding...' : 'Add Parent'}
          </Button>
        </div>
      </form>
    </div>
  );
}