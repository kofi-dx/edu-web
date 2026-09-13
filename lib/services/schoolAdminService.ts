/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, } from '@/lib/api';

// ============================================
// TYPES
// ============================================

interface StudentsResponse {
  students: any[];
  total: number;
  page: number;
  totalPages: number;
}


// ============================================
// TYPES
// ============================================

export interface Teacher {
  id: string;
  userId: string;
  schoolId: string;
  employeeNumber: string;
  
  // Personal Information
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  nationality: string;
  ghanaCardNumber: string | null;
  
  // Contact Information
  address: string | null;
  district: string | null;
  region: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  
  // Professional Information
  qualifications: string | null;
  specializations: string[];
  subjects: string[];
  experience: number;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'volunteer';
  hiredAt: string;
  
  // GES Information
  gesNumber: string | null;
  gesStatus: 'pending' | 'active' | 'transferred' | null;
  ntcLicenseNumber: string | null;
  ntcLicenseExpiry: string | null;
  
  // Bank Details
  bankName: string | null;
  bankBranch: string | null;
  accountNumber: string | null;
  accountName: string | null;
  
  // Assignment
  classTeacher: boolean;
  formClassId: string | null;
  
  // Status
  isActive: boolean;
  
  // Relations
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  classes?: {
    id: string;
    name: string;
    level: string;
  }[];
}

export interface TeachersResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
  fullTime: number;
  partTime: number;
  contract: number;
}


// ============================================
// SCHOOL
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

export async function getSchoolStats(schoolId: string, range?: string) {
  try {
    const response = await api.get(`/schools/${schoolId}/stats`, { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school stats error:', error.response?.data || error.message);
    throw error;
  }
}
 
// ============================================
// SCHOOL ANALYTICS
// ============================================

export async function getSchoolAnalytics(range: string = '30d') {
  try {
    const response = await api.get('/school/analytics', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAttendanceTrends(range: string = '30d') {
  try {
    const response = await api.get('/school/analytics/attendance', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get attendance trends error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAssessmentPerformance(range: string = '30d') {
  try {
    const response = await api.get('/school/analytics/assessments', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get assessment performance error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getTeacherPerformance(range: string = '30d') {
  try {
    const response = await api.get('/school/analytics/teachers', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher performance error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentPerformance(range: string = '30d') {
  try {
    const response = await api.get('/school/analytics/students', { params: { range } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get student performance error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// STUDENTS
// ============================================

export async function getStudents(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<StudentsResponse> {
  try {
    const response = await api.get('/school/students', { params });
    const result = response.data.data;
    
    // Handle different response formats
    let students = [];
    let total = 0;
    let page = params?.page || 1;
    let totalPages = 1;
    
    if (Array.isArray(result)) {
      students = result;
      total = result.length;
      totalPages = Math.ceil(total / (params?.limit || 10));
    } else if (result && typeof result === 'object') {
      if (result.students) {
        students = result.students;
        total = result.total || students.length;
        totalPages = result.totalPages || Math.ceil(total / (params?.limit || 10));
        page = result.page || page;
      } else {
        students = Array.isArray(result) ? result : [result];
        total = students.length;
        totalPages = Math.ceil(total / (params?.limit || 10));
      }
    }
    
    return {
      students,
      total,
      page,
      totalPages
    };
  } catch (error: any) {
    console.error('Get students error:', error.response?.data || error.message);
    return { students: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getStudentById(id: string) {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getPendingStudents(schoolId: string) {
  try {
    const response = await api.get(`/students/pending/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get pending students error:', error.response?.data || error.message);
    throw error;
  }
}

export async function approveStudent(studentId: string) {
  try {
    const response = await api.put(`/students/${studentId}/approve`);
    return response.data.data;
  } catch (error: any) {
    console.error('Approve student error:', error.response?.data || error.message);
    throw error;
  }
}

export async function addStudent(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  medicalNotes: string;
}) {
  try {
    const response = await api.post('/students', data);
    return response.data;
  } catch (error: any) {
    console.error('Add student error:', error.response?.data || error.message);
    throw error;
  }
}

export async function updateStudent(studentId: string, data: any) {
  try {
    const response = await api.put(`/students/${studentId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update student error:', error.response?.data || error.message);
    throw error;
  }
}

export async function deleteStudent(id: string) {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete student error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// STUDENT DASHBOARD
// ============================================

export async function getStudentDashboard() {
  try {
    const response = await api.get('/students/me/dashboard');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student dashboard error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentProfile() {
  try {
    const response = await api.get('/students/me');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student profile error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// STUDENT LEARNING
// ============================================

export async function getStudentSubjects() {
  try {
    const response = await api.get('/learning/subjects');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student subjects error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentTopics(subjectId: string) {
  try {
    const response = await api.get(`/learning/subjects/${subjectId}/topics`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student topics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentLessons(topicId: string) {
  try {
    const response = await api.get(`/learning/topics/${topicId}/lessons`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student lessons error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getLesson(lessonId: string) {
  try {
    const response = await api.get(`/learning/lessons/${lessonId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get lesson error:', error.response?.data || error.message);
    throw error;
  }
}

export async function markLessonComplete(lessonId: string) {
  try {
    const response = await api.post(`/learning/lessons/${lessonId}/progress`);
    return response.data.data;
  } catch (error: any) {
    console.error('Mark lesson complete error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentProgress() {
  try {
    const response = await api.get('/learning/progress/me');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student progress error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// STUDENT ASSESSMENTS
// ============================================


export async function startAssessment(assessmentId: string) {
  try {
    const response = await api.post(`/students/me/assessments/${assessmentId}/start`);
    return response.data.data;
  } catch (error: any) {
    console.error('Start assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function submitAssessment(
  assessmentId: string,
  data: { answers: Array<{ questionId: string; answer: string; timeSpentSeconds?: number }>; timeSpentSeconds: number }
) {
  try {
    const response = await api.post(`/students/me/assessments/${assessmentId}/submit`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Submit assessment error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// STUDENT ASSESSMENTS
// ============================================

export async function getStudentAssessments() {
  try {
    const response = await api.get('/students/me/assessments');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student assessments error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentResults() {
  try {
    const response = await api.get('/students/me/results');
    return response.data.data;
  } catch (error: any) {
    console.error('Get student results error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// ADMISSION APPLICATIONS (School Admin)
// ============================================

export interface AdmissionApplicationSummary {
  id: string;
  schoolId: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: string;
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth: string | null;
  studentGender: string | null;
  desiredLevel: string;
  previousSchool: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  reviewNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedStudentId: string | null;
  approvedClassId: string | null;
}

export interface AdmissionApplicationsResponse {
  applications: AdmissionApplicationSummary[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * List admission applications for the current school admin's school
 */
export async function getStudentApplications(params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';
  search?: string;
}): Promise<AdmissionApplicationsResponse> {
  try {
    const response = await api.get('/school/student-applications', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get student applications error:', error.response?.data || error.message);
    return { applications: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Get a single admission application
 */
export async function getStudentApplication(
  applicationId: string
): Promise<AdmissionApplicationSummary> {
  try {
    const response = await api.get(`/school/student-applications/${applicationId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student application error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Approve an application and enroll the student
 */
export async function approveStudentApplication(
  applicationId: string,
  data: { classId: string; notes?: string }
): Promise<{
  application: AdmissionApplicationSummary;
  student: { id: string; admissionNumber: string; email: string };
  parent: { id: string; email: string };
  parentCreated: boolean;
  tempPassword: string | null;
  studentTempPassword: string | null;
  message: string;
}> {
  try {
    const response = await api.put(
      `/school/student-applications/${applicationId}/approve`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Approve student application error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Reject an application
 */
export async function rejectStudentApplication(
  applicationId: string,
  data: { reason: string }
): Promise<{ application: AdmissionApplicationSummary; message: string }> {
  try {
    const response = await api.put(
      `/school/student-applications/${applicationId}/reject`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Reject student application error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// TEACHERS
// ============================================

let cachedSchoolId: string | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 60000; // 1 minute

export const clearSchoolCache = () => {
  cachedSchoolId = null;
  cacheTimestamp = null;
};


export const getSchoolId = async (forceRefresh = false) => {
  // Check if cache is valid
  if (!forceRefresh && cachedSchoolId && cacheTimestamp) {
    const age = Date.now() - cacheTimestamp;
    if (age < CACHE_DURATION) {
      return cachedSchoolId;
    }
  }
  
  try {
    const response = await api.get('/schools/me');
    const school = response.data.data;
    cachedSchoolId = school.id;
    cacheTimestamp = Date.now();
    return school.id;
  } catch (error) {
    console.error('Failed to fetch school:', error);
    throw error;
  }
};

// ============================================
// TEACHER DASHBOARD FUNCTIONS
// ============================================

/**
 * Get current teacher's dashboard data
 * Uses the authenticated user's ID
 */

export async function getTeacherDashboard() {
  try {
    const response = await api.get('/teachers/me/dashboard');
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher dashboard error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get teacher's profile
 */
export async function getTeacherProfile() {
  try {
    const response = await api.get('/teachers/me');
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher profile error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get current teacher's classes (uses authenticated user)
 * ✅ Uses /me/classes directly
 */
export async function getMyTeacherClasses() {
  try {
    // ✅ Use /me/classes directly
    const response = await api.get('/teachers/me/classes');
    return response.data.data || [];
  } catch (error: any) {
    console.error('Get my teacher classes error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Get current teacher's teaching load (uses authenticated user)
 */
export async function getMyTeachingLoad() {
  try {
    const response = await api.get('/teachers/me/teaching-load');
    return response.data.data;
  } catch (error: any) {
    console.error('Get my teaching load error:', error.response?.data || error.message);
    throw error;
  }
}
/**
 * Get all teachers in the school
 */
export async function getTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  employmentType?: string;
}): Promise<TeachersResponse> {
  try {
    const schoolId = await getSchoolId();
    const response = await api.get(`/teachers/school/${schoolId}`, { params });
    

    // The API returns { success, message, data: [...] }
    const result = response.data;
    
    let teachers: Teacher[] = [];
    let total = 0;
    
    // Check if result.data exists
    if (result && result.data) {
      // If data is an array directly
      if (Array.isArray(result.data)) {
        teachers = result.data;
        total = teachers.length;
      } 
      // If data has a teachers property
      else if (result.data.teachers && Array.isArray(result.data.teachers)) {
        teachers = result.data.teachers;
        total = result.data.total || teachers.length;
      }
      // If data is an object but not an array
      else if (typeof result.data === 'object') {
        // Try to extract any array property
        const possibleArrays = Object.values(result.data).filter(v => Array.isArray(v));
        if (possibleArrays.length > 0) {
          teachers = possibleArrays[0];
          total = teachers.length;
        } else {
          teachers = [result.data] as Teacher[];
          total = 1;
        }
      }
    } else if (Array.isArray(result)) {
      // If result itself is an array
      teachers = result;
      total = teachers.length;
    }
    
    // If total is 0 but teachers exist, use teachers length
    if (total === 0 && teachers.length > 0) {
      total = teachers.length;
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const totalPages = Math.ceil(total / limit) || 1;
    
    
    return {
      teachers,
      total,
      page,
      totalPages
    };
  } catch (error: any) {
    console.error('Get teachers error:', error.response?.data || error.message);
    return { teachers: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Get a single teacher by ID
 */
/**
 * Get a single teacher by ID - FIXED: Use simpler endpoint
 */
export async function getTeacherById(teacherId: string): Promise<Teacher> {
  try {
    // Use the simpler endpoint - just /teachers/:id
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Add a new teacher
 */
export interface AddTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  ghanaCardNumber?: string;
  address?: string;
  district?: string;
  region?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: string;
  specializations?: string[];
  subjects?: string[];
  experience?: number;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'volunteer';
  gesNumber?: string;
  gesStatus?: 'pending' | 'active' | 'transferred';
  ntcLicenseNumber?: string;
  ntcLicenseExpiry?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountName?: string;
  classTeacher?: boolean;
  formClassId?: string;
  schoolId?: string;
}

export async function addTeacher(data: AddTeacherData): Promise<Teacher> {
  try {
    // Get school ID if not provided
    if (!data.schoolId) {
      data.schoolId = await getSchoolId();
    }
    const response = await api.post('/teachers', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Add teacher error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update an existing teacher
 */
export interface UpdateTeacherData {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  ghanaCardNumber?: string;
  address?: string;
  district?: string;
  region?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  qualifications?: string;
  specializations?: string[];
  subjects?: string[];
  experience?: number;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'volunteer';
  gesNumber?: string;
  gesStatus?: 'pending' | 'active' | 'transferred';
  ntcLicenseNumber?: string;
  ntcLicenseExpiry?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountName?: string;
  classTeacher?: boolean;
  formClassId?: string;
  isActive?: boolean;
}

export async function updateTeacher(teacherId: string, data: UpdateTeacherData): Promise<Teacher> {
  try {
    const response = await api.put(`/teachers/${teacherId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update teacher error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete/Remove a teacher (soft delete)
 */
export async function deleteTeacher(teacherId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/teachers/${teacherId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete teacher error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get teacher stats
 */
export async function getTeacherStats(teacherId: string): Promise<any> {
  try {
    const response = await api.get(`/teachers/${teacherId}/stats`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher stats error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get teacher's assigned classes
 */
export async function getTeacherClasses(teacherId: string) {
  try {
    const response = await api.get(`/teachers/${teacherId}/classes`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher classes error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all teachers in a school (admin)
 */
export async function getSchoolTeachers(schoolId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  try {
    const response = await api.get(`/schools/${schoolId}/teachers`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get school teachers error:', error.response?.data || error.message);
    throw error;
  }
}

// Clear cached school ID (useful after logout)
export function clearSchoolIdCache() {
  cachedSchoolId = null;
}

/**
 * Get teacher's teaching load
 */
export async function getTeacherTeachingLoad(teacherId: string) {
  try {
    const response = await api.get(`/teachers/${teacherId}/teaching-load`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get teaching load error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// TEACHER — ASSESSMENTS
// ============================================

export async function getMyAssessments(params?: {
  status?: string;
  type?: string;
}) {
  try {
    const response = await api.get('/assessments', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get my assessments error:', error.response?.data || error.message);
    throw error;
  }
}

export async function createAssessment(data: {
  objectiveId: string;
  title: string;
  description?: string;
  type?: string;
  instructions?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  classId?: string;
}) {
  try {
    const response = await api.post('/assessments', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAssessmentById(assessmentId: string) {
  try {
    const response = await api.get(`/assessments/${assessmentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function updateAssessment(assessmentId: string, data: any) {
  try {
    const response = await api.put(`/assessments/${assessmentId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function deleteAssessment(assessmentId: string) {
  try {
    const response = await api.delete(`/assessments/${assessmentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Delete assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function publishAssessment(assessmentId: string) {
  try {
    const response = await api.post(`/assessments/${assessmentId}/publish`);
    return response.data.data;
  } catch (error: any) {
    console.error('Publish assessment error:', error.response?.data || error.message);
    throw error;
  }
}

export async function unpublishAssessment(assessmentId: string) {
  try {
    const response = await api.post(`/assessments/${assessmentId}/unpublish`);
    return response.data.data;
  } catch (error: any) {
    console.error('Unpublish assessment error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// TEACHER OBJECTIVES
// ============================================

export async function getTeacherObjectives() {
  try {
    const response = await api.get('/teachers/me/objectives');
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher objectives error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// QUESTIONS
// ============================================

export async function addQuestion(assessmentId: string, data: any) {
  try {
    const response = await api.post(`/assessments/${assessmentId}/questions`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Add question error:', error.response?.data || error.message);
    throw error;
  }
}

export async function updateQuestion(assessmentId: string, questionId: string, data: any) {
  try {
    const response = await api.put(`/assessments/${assessmentId}/questions/${questionId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update question error:', error.response?.data || error.message);
    throw error;
  }
}

export async function deleteQuestion(assessmentId: string, questionId: string) {
  try {
    const response = await api.delete(`/assessments/${assessmentId}/questions/${questionId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Delete question error:', error.response?.data || error.message);
    throw error;
  }
}

export async function reorderQuestions(assessmentId: string, questionIds: string[]) {
  try {
    const response = await api.put(`/assessments/${assessmentId}/questions/reorder`, { questionIds });
    return response.data.data;
  } catch (error: any) {
    console.error('Reorder questions error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// SUBMISSIONS
// ============================================

export async function getSubmissions(assessmentId: string, params?: { status?: string }) {
  try {
    const response = await api.get(`/assessments/${assessmentId}/submissions`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get submissions error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getSubmission(assessmentId: string, attemptId: string) {
  try {
    const response = await api.get(`/assessments/${assessmentId}/submissions/${attemptId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get submission error:', error.response?.data || error.message);
    throw error;
  }
}

export async function gradeAnswer(
  assessmentId: string,
  answerId: string,
  data: { pointsEarned: number; feedback?: string }
) {
  try {
    const response = await api.put(`/assessments/${assessmentId}/answers/${answerId}/grade`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Grade answer error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getAssessmentAnalytics(assessmentId: string) {
  try {
    const response = await api.get(`/assessments/${assessmentId}/analytics`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get assessment analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getClassAnalytics(classId: string) {
  try {
    const response = await api.get(`/assessments/teacher/classes/${classId}/analytics`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get class analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getStudentAnalytics(classId: string, studentId: string) {
  try {
    const response = await api.get(`/assessments/teacher/classes/${classId}/students/${studentId}/analytics`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student analytics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getTeacherAnalytics() {
  try {
    const response = await api.get('/assessments/teacher/analytics');
    return response.data.data;
  } catch (error: any) {
    console.error('Get teacher analytics error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// CLASSES
// ============================================

export async function getClasses(params?: {
  page?: number;
  limit?: number;
  level?: string;
}) {
  try {
    const schoolId = await getSchoolId();
    const response = await api.get(`/classes/school/${schoolId}`, { params });
    
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error: any) {
    console.error('Get classes error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Get class by ID - Works for teachers too
 * ✅ Uses /classes/:id (NOT /school/classes/:id)
 */
export async function getClassById(classId: string) {
  try {
    // ✅ FIXED: Use the general classes endpoint
    const response = await api.get(`/classes/${classId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get class error:', error.response?.data || error.message);
    throw error;
  }
}

export async function createClass(data: any) {
  try {
    const response = await api.post('/classes', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create class error:', error.response?.data || error.message);
    throw error;
  }
}

export async function updateClass(classId: string, data: any) {
  try {
    const response = await api.put(`/classes/${classId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update class error:', error.response?.data || error.message);
    throw error;
  }
}

export async function deleteClass(classId: string) {
  try {
    const response = await api.delete(`/classes/${classId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Delete class error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Assign teacher to class
 */
export async function assignTeacherToClass(teacherId: string, classId: string) {
  try {
    const response = await api.post(`/teachers/${teacherId}/assign-class`, { classId });
    return response.data.data;
  } catch (error: any) {
    console.error('Assign teacher to class error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Remove teacher from class
 */
export async function removeTeacherFromClass(teacherId: string, classId: string) {
  try {
    const response = await api.delete(`/teachers/${teacherId}/classes/${classId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Remove teacher from class error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// PARENTS
// ============================================

/**
 * Get all parents in the school
 */
export async function getParents(params?: {
  page?: number;
  limit?: number;
  search?: string;
  verified?: string;
}) {
  try {
    const response = await api.get('/school/parents', { params });
    
    // Handle different response structures
    const data = response.data;
    
    // If data.data exists and has parents array
    if (data.data?.parents) {
      const parents = data.data.parents.map((parent: any) => ({
        ...parent,
        students: parent.children || parent.students || []
      }));
      
      return {
        ...data.data,
        parents
      };
    }
    
    // If data.data is an array
    if (Array.isArray(data.data)) {
      const parents = data.data.map((parent: any) => ({
        ...parent,
        students: parent.children || parent.students || []
      }));
      
      return {
        parents,
        total: parents.length,
        page: params?.page || 1,
        totalPages: Math.ceil(parents.length / (params?.limit || 10))
      };
    }
    
    // If data itself is the result
    const result = data.data || { parents: [], total: 0, page: 1, totalPages: 1 };
    if (result.parents) {
      result.parents = result.parents.map((parent: any) => ({
        ...parent,
        students: parent.children || parent.students || []
      }));
    }
    
    return result;
  } catch (error: any) {
    console.error('Get parents error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get a single parent by ID (School Admin)
 */
export async function getParentById(parentId: string) {
  try {
    const response = await api.get(`/parents/${parentId}`);
    const data = response.data.data;
    
    // ✅ Transform the data to ensure 'students' property exists
    return {
      ...data,
      students: data.students || data.children || []
    };
  } catch (error: any) {
    console.error('Get parent error:', error.response?.data || error.message);
    throw error;
  }
}


/**
 * Get a single parent by ID (Admin)
 */
export async function getParent(parentId: string) {
  try {
    const response = await api.get(`/parents/${parentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Add a new parent (School Admin)
 */
export async function addParent(data: {
  // Parent Details
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  occupation?: string;
  relationship?: 'father' | 'mother' | 'guardian' | 'other';
  preferredLanguage?: string;
  notificationPreference?: 'whatsapp' | 'sms' | 'email' | 'all';
  
  // Linking
  linkType?: 'existing' | 'new';
  studentId?: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}) {
  try {
    const response = await api.post('/parents', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Add parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get students by class ID
 */
export async function getStudentsByClass(classId: string): Promise<{
  id: string;
  admissionNumber: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}[]> {
  try {
    const response = await api.get(`/students/class/${classId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get students by class error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update an existing parent
 */
export async function updateParent(parentId: string, data: {
  occupation?: string;
  relationship?: 'father' | 'mother' | 'guardian' | 'other';
  preferredLanguage?: string;
  notificationPreference?: 'whatsapp' | 'sms' | 'email' | 'all';
  isVerified?: boolean;
}) {
  try {
    const response = await api.put(`/parents/${parentId}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Update parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete/Remove a parent
 */
export async function deleteParent(parentId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/parents/${parentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify a parent (Admin)
 */
export async function verifyParent(parentId: string) {
  try {
    const response = await api.put(`/parents/${parentId}/verify`);
    return response.data.data;
  } catch (error: any) {
    console.error('Verify parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Link parent to student (Admin)
 */
export async function linkParentToStudent(data: {
  parentId: string;
  studentId: string;
  relationshipType?: 'father' | 'mother' | 'guardian' | 'other';
  isPrimaryContact?: boolean;
  canViewProgress?: boolean;
  canReceiveNotifications?: boolean;
}) {
  try {
    const response = await api.post('/parents/link', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Link parent to student error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Link student to parent (Parent self)
 */
export async function linkStudentToParent(data: {
  studentId: string;
  relationshipType?: 'father' | 'mother' | 'guardian' | 'other';
  isPrimaryContact?: boolean;
}) {
  try {
    const response = await api.post('/parents/me/link-student', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Link student to parent error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Remove link between parent and student
 */
export async function removeParentLink(parentId: string, studentId: string) {
  try {
    const response = await api.delete(`/parents/${parentId}/students/${studentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Remove parent link error:', error.response?.data || error.message);
    throw error;
  }
}


// ============================================
// PARENT DASHBOARD
// ============================================

export async function getParentDashboard() {
  try {
    const response = await api.get('/parents/me/dashboard');
    return response.data.data;
  } catch (error: any) {
    console.error('Get parent dashboard error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getParentProfile() {
  try {
    const response = await api.get('/parents/me');
    return response.data.data;
  } catch (error: any) {
    console.error('Get parent profile error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getMyChildren() {
  try {
    const response = await api.get('/parents/me/children');
    return response.data.data;
  } catch (error: any) {
    console.error('Get my children error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getChildOverview(studentId: string) {
  try {
    const response = await api.get(`/parents/me/children/${studentId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get child overview error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getChildProgress(studentId: string) {
  try {
    const response = await api.get(`/parents/me/children/${studentId}/learning-progress`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get child progress error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getChildAttendance(studentId: string, params?: { startDate?: string; endDate?: string }) {
  try {
    const response = await api.get(`/parents/me/children/${studentId}/attendance`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get child attendance error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getChildAssessments(studentId: string) {
  try {
    const response = await api.get(`/parents/me/children/${studentId}/assessments`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get child assessments error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// ATTENDANCE
// ============================================

/**
 * Get class roster with attendance status for a specific date
 */
export async function getClassRoster(classId: string, date?: string) {
  try {
    const params = date ? { date } : {};
    const response = await api.get(`/attendance/class/${classId}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get class roster error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Record attendance for students in a class
 */
export async function recordAttendance(classId: string, date: string, attendanceData: any[]) {
  try {
    const response = await api.post(`/attendance/class/${classId}/record`, {
      date,
      attendance: attendanceData
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Record attendance error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Confirm class attendance (teacher confirms gate scanned students)
 */
export async function confirmClassAttendance(classId: string, date: string, confirmations: any[]) {
  try {
    const response = await api.post(`/attendance/class/${classId}/confirm`, {
      date,
      confirmations
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Confirm class attendance error:', error.response?.data || error.message);
    throw error;
  }
}


/**
 * Generate student ID (QR code)
 */
export async function generateStudentId(studentId: string) {
  try {
    const response = await api.post(`/attendance/students/${studentId}/id`);
    return response.data.data;
  } catch (error: any) {
    console.error('Generate student ID error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get student ID (QR code)
 */
export async function getStudentId(studentId: string) {
  try {
    const response = await api.get(`/attendance/students/${studentId}/id`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get student ID error:', error.response?.data || error.message);
    throw error;
  }
}


/**
 * Get Staff ID by user ID
 */
export async function getStaffId(userId: string): Promise<any> {
  try {
    const response = await api.get(`/attendance/staff/id/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get staff ID error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all staff IDs for a school
 */
export async function getStaffIds(schoolId?: string): Promise<any[]> {
  try {
    const id = schoolId || await getSchoolId();
    const response = await api.get(`/attendance/staff/ids/${id}`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Get staff IDs error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Generate a Staff ID for a staff member
 */
export async function generateStaffId(userId: string): Promise<any> {
  try {
    const schoolId = await getSchoolId();
    const response = await api.post('/attendance/staff/id', { userId, schoolId });
    return response.data.data;
  } catch (error: any) {
    console.error('Generate staff ID error:', error.response?.data || error.message);
    throw error;
  }
}


export async function getClassAttendance(classId: string, date?: string) {
  try {
    const response = await api.get(`/attendance/class/${classId}`, { params: { date } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get class attendance error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getMyAttendance(params?: { startDate?: string; endDate?: string }) {
  try {
    const response = await api.get('/students/me/attendance', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get my attendance error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get attendance for a specific student
 */
export async function getStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get student attendance error:', error.response?.data || error.message);
    throw error;
  }
}



/**
 * Get today's attendance for a school
 */
export async function getTodayAttendance(schoolId: string) {
  try {
    const response = await api.get(`/attendance/today/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get today attendance error:', error.response?.data || error.message);
    throw error;
  }
}


/**
 * Get attendance statistics for a school
 */
export async function getAttendanceStats(schoolId: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get(`/attendance/stats/${schoolId}`, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get attendance stats error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// DEVICES
// ============================================

export async function getDevices(schoolId: string) {
  try {
    const response = await api.get(`/attendance/devices/school/${schoolId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get devices error:', error.response?.data || error.message);
    throw error;
  }
}

export async function registerDevice(data: any) {
  try {
    const response = await api.post('/attendance/devices', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Register device error:', error.response?.data || error.message);
    throw error;
  }
}

export async function activateDevice(deviceId: string, activationCode: string) {
  try {
    const response = await api.put(`/attendance/devices/${deviceId}/activate`, { activationCode });
    return response.data.data;
  } catch (error: any) {
    console.error('Activate device error:', error.response?.data || error.message);
    throw error;
  }
}

export async function removeDevice(deviceId: string) {
  try {
    const response = await api.delete(`/attendance/devices/${deviceId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Remove device error:', error.response?.data || error.message);
    throw error;
  }
}