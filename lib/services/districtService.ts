/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/districtService.ts
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface DistrictOverview {
  district: {
    id: string;
    name: string;
    region: string | null;
  };
  range: string;
  schools: {
    total: number;
    public: number;
    private: number;
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

export interface DistrictAnalytics {
  overview: DistrictOverview;
  topSchools: TopSchools;
  attendance: AttendanceTrend;
  assessments: AssessmentPerformance;
}

// ============================================
// OVERVIEW
// ============================================

export async function getDistrictOverview(range: string = '30d'): Promise<DistrictOverview> {
  try {
    const response = await api.get('/district/overview', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district overview error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOLS
// ============================================

export async function getSchoolsInDistrict(filters?: {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}) {
  try {
    const response = await api.get('/district/schools', { params: filters });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district schools error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ATTENDANCE
// ============================================

export async function getDistrictAttendanceTrends(range: string = '30d'): Promise<AttendanceTrend> {
  try {
    const response = await api.get('/district/attendance', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district attendance trends error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ASSESSMENTS
// ============================================

export async function getDistrictAssessmentPerformance(range: string = '30d'): Promise<AssessmentPerformance> {
  try {
    const response = await api.get('/district/assessments', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district assessment performance error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// TOP SCHOOLS
// ============================================

export async function getTopSchools(range: string = '30d'): Promise<TopSchools> {
  try {
    const response = await api.get('/district/top-schools', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district top schools error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ANALYTICS SNAPSHOT (all-in-one)
// ============================================

export async function getDistrictAnalytics(range: string = '30d'): Promise<DistrictAnalytics> {
  try {
    const response = await api.get('/district/analytics', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district analytics error:', error.response?.data || error.message);
    throw error;
  }
}