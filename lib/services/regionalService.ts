/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/regionalService.ts
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface RegionalOverview {
  region: {
    id: string;
    name: string;
  };
  range: string;
  schools: {
    total: number;
    public: number;
    private: number;
  };
  geography: {
    districts: number;
    districtNames: string[];
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

export interface DistrictStat {
  district: string;
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
    district: string;
    attempts: number;
    passed: number;
    passRate: number;
    averageScore: number;
  }>;
}

export interface RegionalAnalytics {
  overview: RegionalOverview;
  districts: DistrictStat[];
  topSchools: TopSchools;
  attendance: AttendanceTrend;
  assessments: AssessmentPerformance;
}

// ============================================
// OVERVIEW
// ============================================

export async function getRegionalOverview(range: string = '30d'): Promise<RegionalOverview> {
  try {
    const response = await api.get('/regional/overview', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional overview error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// DISTRICTS
// ============================================

export async function getDistrictsInRegion(range: string = '30d'): Promise<DistrictStat[]> {
  try {
    const response = await api.get('/regional/districts', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get districts error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOLS
// ============================================

export async function getSchoolsInRegion(filters?: {
  page?: number;
  limit?: number;
  type?: string;
  district?: string;
  search?: string;
}) {
  try {
    const response = await api.get('/regional/schools', { params: filters });
    return response.data.data;
  } catch (error: any) {
    console.error('Get schools error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ATTENDANCE
// ============================================

export async function getRegionalAttendanceTrends(range: string = '30d'): Promise<AttendanceTrend> {
  try {
    const response = await api.get('/regional/attendance', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional attendance trends error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ASSESSMENTS
// ============================================

export async function getRegionalAssessmentPerformance(range: string = '30d'): Promise<AssessmentPerformance> {
  try {
    const response = await api.get('/regional/assessments', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional assessment performance error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// TOP SCHOOLS
// ============================================

export async function getTopSchools(range: string = '30d'): Promise<TopSchools> {
  try {
    const response = await api.get('/regional/top-schools', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get top schools error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ANALYTICS SNAPSHOT (all-in-one)
// ============================================

export async function getRegionalAnalytics(range: string = '30d'): Promise<RegionalAnalytics> {
  try {
    const response = await api.get('/regional/analytics', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional analytics error:', error.response?.data || error.message);
    throw error;
  }
}