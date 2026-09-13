/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  getMyTeacherClasses, 
  getClassRoster, 
  confirmClassAttendance 
} from '@/lib/services/schoolAdminService';

interface Class {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  student: {
    id: string;
    admissionNumber: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  gate: {
    scanned: boolean;
    time: string | null;
    status: string | null;
    recordId: string | null;
  };
  class: {
    confirmed: boolean;
    status: string;
    time: string | null;
    recordId: string | null;
  };
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    gateScanned: 0,
    confirmed: 0,
    absent: 0
  });

  // Fetch classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getMyTeacherClasses();
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0].id);
        await fetchStudents(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for selected class
  const fetchStudents = async (classId: string) => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await getClassRoster(classId, selectedDate);
      setRecords(data.records || []);
      
      // Calculate stats
      const total = data.records?.length || 0;
      const gateScanned = data.records?.filter((r: AttendanceRecord) => r.gate.scanned).length || 0;
      const confirmed = data.records?.filter((r: AttendanceRecord) => r.class.confirmed).length || 0;
      const absent = data.records?.filter((r: AttendanceRecord) => 
        !r.class.confirmed || r.class.status === 'absent'
      ).length || 0;
      
      setStats({ total, gateScanned, confirmed, absent });
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Handle class change
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    fetchStudents(classId);
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  };

  // Toggle student confirmation status
  const toggleConfirmation = (index: number, status: 'present' | 'absent') => {
    setRecords(prev => {
      const updated = [...prev];
      const current = updated[index];
      
      // Toggle: if current status matches, set to absent; otherwise set to new status
      if (current.class.status === status && current.class.confirmed) {
        updated[index] = {
          ...current,
          class: {
            ...current.class,
            confirmed: false,
            status: 'absent'
          }
        };
      } else {
        updated[index] = {
          ...current,
          class: {
            ...current.class,
            confirmed: true,
            status: status
          }
        };
      }
      return updated;
    });
  };

  // Mark all gate-scanned students as present
  const markAllPresent = () => {
    setRecords(prev => prev.map(r => {
      if (r.gate.scanned) {
        return {
          ...r,
          class: {
            ...r.class,
            confirmed: true,
            status: 'present'
          }
        };
      }
      return r;
    }));
    toast.success('All gate-scanned students marked as present');
  };

  // Submit attendance
  const submitAttendance = async () => {
    setSubmitting(true);
    try {
      // Only submit confirmed records
      const confirmations = records
        .filter(r => r.class.confirmed)
        .map(r => ({
          studentId: r.student.id,
          confirmed: true,
          status: r.class.status,
          notes: ''
        }));
      
      // Also mark unconfirmed gate-scanned as absent
      const unconfirmed = records
        .filter(r => !r.class.confirmed && r.gate.scanned)
        .map(r => ({
          studentId: r.student.id,
          confirmed: false,
          status: 'absent',
          notes: 'Scanned at gate but not confirmed in class'
        }));
      
      const allConfirmations = [...confirmations, ...unconfirmed];
      
      if (allConfirmations.length === 0) {
        toast.info('No attendance to submit');
        setSubmitting(false);
        return;
      }
      
      await confirmClassAttendance(selectedClass, selectedDate, allConfirmations);
      toast.success(`Attendance confirmed for ${allConfirmations.length} students`);
      await fetchStudents(selectedClass);
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      toast.error('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students by search
  const filteredRecords = records.filter(r => {
    const search = searchTerm.toLowerCase();
    const name = `${r.student.user.firstName} ${r.student.user.lastName}`.toLowerCase();
    return name.includes(search) || r.student.admissionNumber?.toLowerCase().includes(search);
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  // Re-fetch when date changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Class Attendance</h1>
        <p className="text-text-secondary">
          Confirm students from gate attendance or mark them in class
        </p>
      </div>

      {/* Class Selection & Date */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-text">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-text">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={() => fetchStudents(selectedClass)}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={markAllPresent}
              variant="outline"
              className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
            >
              <UserCheck className="h-4 w-4" />
              Mark All Present
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Students</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Gate Scanned</p>
          <p className="text-2xl font-bold text-blue-600">{stats.gateScanned}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">In Class</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Absent</p>
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {stats.confirmed} confirmed, {stats.gateScanned - stats.confirmed} waiting
            </span>
            <Button
              onClick={submitAttendance}
              disabled={submitting || !selectedClass}
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Attendance
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No students in this class</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Admission</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Gate Status</th>
                  <th className="text-center text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">In Class</th>
                  <th className="text-center text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">Absent</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record.student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-akoma-green">
                            {record.student.user.firstName?.[0]}{record.student.user.lastName?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {record.student.user.firstName} {record.student.user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {record.student.admissionNumber || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {record.gate.scanned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Scanned at {record.gate.time ? new Date(record.gate.time).toLocaleTimeString() : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <XCircle className="h-3.5 w-3.5" />
                          Not Scanned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleConfirmation(index, 'present')}
                        className={`w-8 h-8 rounded-full transition-all ${
                          record.class.confirmed && record.class.status === 'present'
                            ? 'bg-green-500 text-white ring-2 ring-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                        disabled={!record.gate.scanned}
                      >
                        <UserCheck className="h-5 w-5 mx-auto" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleConfirmation(index, 'absent')}
                        className={`w-8 h-8 rounded-full transition-all ${
                          record.class.confirmed && record.class.status === 'absent'
                            ? 'bg-red-500 text-white ring-2 ring-red-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                        disabled={!record.gate.scanned}
                      >
                        <UserX className="h-5 w-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              In Class
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Absent
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Gate Scanned
            </span>
            <span className="flex items-center gap-1.5 text-yellow-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Click to confirm students
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}