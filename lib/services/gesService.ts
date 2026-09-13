/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/gesService.ts
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface NationalOverview {
  range: string;
  schools: {
    total: number;
    public: number;
    private: number;
    pending: number;
  };
  geography: {
    regions: number;
    districts: number;
  };
  students: {
    total: number;
  };
  teachers: {
    total: number;
  };
  classes: {
    total: number;
  };
  attendance: {
    total: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  };
  assessments: {
    totalAttempts: number;
    passed: number;
    failed: number;
    passRate: number;
    averageScore: number;
  };
}

export interface RegionStat {
  region: string;
  schools: number;
  publicSchools: number;
  privateSchools: number;
  students: number;
  teachers: number;
  studentTeacherRatio: number;
  attendance: number;
  attendanceRecords: number;
  assessmentAttempts: number;
  assessmentPassRate: number;
  averageScore: number;
}

export interface DistrictStat {
  district: string;
  region: string;
  schools: number;
  students: number;
  teachers: number;
  studentTeacherRatio: number;
  attendance: number;
}

export interface SchoolListItem {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  region: string;
  district: string;
  contactEmail: string;
  contactPhone: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  studentTeacherRatio: number;
  isActive: boolean;
}

export interface AttendanceTrend {
  range: string;
  summary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  };
  trends: Array<{
    date: string;
    present: number;
    late: number;
    absent: number;
    total: number;
    rate: number;
  }>;
  totalDays: number;
}

export interface AssessmentPerformance {
  range: string;
  summary: {
    totalAttempts: number;
    passed: number;
    failed: number;
    passRate: number;
    averageScore: number;
  };
  subjects: Array<{
    subject: string;
    attempts: number;
    passed: number;
    passRate: number;
    averageScore: number;
  }>;
}

export interface TopSchools {
  top: Array<{
    id: string;
    name: string;
    code: string;
    region: string;
    district: string;
    attempts: number;
    passed: number;
    passRate: number;
    averageScore: number;
  }>;
  atRisk: Array<{
    id: string;
    name: string;
    code: string;
    region: string;
    district: string;
    attempts: number;
    passed: number;
    passRate: number;
    averageScore: number;
  }>;
}

// ============================================
// NATIONAL OVERVIEW
// ============================================

export async function getNationalOverview(range: string = '30d'): Promise<NationalOverview> {
  try {
    const response = await api.get('/government/overview', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get national overview error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// REGIONS
// ============================================

export async function getRegionalBreakdown(range: string = '30d'): Promise<RegionStat[]> {
  try {
    const response = await api.get('/government/regions', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional breakdown error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// DISTRICTS
// ============================================

export async function getDistrictBreakdown(
  range: string = '30d',
  region?: string
): Promise<DistrictStat[]> {
  try {
    const params: any = { range };
    if (region) params.region = region;
    const response = await api.get('/government/districts', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district breakdown error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ATTENDANCE
// ============================================

export async function getNationalAttendanceTrends(range: string = '30d'): Promise<AttendanceTrend> {
  try {
    const response = await api.get('/government/attendance', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get national attendance trends error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ASSESSMENTS
// ============================================

export async function getNationalAssessmentPerformance(range: string = '30d'): Promise<AssessmentPerformance> {
  try {
    const response = await api.get('/government/assessments', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get national assessment performance error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOLS
// ============================================

export async function getSchools(filters?: {
  page?: number;
  limit?: number;
  type?: string;
  region?: string;
  district?: string;
  search?: string;
}) {
  try {
    const response = await api.get('/government/schools', { params: filters });
    return response.data.data;
  } catch (error: any) {
    console.error('Get schools error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getTopSchools(range: string = '30d'): Promise<TopSchools> {
  try {
    const response = await api.get('/government/schools/top', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get top schools error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// HELPERS
// ============================================

export async function getMySchool() {
  try {
    const response = await api.get('/schools/me');
    return response.data.data;
  } catch (error: any) {
    console.error('Get my school error:', error.response?.data || error.message);
    throw error;
  }
}