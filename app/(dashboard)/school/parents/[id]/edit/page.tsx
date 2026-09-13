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
  User,
  Mail,
  Phone,
  Briefcase,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  UserPlus, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getParent,
  updateParent,
  getClasses,
  getStudentsByClass,
  linkParentToStudent,
  removeParentLink, 
} from '@/lib/services/schoolAdminService';

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

interface LinkedStudent {
  id: string;
  admissionNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

interface ParentData {
  id: string;
  occupation: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  isVerified: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  children?: LinkedStudent[];
}

interface FormData {
  // Parent Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  isVerified: boolean;
}

export default function EditParentPage() {
  const router = useRouter();
  const params = useParams();
  const parentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [parent, setParent] = useState<ParentData | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Linking state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkClassId, setLinkClassId] = useState('');
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkRelationship, setLinkRelationship] = useState<'father' | 'mother' | 'guardian' | 'other'>('guardian');
  const [linking, setLinking] = useState(false);
  const [removingLink, setRemovingLink] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    relationship: 'guardian',
    isVerified: true
  });

  useEffect(() => {
    fetchData();
  }, [parentId]);

  useEffect(() => {
    if (linkClassId) {
      fetchStudents(linkClassId);
    }
  }, [linkClassId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch parent data
      const parentData = await getParent(parentId);
      setParent(parentData);
      
      // Populate form
      setFormData({
        firstName: parentData.user?.firstName || '',
        lastName: parentData.user?.lastName || '',
        email: parentData.user?.email || '',
        phone: parentData.user?.phone || '',
        occupation: parentData.occupation || '',
        relationship: parentData.relationship || 'guardian',
        isVerified: parentData.isVerified !== undefined ? parentData.isVerified : true
      });

      // Fetch classes for linking
      const classesData = await getClasses({ limit: 100 });
      setClasses(classesData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load parent data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClass(classId);
      // Filter out students already linked to this parent
      const linkedStudentIds = parent?.children?.map(c => c.id) || [];
      const filtered = (data || []).filter((s: Student) => !linkedStudentIds.includes(s.id));
      setStudents(filtered);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const updateData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      occupation: formData.occupation.trim() || undefined,
      relationship: formData.relationship,
      isVerified: formData.isVerified
    };

    setSaving(true);
    try {
      await updateParent(parentId, updateData);
      toast.success('Parent updated successfully!', {
        description: `${updateData.firstName} ${updateData.lastName} has been updated.`,
        duration: 5000,
        icon: '✅',
        action: {
          label: 'View Parent',
          onClick: () => router.push(`/school/parents/${parentId}`)
        }
      });
      
      setTimeout(() => {
        router.push(`/school/parents/${parentId}`);
      }, 1500);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.error?.details?.errors) {
        errorData.error.details.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(errorData?.error?.message || 'Failed to update parent');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!linkStudentId) {
      toast.error('Please select a student');
      return;
    }

    setLinking(true);
    try {
      await linkParentToStudent({
        parentId: parentId,
        studentId: linkStudentId,
        relationshipType: linkRelationship,
        isPrimaryContact: true
      });
      
      toast.success('Student linked successfully!');
      setShowLinkModal(false);
      setLinkClassId('');
      setLinkStudentId('');
      setLinkRelationship('guardian');
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to link student');
    } finally {
      setLinking(false);
    }
  };

  const handleRemoveLink = async (studentId: string) => {
    setRemovingLink(studentId);
    try {
      await removeParentLink(parentId, studentId);
      toast.success('Student unlinked successfully');
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to unlink student');
    } finally {
      setRemovingLink(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // Call delete API (you'll need to implement this)
      // await deleteParent(parentId);
      toast.success('Parent removed successfully');
      router.push('/school/parents');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove parent');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };
 

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading parent data...</p>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Parent not found</p>
        <Link href="/school/parents">
          <Button variant="outline" className="mt-4">
            Back to Parents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/school/parents/${parentId}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Parent Details
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Parent</h1>
          <p className="text-text-secondary">
            Update {parent.user?.firstName} {parent.user?.lastName}&apos;s information
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

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-akoma-green" />
            Account Status
          </h3>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
            />
            <label className="text-sm text-text">
              Parent account is verified
            </label>
            <span className="text-xs text-text-secondary ml-2">
              {formData.isVerified ? (
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-yellow-600">
                  <XCircle className="h-3.5 w-3.5" />
                  Pending
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Verified parents can access the parent portal and view their children&apos;s progress.
          </p>
        </div>

        {/* Linked Students */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text flex items-center gap-2">
              <Users className="h-5 w-5 text-akoma-green" />
              Linked Students
            </h3>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowLinkModal(true)}
              className="gap-2 bg-akoma-green hover:bg-akoma-dark text-white"
            >
              <UserPlus className="h-4 w-4" />
              Link Student
            </Button>
          </div>

          {parent.children && parent.children.length > 0 ? (
            <div className="space-y-2">
              {parent.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-text">
                      {child.user.firstName} {child.user.lastName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span>Admission: {child.admissionNumber}</span>
                      {child.class && <span>Class: {child.class.name}</span>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveLink(child.id)}
                    disabled={removingLink === child.id}
                  >
                    {removingLink === child.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No students linked yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLinkModal(true)}
                className="mt-2 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Link a Student
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={`/school/parents/${parentId}`}>
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

      {/* Link Student Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-akoma-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Link Student</h3>
                  <p className="text-sm text-text-secondary">
                    Connect a student to this parent
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={linkClassId}
                  onChange={(e) => setLinkClassId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={linkStudentId}
                  onChange={(e) => setLinkStudentId(e.target.value)}
                  disabled={!linkClassId || loadingStudents}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user.firstName} {student.user.lastName} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
                {loadingStudents && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading students...
                  </div>
                )}
                {linkClassId && students.length === 0 && !loadingStudents && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No unlinked students found in this class.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select
                  value={linkRelationship}
                  onChange={(e) => setLinkRelationship(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowLinkModal(false)}
                disabled={linking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkStudent}
                disabled={!linkStudentId || linking}
                className="bg-akoma-green hover:bg-akoma-dark text-white"
              >
                {linking ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Link Student'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Parent</h3>
                <p className="text-sm text-text-secondary">
                  Remove {parent.user?.firstName} {parent.user?.lastName}
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this parent? This action cannot be undone.
              </p>
              {parent.children && parent.children.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This parent has {parent.children.length} child(ren) linked.
                    Please unlink them before removing.
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
                disabled={deleteLoading || (parent.children && parent.children.length > 0)}
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Remove Parent'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}