/* eslint-disable react-hooks/exhaustive-deps */
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
  Users,
  FileText,
  Sparkles,
  X as XIcon,
  School,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudents, getSchoolId, getClasses, generateStudentId } from '@/lib/services/schoolAdminService';
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

interface Class {
  id: string;
  name: string;
  level: string;
}

interface StudentStats {
  total: number;
  withId: number;
  withoutId: number;
  active: number;
}

export default function IDCardsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
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
  const [filterClass, setFilterClass] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printStudent, setPrintStudent] = useState<Student | null>(null);
  const [printingClass, setPrintingClass] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Helper: Get student ID field (supports both studentId and studentIdCard)
  const getStudentIdField = (student: Student) => {
    return student.studentId || student.studentIdCard || null;
  };

  // Helper: Check if student has an active ID
  const hasActiveId = (student: Student) => {
    const id = getStudentIdField(student);
    return id && id.status === 'active';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await getSchoolId();

      // Fetch students
      const data = await getStudents({ limit: 1000 });
      const list = data?.students || [];
      
      // Process students - handle both studentId and studentIdCard
      const processed = list.map((s: any) => ({
        ...s,
        studentId: s.studentId || s.studentIdCard || null
      }));
      
      setStudents(processed);
      setTotalPages(Math.ceil(processed.length / itemsPerPage) || 1);
      
      const total = processed.length;
      const withId = processed.filter((s: Student) => hasActiveId(s)).length;
      const withoutId = processed.filter((s: Student) => !hasActiveId(s)).length;
      const active = processed.filter((s: Student) => s.enrollmentStatus === 'active').length;
      
      setStats({ total, withId, withoutId, active });

      // Fetch classes
      const classesData = await getClasses();
      let classesList = [];
      if (Array.isArray(classesData)) {
        classesList = classesData;
      } else if (classesData?.classes) {
        classesList = classesData.classes;
      } else if (classesData?.data) {
        classesList = Array.isArray(classesData.data) ? classesData.data : [];
      }
      setClasses(classesList);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudentId = async (studentId: string) => {
    setGenerating(studentId);
    try {
      await generateStudentId(studentId);
      toast.success('Student ID generated successfully!');
      await fetchData();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to generate student ID';
      toast.error(errorMessage);
    } finally {
      setGenerating(null);
    }
  };

  const generateIdsForClass = async (classId: string, className: string) => {
    const studentsInClass = students.filter(s => s.class?.id === classId && !hasActiveId(s));
    
    if (studentsInClass.length === 0) {
      toast.info(`All students in ${className} already have IDs`);
      return;
    }

    if (!confirm(`Generate IDs for ${studentsInClass.length} students in ${className}?`)) return;

    setGeneratingAll(true);
    let success = 0;
    let failed = 0;

    for (const student of studentsInClass) {
      try {
        await generateStudentId(student.id);
        success++;
      } catch {
        failed++;
      }
    }

    setGeneratingAll(false);
    toast.success(`Generated ${success} IDs, ${failed} failed for ${className}`);
    await fetchData();
  };

  const downloadQR = (qrCode: string | undefined, studentName: string) => {
    if (!qrCode) {
      toast.error('No QR code available');
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
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const printClassCards = async (classId: string, className: string) => {
    const studentsInClass = students.filter(s => s.class?.id === classId && hasActiveId(s));
    
    if (studentsInClass.length === 0) {
      toast.info(`No students with IDs in ${className}`);
      return;
    }

    setPrintingClass(classId);
    
    // Open new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Generate HTML with all ID cards
      const cardsHtml = studentsInClass.map(student => {
        const idField = getStudentIdField(student);
        return `
          <div class="id-card">
            <div class="header">
              <h1>AKOMA EDU</h1>
              <p>Student Identification Card</p>
            </div>
            <div class="card-body">
              <div class="avatar">
                ${student.user.firstName?.[0] || ''}${student.user.lastName?.[0] || ''}
              </div>
              <div class="info">
                <h3>${student.user.firstName} ${student.user.lastName}</h3>
                <p>${student.class?.name || 'Not Assigned'}</p>
                <div class="details">
                  <div><strong>Admission:</strong> ${student.admissionNumber || 'N/A'}</div>
                  <div><strong>Card:</strong> ${idField?.cardNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div class="qr-section">
              ${idField?.qrCode ? 
                `<img src="${idField.qrCode}" alt="QR Code" class="qr-code" />` :
                `<div class="qr-placeholder">No QR</div>`
              }
            </div>
            <div class="footer">
              ${student.class?.name || 'Student'} • Valid until: ${idField?.expiresAt ? new Date(idField.expiresAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        `;
      }).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>ID Cards - ${className}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 20px; background: #f0f2f5; }
              .page-title { text-align: center; margin-bottom: 20px; }
              .page-title h1 { font-size: 24px; color: #1a73e8; }
              .page-title p { color: #6b7280; }
              .page-title .stats { font-size: 14px; color: #6b7280; margin-top: 4px; }
              .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; max-width: 1200px; margin: 0 auto; }
              .id-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; break-inside: avoid; }
              .header { text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-bottom: 12px; }
              .header h1 { font-size: 16px; color: #1a73e8; margin: 0; }
              .header p { font-size: 11px; color: #6b7280; margin: 2px 0 0; }
              .card-body { display: flex; gap: 16px; margin-bottom: 12px; align-items: center; }
              .avatar { width: 64px; height: 64px; border-radius: 50%; background: #e8f5e9; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #1a73e8; flex-shrink: 0; }
              .info { flex: 1; }
              .info h3 { font-size: 16px; font-weight: bold; margin: 0; }
              .info p { font-size: 13px; color: #6b7280; margin: 2px 0; }
              .details { font-size: 12px; margin-top: 4px; }
              .details div { margin: 1px 0; }
              .qr-section { display: flex; justify-content: center; margin: 8px 0; }
              .qr-code { width: 120px; height: 120px; border: 2px dashed #d1d5db; border-radius: 8px; padding: 4px; }
              .qr-placeholder { width: 120px; height: 120px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px dashed #d1d5db; color: #9ca3af; font-size: 12px; }
              .footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; font-size: 10px; color: #9ca3af; }
              .btn-group { text-align: center; margin-top: 16px; display: flex; gap: 12px; justify-content: center; }
              .btn-group button { padding: 8px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
              .btn-print { background: #1a73e8; color: white; }
              .btn-close { background: #6b7280; color: white; }
              @media print { 
                body { background: white; padding: 10px; } 
                .id-card { box-shadow: none; border: 1px solid #ddd; page-break-inside: avoid; } 
                .no-print { display: none !important; } 
                .cards-grid { gap: 12px; } 
                .btn-group { display: none !important; }
                .page-title { margin-bottom: 12px; }
              }
            </style>
          </head>
          <body>
            <div class="page-title no-print">
              <h1>${className} - ID Cards</h1>
              <p>${studentsInClass.length} students with IDs</p>
              <div class="btn-group">
                <button class="btn-print" onclick="window.print()">🖨️ Print All Cards</button>
                <button class="btn-close" onclick="window.close()">Close</button>
              </div>
            </div>
            <div class="cards-grid">${cardsHtml}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    setPrintingClass(null);
  };

  const getStatusBadge = (student: Student) => {
    if (hasActiveId(student)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3.5 w-3.5" />
          ID Generated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <XCircle className="h-3.5 w-3.5" />
        Not Generated
      </span>
    );
  };

  const getClassStats = (classId: string) => {
    const classStudents = students.filter(s => s.class?.id === classId);
    const withId = classStudents.filter(s => hasActiveId(s)).length;
    return { total: classStudents.length, withId, withoutId: classStudents.length - withId };
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    const name = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    const admission = student.admissionNumber?.toLowerCase() || '';
    
    const matchSearch = name.includes(search) || admission.includes(search);
    const matchFilter = filterStatus === 'all' || 
      (filterStatus === 'has-id' && hasActiveId(student)) ||
      (filterStatus === 'no-id' && !hasActiveId(student));
    const matchClass = filterClass === 'all' || student.class?.id === filterClass;
    
    return matchSearch && matchFilter && matchClass;
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
          <p className="text-text-secondary">Loading data...</p>
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
          <h1 className="text-2xl font-bold text-text">ID Cards</h1>
          <p className="text-text-secondary">
            Generate and print student ID cards by class or individually
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

      {/* Class Cards - Bulk Print Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <School className="h-4 w-4" />
            Bulk Print by Class
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {classes.map((cls) => {
              const stats = getClassStats(cls.id);
              const canPrint = stats.withId > 0;
              return (
                <div key={cls.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-text">{cls.name}</h3>
                    <span className="text-xs text-text-secondary">{cls.level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-text-secondary">Students: <strong>{stats.total}</strong></span>
                    <span className="text-green-600">ID: <strong>{stats.withId}</strong></span>
                    {stats.withoutId > 0 && (
                      <span className="text-yellow-600">Need: <strong>{stats.withoutId}</strong></span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {stats.withoutId > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs h-7"
                        onClick={() => generateIdsForClass(cls.id, cls.name)}
                        disabled={generatingAll}
                      >
                        <Sparkles className="h-3 w-3" />
                        Generate IDs
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className={`gap-1 text-xs h-7 ${canPrint ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      onClick={() => canPrint && printClassCards(cls.id, cls.name)}
                      disabled={!canPrint || printingClass === cls.id}
                    >
                      {printingClass === cls.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Printer className="h-3 w-3" />
                      )}
                      Print {stats.withId > 0 ? `(${stats.withId})` : ''}
                    </Button>
                  </div>
                </div>
              );
            })}
            {classes.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-text-secondary">No classes found. Create a class first.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">ID Card Printing</p>
            <p className="text-sm text-blue-700">
              Click <strong>Print</strong> on any class card to print all ID cards for that class.
              Students without IDs will need to be generated first.
            </p>
          </div>
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
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
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
                  Card Number
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No students found</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const idField = getStudentIdField(student);
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
                        {idField ? (
                          <span className="text-sm font-mono text-text">
                            {idField.cardNumber}
                          </span>
                        ) : (
                          <span className="text-sm text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(student)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {idField && idField.status === 'active' && (
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
                                onClick={() => downloadQR(idField.qrCode, `${student.user.firstName} ${student.user.lastName}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600"
                                onClick={() => {
                                  setPrintStudent(student);
                                  setShowPrintModal(true);
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {!idField && (
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1 text-xs h-7 bg-akoma-green hover:bg-akoma-dark text-white"
                              onClick={() => handleGenerateStudentId(student.id)}
                              disabled={generating === student.id}
                            >
                              {generating === student.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Generate
                            </Button>
                          )}
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

      {/* Print ID Card Modal */}
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