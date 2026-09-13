/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Calendar,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getClassById,
  updateClass,
  getTeachers,
  deleteClass
} from '@/lib/services/schoolAdminService';

interface Teacher {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ClassData {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  teacherId: string | null;
  roomNumber: string | null;
  code: string;
  capacity: number;
  isActive: boolean;
  studentCount: number;
  teacher?: {
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
  isActive: boolean;
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

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    level: '',
    academicYear: '',
    teacherId: '',
    roomNumber: '',
    capacity: 40,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    setLoading(true);
    setLoadingTeachers(true);
    try {
      // Fetch class data and teachers in parallel
      const [classResult, teachersResult] = await Promise.all([
        getClassById(classId),
        getTeachers({ limit: 100 })
      ]);

      setClassData(classResult);
      
      if (teachersResult) {
        setTeachers(teachersResult.teachers || []);
      }

      // Populate form with class data
      setFormData({
        name: classResult.name || '',
        level: classResult.level || '',
        academicYear: classResult.academicYear || '',
        teacherId: classResult.teacherId || '',
        roomNumber: classResult.roomNumber || '',
        capacity: classResult.capacity || 40,
        isActive: classResult.isActive !== undefined ? classResult.isActive : true
      });

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load class details');
    } finally {
      setLoading(false);
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
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
      teacherId: formData.teacherId,
      roomNumber: formData.roomNumber.trim() || undefined,
      capacity: formData.capacity || 40,
      isActive: formData.isActive
    };

    setSaving(true);
    try {
      await updateClass(classId, cleanData);
      toast.success('Class updated successfully!', {
        description: `${cleanData.name} has been updated.`,
        duration: 5000,
        icon: '✅',
        action: {
          label: 'View Class',
          onClick: () => router.push(`/school/classes/${classId}`)
        }
      });
      
      setTimeout(() => {
        router.push(`/school/classes/${classId}`);
      }, 1500);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to update class');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!classData) return;
    
    setDeleteLoading(true);
    try {
      await deleteClass(classId);
      toast.success('Class removed successfully');
      router.push('/school/classes');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove class');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Class not found</p>
        <Link href="/school/classes">
          <Button variant="outline" className="mt-4">
            Back to Classes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/school/classes/${classId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Class Details
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Class</h1>
          <p className="text-text-secondary">
            Update {classData.name} ({classData.code})
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
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
                disabled
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
                  disabled
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
    <option key={teacher.id} value={teacher.id}>  {/* ✅ Use teacher.id (Teacher ID) */}
      {teacher.user ? `${teacher.user.firstName} ${teacher.user.lastName}` : 'Unknown Teacher'}
    </option>
  ))}
</select>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-akoma-green" />
            Class Status
          </h3>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="h-5 w-5 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
            />
            <label className="text-sm text-text">
              Class is active
            </label>
            <span className="text-xs text-text-secondary ml-2">
              {formData.isActive ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <XCircle className="h-3.5 w-3.5" />
                  Inactive
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Inactive classes will not appear in student enrollment or teacher assignment lists.
          </p>
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
                <li>Class code cannot be changed</li>
                <li>Changing the level may affect curriculum mapping</li>
                <li>If class has students, notify them of any changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={`/school/classes/${classId}`}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Class</h3>
                <p className="text-sm text-text-secondary">
                  Remove {classData.name}
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this class? This action cannot be undone.
              </p>
              {classData.studentCount > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This class has {classData.studentCount} student(s).
                    Please reassign them before removing.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLoading || classData.studentCount > 0}
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Remove Class'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}