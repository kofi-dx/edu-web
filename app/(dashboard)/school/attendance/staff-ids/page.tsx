/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/immutability */
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
import { getTeachers, getSchoolId, generateStaffId } from '@/lib/services/schoolAdminService';

interface Staff {
  id: string;
  userId: string;
  employeeNumber: string;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  staffId?: {
    id: string;
    staffNumber: string;
    qrToken: string;
    qrCode: string;
    status: string;
  };
  staffIdCard?: {
    id: string;
    staffNumber: string;
    qrToken: string;
    qrCode: string;
    status: string;
  };
}

interface StaffStats {
  total: number;
  withId: number;
  withoutId: number;
  active: number;
}

export default function StaffIdsPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats>({
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
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const itemsPerPage = 10;

  // ============================================
  // HELPER FUNCTIONS - Support Both Field Names
  // ============================================

  // Get staff ID field (supports both staffId and staffIdCard)
  const getStaffIdField = (member: Staff) => {
    return member.staffId || member.staffIdCard || null;
  };

  // Check if staff has an ID record (even without QR code)
  const hasStaffId = (member: Staff) => {
    const id = getStaffIdField(member);
    return id !== null && id !== undefined;
  };

  // Check if staff has an active ID
  const hasActiveId = (member: Staff) => {
    const id = getStaffIdField(member);
    return id && id.status === 'active';
  };

  // Check if staff has a QR code
  const hasQrCode = (member: Staff) => {
    const id = getStaffIdField(member);
    return id && id.qrCode !== null && id.qrCode !== '';
  };

  // Check if staff has a fully functional ID (active + QR code)
  const hasCompleteId = (member: Staff) => {
    return hasActiveId(member) && hasQrCode(member);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await getSchoolId();

      const data = await getTeachers({ limit: 1000 });
      const list = data?.teachers || [];
      
      // Process staff - map both staffId and staffIdCard to staffId
      const processed = list.map((s: any) => {
        // If staffIdCard exists but staffId doesn't, map it
        if (s.staffIdCard && !s.staffId) {
          return {
            ...s,
            staffId: s.staffIdCard
          };
        }
        // If staffId exists, use it
        if (s.staffId) {
          return {
            ...s,
            staffId: s.staffId
          };
        }
        // Neither exists
        return {
          ...s,
          staffId: null
        };
      });
      
      setStaff(processed);
      setTotalPages(Math.ceil(processed.length / itemsPerPage) || 1);
      
      // Calculate stats
      const total = processed.length;
      const withId = processed.filter((s: Staff) => hasCompleteId(s)).length;
      const withoutId = processed.filter((s: Staff) => !hasCompleteId(s)).length;
      const active = processed.filter((s: Staff) => s.isActive).length;
      
      setStats({ total, withId, withoutId, active });
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStaffId = async (userId: string) => {
    setGenerating(userId);
    try {
      await generateStaffId(userId);
      toast.success('Staff ID generated successfully!');
      await fetchData();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to generate staff ID';
      toast.error(errorMessage);
    } finally {
      setGenerating(null);
    }
  };

  const generateAllIds = async () => {
    const withoutId = staff.filter(s => !hasCompleteId(s));
    
    if (withoutId.length === 0) {
      toast.info('All staff already have IDs');
      return;
    }

    if (!confirm(`Generate IDs for ${withoutId.length} staff members?`)) return;

    setGeneratingAll(true);
    let success = 0;
    let failed = 0;

    for (const member of withoutId) {
      try {
        await generateStaffId(member.userId);
        success++;
      } catch {
        failed++;
      }
    }

    setGeneratingAll(false);
    toast.success(`Generated ${success} IDs, ${failed} failed`);
    await fetchData();
  };

  const downloadQR = (qrCode: string | undefined, staffName: string) => {
    if (!qrCode) {
      toast.error('No QR code available');
      return;
    }
    try {
      const link = document.createElement('a');
      link.download = `qr-${staffName.replace(/\s/g, '-')}.png`;
      link.href = qrCode;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded successfully!');
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const search = searchTerm.toLowerCase();
    const name = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
    const employee = member.employeeNumber?.toLowerCase() || '';
    
    const matchSearch = name.includes(search) || employee.includes(search);
    const matchFilter = filterStatus === 'all' || 
      (filterStatus === 'has-id' && hasCompleteId(member)) ||
      (filterStatus === 'no-id' && !hasCompleteId(member));
    
    return matchSearch && matchFilter;
  });

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading staff...</p>
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
          <h1 className="text-2xl font-bold text-text">Staff IDs</h1>
          <p className="text-text-secondary">
            Generate and manage QR codes for staff members
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
          <p className="text-sm text-text-secondary">Total Staff</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active Staff</p>
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
              placeholder="Search by name or employee number..."
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
              <option value="all">All Staff</option>
              <option value="has-id">Has ID</option>
              <option value="no-id">No ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Staff Member
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Employee #
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Staff Number
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
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No staff found</p>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((member) => {
                  const idField = getStaffIdField(member);
                  const hasId = hasStaffId(member);
                  const isActive = hasActiveId(member);
                  const isComplete = hasCompleteId(member);
                  
                  return (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-akoma-green">
                              {member.user.firstName?.[0]}{member.user.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {member.employeeNumber || 'N/A'}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text">Teacher</span>
                      </td>
                      <td className="px-6 py-4">
                        {idField ? (
                          <span className="text-sm font-mono text-text">
                            {idField.staffNumber}
                          </span>
                        ) : (
                          <span className="text-sm text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Generated
                          </span>
                        ) : hasId && isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Regenerating...
                          </span>
                        ) : hasId && !isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Not Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isComplete && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedStaff(member);
                                  setShowQRModal(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const field = getStaffIdField(member);
                                  if (field?.qrCode) {
                                    downloadQR(field.qrCode, `${member.user.firstName} ${member.user.lastName}`);
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {!isComplete && (
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1 text-xs h-7 bg-akoma-green hover:bg-akoma-dark text-white"
                              onClick={() => handleGenerateStaffId(member.userId)}
                              disabled={generating === member.userId}
                            >
                              {generating === member.userId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              {hasId ? 'Regenerate' : 'Generate'}
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
              {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff
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
      {showQRModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-akoma-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Staff QR Code</h3>
                  <p className="text-sm text-text-secondary">
                    {selectedStaff.user.firstName} {selectedStaff.user.lastName}
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
              {getStaffIdField(selectedStaff)?.qrCode ? (
                <img
                  src={getStaffIdField(selectedStaff)!.qrCode}
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
                <span className="text-text-secondary">Staff Number</span>
                <span className="font-medium text-text">{getStaffIdField(selectedStaff)?.staffNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Employee #</span>
                <span className="font-medium text-text">{selectedStaff.employeeNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Role</span>
                <span className="font-medium text-text">Teacher</span>
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
                  const idField = getStaffIdField(selectedStaff);
                  if (idField?.qrCode) {
                    downloadQR(idField.qrCode, `${selectedStaff.user.firstName} ${selectedStaff.user.lastName}`);
                  }
                }}
              >
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}