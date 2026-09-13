/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Search,
  RefreshCw,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Users,
  X as XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudents, getSchoolId, generateStudentId } from '@/lib/services/schoolAdminService';
import PrintIDCardModal from '../components/PrintIDCardModal';

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
  class?: {
    id: string;
    name: string;
    level: string;
  };
  // Support both field names from backend
  studentId?: {
    id: string;
    cardNumber: string;
    qrToken: string;
    qrCode: string;
    status: string;
    expiresAt?: string | null;
  };
  studentIdCard?: {
    id: string;
    cardNumber: string;
    qrToken: string;
    qrCode: string;
    status: string;
    expiresAt?: string | null;
  };
}

interface StudentStats {
  total: number;
  withId: number;
  withoutId: number;
  active: number;
}

export default function StudentIdsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    withId: 0,
    withoutId: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStudent, setPrintStudent] = useState<Student | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await getSchoolId();

      const data = await getStudents({ limit: 1000 });
      const list = data?.students || [];
      
      // Process students - handle both studentId and studentIdCard
      const processed = list.map((s: any) => {
        // If studentIdCard exists but studentId doesn't, map it
        if (s.studentIdCard && !s.studentId) {
          return {
            ...s,
            studentId: s.studentIdCard || null 
          };
        }
        return {
          ...s,
          studentId: s.studentId || null
        };
      });
      
      setStudents(processed);
      setTotalPages(Math.ceil(processed.length / itemsPerPage) || 1);
      
      // Calculate stats
      const total = processed.length;
      const withId = processed.filter((s: Student) => s.studentId && s.studentId.status === 'active').length;
      const withoutId = processed.filter((s: Student) => !s.studentId || s.studentId.status !== 'active').length;
      const active = processed.filter((s: Student) => s.enrollmentStatus === 'active').length;
      
      setStats({ total, withId, withoutId, active });
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudentId = async (studentId: string) => {
    setGenerating(studentId);
    try {
      await generateStudentId(studentId);
      toast.success('Student ID generated successfully!');
      
      // Refresh data and then show print modal
      await fetchData();
      
      // Find the updated student with the new ID
      const updatedStudent = students.find(s => s.id === studentId);
      if (updatedStudent && updatedStudent.studentId) {
        setPrintStudent(updatedStudent);
        setShowPrintModal(true);
      } else {
        // If student not found, do another fetch
        const refetched = await getStudents({ limit: 1000 });
        const found = refetched?.students?.find((s: any) => s.id === studentId);
        if (found) {
          const studentWithId = {
            ...found,
            studentId: found.studentId || found.studentIdCard || null
          };
          setPrintStudent(studentWithId);
          setShowPrintModal(true);
        }
      }
    } catch (error: any) {
      console.error('Generate student ID error:', error);
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to generate student ID';
      toast.error(errorMessage);
    } finally {
      setGenerating(null);
    }
  };

  const generateAllIds = async () => {
    const withoutId = students.filter(s => !s.studentId || s.studentId.status !== 'active');
    
    if (withoutId.length === 0) {
      toast.info('All students already have IDs');
      return;
    }

    if (!confirm(`Generate IDs for ${withoutId.length} students?`)) return;

    setGeneratingAll(true);
    let success = 0;
    let failed = 0;

    for (const student of withoutId) {
      try {
        await generateStudentId(student.id);
        success++;
      } catch {
        failed++;
      }
    }

    setGeneratingAll(false);
    toast.success(`Generated ${success} IDs, ${failed} failed`);
    await fetchData();
  };

const downloadQR = (qrCode: string | undefined, studentName: string) => {
  if (!qrCode) {
    toast.error('No QR code available for this student');
    return;
  }
  
  try {
    const link = document.createElement('a');
    link.download = `qr-${studentName.replace(/\s/g, '-')}.png`;
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  } catch (error) {
    console.error('Download QR error:', error);
    toast.error('Failed to download QR code');
  }
};

  const getStudentIdField = (student: Student) => {
    return student.studentId || student.studentIdCard || null;
  };

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    const name = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const admission = student.admissionNumber?.toLowerCase() || '';
    
    const matchSearch = name.includes(search) || admission.includes(search);
    const matchFilter = filterStatus === 'all' || 
      (filterStatus === 'has-id' && getStudentIdField(student)) ||
      (filterStatus === 'no-id' && !getStudentIdField(student));
    
    return matchSearch && matchFilter;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/school/attendance" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-2">
            <QrCode className="h-4 w-4" />
            Back to Attendance
          </Link>
          <h1 className="text-2xl font-bold text-text">Student IDs</h1>
          <p className="text-text-secondary">
            Generate and manage QR codes for students
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={generateAllIds}
            disabled={generatingAll}
          >
            {generatingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generatingAll ? 'Generating...' : 'Generate All'}
          </Button>
          <Link href="/school/attendance/id-cards">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <Printer className="h-4 w-4" />
              Print ID Cards
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Students</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active Students</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Have ID</p>
          <p className="text-2xl font-bold text-akoma-green">{stats.withId}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Need ID</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.withoutId}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Students</option>
              <option value="has-id">Has ID</option>
              <option value="no-id">No ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Admission
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Class
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  ID Status
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No students found</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const studentIdField = getStudentIdField(student);
                  return (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-akoma-green">
                              {student.user.firstName?.[0]}{student.user.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text">
                              {student.user.firstName} {student.user.lastName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {student.user.email}
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
                        {student.class ? (
                          <span className="text-sm text-text">
                            {student.class.name}
                          </span>
                        ) : (
                          <span className="text-sm text-text-secondary">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {studentIdField && studentIdField.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Not Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {studentIdField && studentIdField.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowQRModal(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => downloadQR(studentIdField.qrCode, `${student.user.firstName} ${student.user.lastName}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant={studentIdField && studentIdField.status === 'active' ? "ghost" : "default"}
                            size="sm"
                            className={studentIdField && studentIdField.status === 'active' ? "h-8 w-8 p-0" : "gap-1 text-xs"}
                            onClick={() => handleGenerateStudentId(student.id)}
                            disabled={generating === student.id}
                          >
                            {generating === student.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : studentIdField && studentIdField.status === 'active' ? (
                              <RefreshCw className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            {!studentIdField && 'Generate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-akoma-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Student QR Code</h3>
                  <p className="text-sm text-text-secondary">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-text-secondary hover:text-text"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center py-6">
              {getStudentIdField(selectedStudent)?.qrCode ? (
                <img
                  src={getStudentIdField(selectedStudent)!.qrCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Card Number</span>
                <span className="font-medium text-text">{getStudentIdField(selectedStudent)?.cardNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Admission</span>
                <span className="font-medium text-text">{selectedStudent.admissionNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Class</span>
                <span className="font-medium text-text">{selectedStudent.class?.name || 'Not Assigned'}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </Button>
              <Button
                className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                onClick={() => {
                  const idField = getStudentIdField(selectedStudent);
                  if (idField?.qrCode) {
                    downloadQR(idField.qrCode, `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`);
                  }
                }}
              >
                <Download className="h-4 w-4" />
                Download QR
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => {
                  setPrintStudent(selectedStudent);
                  setShowPrintModal(true);
                  setShowQRModal(false);
                }}
              >
                <Printer className="h-4 w-4" />
                Print ID Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print ID Card Modal - Using the component */}
      <PrintIDCardModal
        student={printStudent}
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPrintStudent(null);
        }}
      />
    </div>
  );
}