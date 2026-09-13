/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
// ✅ Import the correct function
import { getMyTeacherClasses } from '@/lib/services/schoolAdminService';

interface Student {
  id: string;
  admissionNumber: string;
  enrollmentStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  class: {
    id: string;
    name: string;
  };
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // ✅ Use getMyTeacherClasses (no argument needed)
      const classes = await getMyTeacherClasses();
      // TODO: Get students from each class via class roster API
      // For now, we'll show empty state
      console.log('Classes fetched:', classes);
      setStudents([]);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const search = searchTerm.toLowerCase();
    const name = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
    return name.includes(search) || s.admissionNumber?.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Students</h1>
        <p className="text-text-secondary">
          Students across all your classes
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No students found</p>
          <p className="text-sm text-text-secondary">Students from your classes will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Admission</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Class</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-akoma-green">
                            {student.user.firstName?.[0]}{student.user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {student.admissionNumber || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text">{student.class?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student.enrollmentStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <XCircle className="h-3.5 w-3.5" />
                          {student.enrollmentStatus || 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.user.email && (
                          <a href={`mailto:${student.user.email}`} className="text-text-secondary hover:text-akoma-green">
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {student.user.phone && (
                          <a href={`tel:${student.user.phone}`} className="text-text-secondary hover:text-akoma-green">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}