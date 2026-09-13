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
  School,
  Users,
  User,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClass, getTeachers } from '@/lib/services/schoolAdminService';

interface Teacher {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface FormData {
  name: string;
  level: string;
  academicYear: string;
  teacherId: string;
  roomNumber: string;
  capacity: number;
}

const levelOptions = [
  { value: 'basic_1', label: 'Basic 1' },
  { value: 'basic_2', label: 'Basic 2' },
  { value: 'basic_3', label: 'Basic 3' },
  { value: 'basic_4', label: 'Basic 4' },
  { value: 'basic_5', label: 'Basic 5' },
  { value: 'basic_6', label: 'Basic 6' },
  { value: 'jhs_1', label: 'JHS 1' },
  { value: 'jhs_2', label: 'JHS 2' },
  { value: 'jhs_3', label: 'JHS 3' },
  { value: 'shs_1', label: 'SHS 1' },
  { value: 'shs_2', label: 'SHS 2' },
  { value: 'shs_3', label: 'SHS 3' },
];

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
const [formData, setFormData] = useState<FormData>({
  name: '',
  level: '',
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, // ← FIXED
  teacherId: '',
  roomNumber: '',
  capacity: 40
});

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const data = await getTeachers({ limit: 100 });
      if (data) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Class name is required');
      return;
    }

    if (!formData.level) {
      toast.error('Please select a level');
      return;
    }

    if (!formData.academicYear) {
      toast.error('Academic year is required');
      return;
    }

    const cleanData = {
      name: formData.name.trim(),
      level: formData.level,
      academicYear: formData.academicYear,
      teacherId: formData.teacherId || undefined,
      roomNumber: formData.roomNumber.trim() || undefined,
      capacity: formData.capacity || 40,
    };

    setLoading(true);
    try {
      await createClass(cleanData);
      toast.success('Class created successfully!', {
        description: `${cleanData.name} has been created.`,
        duration: 5000,
        icon: '🎉',
        action: {
          label: 'View Classes',
          onClick: () => router.push('/school/classes')
        }
      });
      
      setTimeout(() => {
        router.push('/school/classes');
      }, 1500);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to create class');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/school/classes" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Classes
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Create Class</h1>
          <p className="text-text-secondary">Add a new class to your school</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <School className="h-5 w-5 text-akoma-green" />
            Class Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Basic 5A"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                required
              >
                <option value="">Select Level</option>
                {levelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="2024/2025"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Room Number
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g., Room 201"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Capacity
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="40"
                  min="1"
                  max="100"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Assignment */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Teacher Assignment
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Assign Teacher
            </label>
            {loadingTeachers ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers...
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-text-secondary text-sm">
                No teachers available. Please add a teacher first.
                <Link href="/school/teachers/add" className="text-akoma-green hover:underline ml-2">
                  Add Teacher
                </Link>
              </div>
            ) : (
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">No Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.user?.id || teacher.id}>
                    {teacher.user ? `${teacher.user.firstName} ${teacher.user.lastName}` : 'Unknown Teacher'}
                  </option>
                ))}
              </select>
            )}
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
                <li>Class code will be generated automatically</li>
                <li>You can assign a teacher later if needed</li>
                <li>Students can be enrolled after the class is created</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/school/classes">
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
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </form>
    </div>
  );
}