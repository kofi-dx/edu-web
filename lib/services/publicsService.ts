// lib/services/publicsService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface PublicSchool {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private';
  level: string | null;
  district: string | null;
  region: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  attendanceRate: number;
}

export interface PublicSchoolClass {
  id: string;
  name: string;
  level: string;
  capacity: number;
  studentCount: number;
  availableSpots: number;
}

export interface PublicSchoolDetail extends PublicSchool {
  availableLevels: string[];
  classes: PublicSchoolClass[];
}

export interface PublicSchoolsResponse {
  schools: PublicSchool[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdmissionApplicationInput {
  // Parent
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: 'father' | 'mother' | 'guardian' | 'other';
  // Student
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth?: string;
  studentGender?: 'male' | 'female' | 'other';
  desiredLevel: string;
  previousSchool?: string;
  // Other
  notes?: string;
}

export interface AdmissionApplication {
  id: string;
  schoolId: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  studentFirstName: string;
  studentLastName: string;
  desiredLevel: string;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  reviewNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  approvedClassId?: string | null;
  school?: {
    id: string;
    name: string;
    code: string;
    type: string;
    region: string | null;
    district: string | null;
  };
}

// ============================================
// SCHOOLS — PUBLIC DIRECTORY
// ============================================

/**
 * List all active public schools with optional filters
 * Public endpoint — no auth required.
 */
export async function getPublicSchools(params?: {
  page?: number;
  limit?: number;
  type?: 'public' | 'private';
  region?: string;
  district?: string;
  search?: string;
}): Promise<PublicSchoolsResponse> {
  try {
    const response = await api.get('/public/schools', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get public schools error:', error.response?.data || error.message);
    return { schools: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Get a single public school's detail (including aggregate stats)
 * Public endpoint — no auth required.
 */
export async function getPublicSchoolDetail(schoolId: string): Promise<PublicSchoolDetail> {
  try {
    const response = await api.get(`/public/schools/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get public school detail error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * List distinct regions for the filter dropdown.
 * Public endpoint — no auth required.
 */
export async function getPublicRegions(): Promise<string[]> {
  try {
    const response = await api.get('/public/regions');
    return response.data.data || [];
  } catch (error: any) {
    console.error('Get public regions error:', error.response?.data || error.message);
    return [];
  }
}

// ============================================
// ADMISSION APPLICATIONS
// ============================================

/**
 * Submit an admission application for a child.
 * Public endpoint — rate-limited to 5/IP/hour.
 */
export async function submitAdmissionApplication(
  schoolId: string,
  data: AdmissionApplicationInput
): Promise<{ application: AdmissionApplication; message: string }> {
  try {
    const response = await api.post(`/public/schools/${schoolId}/apply`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Submit admission application error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get an application's status by ID.
 * Public endpoint — no auth required.
 */
export async function getApplicationStatus(applicationId: string): Promise<AdmissionApplication> {
  try {
    const response = await api.get(`/public/applications/${applicationId}/status`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get application status error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Withdraw a pending application.
 * Public endpoint — no auth required.
 */
export async function withdrawApplication(applicationId: string): Promise<{ message: string }> {
  try {
    const response = await api.put(`/public/applications/${applicationId}/withdraw`);
    return response.data.data;
  } catch (error: any) {
    console.error('Withdraw application error:', error.response?.data || error.message);
    throw error;
  }
}