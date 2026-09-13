// lib/services/adminService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';



// ============================================
// PLATFORM ANALYTICS
// ============================================

export async function getPlatformStats(range: string = '30d') {
  try {
    const response = await api.get('/schools/super-admin/analytics', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get platform stats error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getPlatformAnalytics(range: string = '30d') {
  try {
    const response = await api.get('/schools/super-admin/analytics', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get platform analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getRegionAnalytics() {
  try {
    const response = await api.get('/schools/super-admin/analytics/regions');
    return response.data.data;
  } catch (error: any) {
    console.error('Get region analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getSystemHealth() {
  try {
    const response = await api.get('/schools/super-admin/health');
    return response.data.data;
  } catch (error: any) {
    console.error('Get system health error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getRecentActivity(limit: number = 20) {
  try {
    const response = await api.get('/schools/super-admin/activity', { params: { limit } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get recent activity error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOL MANAGEMENT
// ============================================

export async function getAllSchoolsSummary() {
  try {
    const response = await api.get('/schools/super-admin/schools');
    return response.data.data;
  } catch (error: any) {
    console.error('Get all schools error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getSchoolDetail(schoolId: string) {
  try {
    const response = await api.get(`/schools/super-admin/schools/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get school detail error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// APPLICATIONS
// ============================================

export async function getPendingApplications() {
  try {
    const response = await api.get('/schools/applications/pending');
    return response.data.data;
  } catch (error: any) {
    console.error('Get pending applications error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAllApplications(filters?: {
  page?: number;
  limit?: number;
  applicationStatus?: string;
  type?: string;
}) {
  try {
    const response = await api.get('/schools/applications', { params: filters });
    return response.data.data;
  } catch (error: any) {
    console.error('Get all applications error:', error.response?.data || error.message);
    throw error;
  }
}

export async function verifyApplication(
  applicationId: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  try {
    const response = await api.put(`/schools/applications/${applicationId}/verify`, {
      status,
      notes,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Verify application error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOL ACTIONS
// ============================================

export async function activateSchool(schoolId: string) {
  try {
    const response = await api.put(`/schools/${schoolId}/activate`);
    return response.data.data;
  } catch (error: any) {
    console.error('Activate school error:', error.response?.data || error.message);
    throw error;
  }
}

export async function suspendSchool(schoolId: string, reason?: string) {
  try {
    const response = await api.put(`/schools/${schoolId}/suspend`, { reason });
    return response.data.data;
  } catch (error: any) {
    console.error('Suspend school error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}) {
  try {
    const response = await api.get('/schools/super-admin/users', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get all users error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// SCHOOLS
// ============================================


// Get school by ID
export async function getSchoolById(schoolId: string) {
  try {
    const response = await api.get(`/admin/schools/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get school by ID error:', error.response?.data || error.message);
    throw error;
  }
}

// Get school stats - FIXED
export async function getSchoolStats(schoolId: string, range?: string) {
  try {
    // Use the admin endpoint instead of the school endpoint
    const response = await api.get(`/admin/schools/${schoolId}/stats`, { 
      params: { range } 
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school stats error:', error.response?.data || error.message);
    // Return default stats so the page doesn't break
    return {
      stats: {
        students: 0,
        teachers: 0,
        classes: 0,
        attendanceRate: 0,
        studentGrowth: 0,
        status: 'unknown',
        type: 'unknown',
        registrationCompleted: false,
      }
    };
  }
}

// ============================================
// USERS
// ============================================

// Get users by role
export async function getUsersByRole(role: string, params?: {
  page?: number;
  limit?: number;
}) {
  try {
    const response = await api.get(`/admin/users/role/${role}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get users by role error:', error.response?.data || error.message);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get user by ID error:', error.response?.data || error.message);
    throw error;
  }
}

// Activate user
export async function activateUser(userId: string) {
  try {
    const response = await api.put(`/admin/users/${userId}/activate`);
    return response.data.data;
  } catch (error: any) {
    console.error('Activate user error:', error.response?.data || error.message);
    throw error;
  }
}

// Suspend user
export async function suspendUser(userId: string) {
  try {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return response.data.data;
  } catch (error: any) {
    console.error('Suspend user error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// CURRICULUM
// ============================================

// Get all curricula
export async function getAllCurricula(params?: {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  search?: string;
}) {
  try {
    const response = await api.get('/curriculum', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get all curricula error:', error.response?.data || error.message);
    throw error;
  }
}

// Get curriculum by ID
export async function getCurriculumById(curriculumId: string) {
  try {
    const response = await api.get(`/curriculum/${curriculumId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get curriculum by ID error:', error.response?.data || error.message);
    throw error;
  }
}

// Create curriculum
export async function createCurriculum(data: any) {
  try {
    const response = await api.post('/curriculum', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

// Update curriculum
export async function updateCurriculum(curriculumId: string, data: any) {
  try {
    const response = await api.put(`/curriculum/${curriculumId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

// Publish curriculum
export async function publishCurriculum(curriculumId: string) {
  try {
    const response = await api.put(`/curriculum/${curriculumId}/publish`);
    return response.data.data;
  } catch (error: any) {
    console.error('Publish curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

// Archive curriculum
export async function archiveCurriculum(curriculumId: string) {
  try {
    const response = await api.put(`/curriculum/${curriculumId}/archive`);
    return response.data.data;
  } catch (error: any) {
    console.error('Archive curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// LEVELS
// ============================================

export async function createLevel(data: any) {
  try {
    const response = await api.post('/curriculum/levels', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create level error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getLevelsByCurriculum(curriculumId: string) {
  try {
    const response = await api.get(`/curriculum/${curriculumId}/levels`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get levels by curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SUBJECTS
// ============================================

export async function createSubject(data: any) {
  try {
    const response = await api.post('/curriculum/subjects', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create subject error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getSubjectsByLevel(levelId: string) {
  try {
    const response = await api.get(`/curriculum/levels/${levelId}/subjects`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get subjects by level error:', error.response?.data || error.message);
    throw error;
  }
}


// Get all schools
export async function getAllSchools(params?: any) {
  try {
    const response = await api.get('/admin/schools', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get all schools error:', error.response?.data || error.message);
    throw error;
  }
}


// Verify school application
export async function verifySchool(schoolId: string, data: { status: 'approved' | 'rejected'; notes?: string }) {
  try {
    const response = await api.put(`/admin/schools/${schoolId}/verify`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Verify school error:', error.response?.data || error.message);
    throw error;
  }
}



// Change user role
export async function changeUserRole(userId: string, role: string) {
  try {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data;
  } catch (error: any) {
    console.error('Change user role error:', error.response?.data || error.message);
    throw error;
  }
}

// lib/services/adminService.ts - Add these functions

// ============================================
// SCHOOL STUDENTS
// ============================================

export async function getSchoolStudents(schoolId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    const response = await api.get(`/admin/schools/${schoolId}/students`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school students error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOL TEACHERS
// ============================================

export async function getSchoolTeachers(schoolId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    const response = await api.get(`/admin/schools/${schoolId}/teachers`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school teachers error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOL CLASSES
// ============================================

export async function getSchoolClasses(schoolId: string, params?: {
  page?: number;
  limit?: number;
  level?: string;
}) {
  try {
    const response = await api.get(`/admin/schools/${schoolId}/classes`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school classes error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SCHOOL ATTENDANCE
// ============================================

export async function getSchoolAttendance(schoolId: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get(`/admin/schools/${schoolId}/attendance`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school attendance error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// ANALYTICS
// ============================================

// Get national analytics
export async function getNationalAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get('/admin/analytics/national', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get national analytics error:', error.response?.data || error.message);
    // Return default data so the page doesn't break
    return {
      overview: {
        totalSchools: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        totalClasses: 0,
        averageAttendance: 0,
        activeSchools: 0,
        pendingSchools: 0,
        studentGrowth: 0,
        teacherGrowth: 0,
      },
      regional: [],
      trends: [],
      subjectPerformance: []
    };
  }
}

// Get regional analytics
export async function getRegionalAnalytics(region: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get(`/admin/analytics/regional/${region}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get regional analytics error:', error.response?.data || error.message);
    return null;
  }
}

// Get district analytics
export async function getDistrictAnalytics(district: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get(`/admin/analytics/district/${district}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get district analytics error:', error.response?.data || error.message);
    return null;
  }
}

// Get school performance analytics
export async function getSchoolPerformanceAnalytics(schoolId: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get(`/admin/analytics/school/${schoolId}/performance`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school performance analytics error:', error.response?.data || error.message);
    return null;
  }
}

// Get subject performance analytics
export async function getSubjectPerformanceAnalytics(params?: {
  level?: string;
  subject?: string;
  region?: string;
  district?: string;
}) {
  try {
    const response = await api.get('/admin/analytics/subject-performance', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get subject performance analytics error:', error.response?.data || error.message);
    return null;
  }
}