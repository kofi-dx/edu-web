/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/publicService.ts
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface GovernmentApplicationData {
  schoolName: string;
  gesCode: string;
  district: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  headteacherName: string;
  headteacherEmail: string;
  headteacherPhone: string;
  schoolLevel: 'primary' | 'jhs' | 'shs' | 'combined';
}

export interface PrivateApplicationData {
  schoolName: string;
  district: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  schoolLevel: 'primary' | 'jhs' | 'shs' | 'combined';
  paymentPlan?: 'basic' | 'premium' | 'enterprise';
  registrationCertificate?: string;
  businessLicense?: string;
  taxClearance?: string;
}

export interface ApplicationResponse {
  application: {
    id: string;
    name: string;
    type: 'public' | 'private';
    applicationStatus: string;
    submittedAt: string;
    status: string;
    isActive: boolean;
  };
  message: string;
  status: string;
  applicationId: string;
  paymentRequired?: boolean;
}

export interface ApplicationStatus {
  id: string;
  name: string;
  applicationStatus: 'submitted' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  status: 'pending' | 'active' | 'rejected';
}

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

/**
 * Submit a government school application
 * POST /api/v1/schools/apply/govt
 */
export async function submitGovernmentApplication(
  data: GovernmentApplicationData
): Promise<ApplicationResponse> {
  try {
    const response = await api.post('/schools/apply/govt', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Submit government application error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Submit a private school application
 * POST /api/v1/schools/apply/private
 */
export async function submitPrivateApplication(
  data: PrivateApplicationData
): Promise<ApplicationResponse> {
  try {
    const response = await api.post('/schools/apply/private', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Submit private application error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get application status by ID (public)
 * GET /api/v1/schools/apply/status/:id
 */
export async function getApplicationStatus(
  applicationId: string
): Promise<ApplicationStatus> {
  try {
    const response = await api.get(`/schools/apply/status/${applicationId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get application status error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// CONSTANTS
// ============================================

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Eastern',
  'Western',
  'Western North',
  'Central',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
] as const;

export const SCHOOL_LEVELS = [
  { value: 'primary', label: 'Primary (Basic 1-6)' },
  { value: 'jhs', label: 'Junior High School (JHS 1-3)' },
  { value: 'shs', label: 'Senior High School (SHS 1-3)' },
  { value: 'combined', label: 'Combined (Primary + JHS)' },
] as const;

export const PAYMENT_PLANS = [
  {
    value: 'basic',
    label: 'Basic',
    price: 'Free',
    description: 'Up to 100 students',
  },
  {
    value: 'premium',
    label: 'Premium',
    price: 'GHS 500/month',
    description: 'Up to 500 students',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    description: 'Unlimited students',
  },
] as const;

