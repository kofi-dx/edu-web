/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  UserPlus,
  X,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  getParentById, 
  deleteParent, 
  getClasses, 
  getStudentsByClass, 
  linkParentToStudent,
  removeParentLink 
} from '@/lib/services/schoolAdminService';
import { format, formatDistanceToNow } from 'date-fns';

// ✅ Updated interface to handle both 'students' and 'children'
interface Parent {
  id: string;
  occupation: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  students?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class?: {
      id: string;
      name: string;
      level: string;
    };
  }[];
  children?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class?: {
      id: string;
      name: string;
      level: string;
    };
  }[];
}

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

// ✅ Define child type for type safety
interface Child {
  id: string;
  admissionNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
}

const relationshipLabels: Record<string, string> = {
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
  other: 'Other'
};

export default function ParentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parentId = params.id as string;
  
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Link Student Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [linkClassId, setLinkClassId] = useState('');
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkRelationship, setLinkRelationship] = useState<'father' | 'mother' | 'guardian' | 'other'>('guardian');
  const [linking, setLinking] = useState(false);
  const [removingLink, setRemovingLink] = useState<string | null>(null);

  useEffect(() => {
    if (parentId) {
      fetchParent();
    }
  }, [parentId]);

  useEffect(() => {
    if (showLinkModal) {
      fetchClasses();
    }
  }, [showLinkModal]);

  useEffect(() => {
    if (linkClassId) {
      fetchStudents(linkClassId);
    } else {
      setStudents([]);
    }
  }, [linkClassId]);

  const fetchParent = async () => {
    setLoading(true);
    try {
      const data = await getParentById(parentId);
      
      // ✅ Transform the data to ensure 'students' property exists
      const transformedData = {
        ...data,
        students: data.students || data.children || []
      };
      
      setParent(transformedData);
    } catch (error: any) {
      console.error('Failed to fetch parent:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load parent details');
      router.push('/school/parents');
    } finally {
      setLoading(false);
    }
  };

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
      // Filter out students already linked to this parent
      const linkedStudentIds = parent?.students?.map(s => s.id) || [];
      const filtered = (data || []).filter((s: Student) => !linkedStudentIds.includes(s.id));
      setStudents(filtered);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
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
      
      // Refresh parent data
      await fetchParent();
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
      await fetchParent();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to unlink student');
    } finally {
      setRemovingLink(null);
    }
  };

  const handleDelete = async () => {
    if (!parent) return;
    
    setActionLoading(true);
    try {
      await deleteParent(parent.id);
      toast.success('Parent removed successfully');
      router.push('/school/parents');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to remove parent');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getVerifiedBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
        <XCircle className="h-4 w-4" />
        Pending
      </span>
    );
  };

  const getRelationshipBadge = (relationship: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      father: { color: 'bg-blue-100 text-blue-700', label: 'Father' },
      mother: { color: 'bg-pink-100 text-pink-700', label: 'Mother' },
      guardian: { color: 'bg-purple-100 text-purple-700', label: 'Guardian' },
      other: { color: 'bg-gray-100 text-gray-700', label: 'Other' },
    };
    const config = configs[relationship] || configs.other;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ✅ Helper function to get children array
  const getChildren = (): Child[] => {
    if (!parent) return [];
    return (parent.students || parent.children || []) as Child[];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-akoma-green animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading parent details...</p>
        </div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Parent not found</p>
        <Link href="/school/parents">
          <Button variant="outline" className="mt-4">
            Back to Parents
          </Button>
        </Link>
      </div>
    );
  }

  const children = getChildren();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/school/parents" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Parents
        </Link>
        <div className="flex gap-2">
          <Link href={`/school/parents/${parent.id}/edit`}>
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
                {parent.user.firstName?.[0]}{parent.user.lastName?.[0] || ''}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    {parent.user.firstName} {parent.user.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {getVerifiedBadge(parent.isVerified)}
                    {getRelationshipBadge(parent.relationship)}
                    {parent.occupation && (
                      <span className="text-sm text-text-secondary">
                        • {parent.occupation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-text-secondary text-right">
                  <p>Registered: {format(new Date(parent.createdAt), 'PPP')}</p>
                  <p>{formatDistanceToNow(new Date(parent.createdAt), { addSuffix: true })}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  <a href={`mailto:${parent.user.email}`} className="text-akoma-green hover:underline">
                    {parent.user.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-text-secondary" />
                  <a href={`tel:${parent.user.phone}`} className="text-text hover:text-akoma-green">
                    {parent.user.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Children</p>
          <p className="text-2xl font-bold text-text">{children.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Relationship</p>
          <p className="text-2xl font-bold text-akoma-green">{relationshipLabels[parent.relationship]}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Status</p>
          <p className="text-2xl font-bold text-akoma-green">{parent.isVerified ? '✅ Verified' : '⏳ Pending'}</p>
        </div>
      </div>

      {/* Children Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Children
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {children.length} children linked to this parent
              </p>
            </div>
            <Button 
              size="sm" 
              className="gap-2 bg-akoma-green hover:bg-akoma-dark text-white"
              onClick={() => setShowLinkModal(true)}
            >
              <UserPlus className="h-4 w-4" />
              Link Student
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {children.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Admission Number
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Class
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {children.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {student.admissionNumber || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {student.class ? (
                        <span className="text-sm text-text">
                          {student.class.name} ({student.class.level})
                        </span>
                      ) : (
                        <span className="text-sm text-text-secondary">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/school/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <User className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveLink(student.id)}
                        disabled={removingLink === student.id}
                      >
                        {removingLink === student.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No children linked to this parent</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => setShowLinkModal(true)}
              >
                <UserPlus className="h-4 w-4" />
                Link Student
              </Button>
            </div>
          )}
        </div>
      </div>

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
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkClassId('');
                  setLinkStudentId('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <select
                    value={linkClassId}
                    onChange={(e) => setLinkClassId(e.target.value)}
                    disabled={loadingClasses}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
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
                    value={linkStudentId}
                    onChange={(e) => setLinkStudentId(e.target.value)}
                    disabled={!linkClassId || loadingStudents}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
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
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkClassId('');
                  setLinkStudentId('');
                }}
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
      {showDeleteModal && parent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Remove Parent</h3>
                <p className="text-sm text-text-secondary">
                  Remove {parent.user.firstName} {parent.user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to remove this parent? This action cannot be undone.
              </p>
              {children.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This parent has {children.length} child(ren) linked.
                    Please reassign them before removing.
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
                disabled={actionLoading || children.length > 0}
              >
                {actionLoading ? 'Removing...' : 'Remove Parent'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}