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
  UserPlus,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addStudent, getClasses } from '@/lib/services/schoolAdminService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  medicalNotes: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
  level: string;
  capacity: number;
  studentCount: number;
}

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<FormData>({
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
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await getClasses();
      console.log('Classes data:', data);
      
      if (data) {
        const classesList = data.data || data;
        setClasses(Array.isArray(classesList) ? classesList : []);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDATE ALL REQUIRED FIELDS
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone' },
      { field: 'dateOfBirth', label: 'Date of Birth' },
      { field: 'gender', label: 'Gender' },
      { field: 'classId', label: 'Class' },
      { field: 'guardianName', label: 'Guardian Name' },
      { field: 'guardianPhone', label: 'Guardian Phone' },
      { field: 'guardianEmail', label: 'Guardian Email' },
      { field: 'emergencyContact', label: 'Emergency Contact' },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof FormData] || formData[field as keyof FormData].trim() === '') {
        toast.error(`${label} is required`);
        return;
      }
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // ✅ Validate phone format (Ghana numbers)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    // ✅ Validate guardian phone
    if (!phoneRegex.test(formData.guardianPhone.trim())) {
      toast.error('Please enter a valid guardian phone number (10-15 digits)');
      return;
    }

    // ✅ Validate guardian email
    if (!emailRegex.test(formData.guardianEmail.trim())) {
      toast.error('Please enter a valid guardian email address');
      return;
    }

    // ✅ Prepare clean data - ALL fields required
    const cleanData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      classId: formData.classId,
      guardianName: formData.guardianName.trim(),
      guardianPhone: formData.guardianPhone.trim(),
      guardianEmail: formData.guardianEmail.trim(),
      emergencyContact: formData.emergencyContact.trim(),
      medicalNotes: formData.medicalNotes.trim() || 'None',
    };

    console.log('Sending student data:', cleanData);

    setLoading(true);
    try {
      const response = await addStudent(cleanData);
      console.log('Student added successfully:', response);
      
      toast.success('Student added successfully!', {
        description: `${cleanData.firstName} ${cleanData.lastName} has been enrolled. Login credentials have been sent to the student and guardian.`,
        duration: 6000,
        icon: '🎉',
        action: {
          label: 'View Students',
          onClick: () => router.push('/school/students')
        }
      });
      
      setTimeout(() => {
        router.push('/school/students');
      }, 1500);
    } catch (error: any) {
      console.error('Add student error:', error);
      const errorData = error?.response?.data;
      
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to add student');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/school/students" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Add Student</h1>
          <p className="text-text-secondary">Enroll a new student at your school</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Personal Information <span className="text-xs text-red-500 font-normal">* All fields required</span>
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
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Class Assignment - REQUIRED */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-akoma-green" />
            Class Assignment <span className="text-xs text-red-500 font-normal">* Required</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Assign to Class <span className="text-red-500">*</span>
            </label>
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-4 h-4 border-2 border-akoma-green border-t-transparent rounded-full animate-spin" />
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
                required
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level}) - {cls.studentCount}/{cls.capacity} students
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Guardian Information - ALL REQUIRED */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-akoma-green" />
            Guardian Information <span className="text-xs text-red-500 font-normal">* All fields required</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Mr. Kwame Mensah"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                placeholder="0244987654"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Guardian Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                placeholder="guardian@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-akoma-green" />
            Additional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Emergency Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="0244999999"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Medical Notes <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                placeholder="Allergic to peanuts, asthma, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
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
                <li><strong>All fields</strong> are required to complete registration</li>
                <li>The student will receive login credentials via email</li>
                <li>The guardian will also receive a confirmation email</li>
                <li>A temporary password will be generated automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/school/students">
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
            {loading ? 'Adding...' : 'Add Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}