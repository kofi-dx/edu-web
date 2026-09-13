/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/services/naccaService.ts
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export interface CurriculumWithCounts {
  id: string;
  name: string;
  code?: string | null;
  source: string;
  status: 'draft' | 'published' | 'archived';
  visibility: string;
  version: string;
  year: number | null;
  createdAt: string;
  levelCount: number;
  subjectCount: number;
  topicCount: number;
  objectiveCount: number;
  lessonCount: number;
  publishedLessonCount: number;
}

export interface DashboardStats {
  totals: {
    curricula: number;
    publishedCurricula: number;
    draftCurricula: number;
    archivedCurricula: number;
    levels: number;
    subjects: number;
    topics: number;
    objectives: number;
    lessons: number;
    publishedLessons: number;
    draftLessons: number;
    resources: number;
    assessments: number;
    questions: number;
  };
  publishStatus: {
    published: number;
    draft: number;
    archived: number;
  };
  curricula: CurriculumWithCounts[];
}

export interface LevelBreakdown {
  levelType: string;
  name: string;
  code: string | null;
  subjects: number;
  topics: number;
  objectives: number;
  lessons: number;
  publishedLessons: number;
}

export interface RecentActivityItem {
  type: 'curriculum' | 'subject' | 'topic' | 'lesson';
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

export interface PublishStatus {
  curricula: {
    draft: number;
    published: number;
    archived: number;
  };
  lessons: {
    draft: number;
    published: number;
    archived: number;
  };
}

export interface CoverageCell {
  covered: boolean;
  subjectId?: string;
  topicCount: number;
}

export interface CoverageRow {
  subject: string;
  levels: Record<string, CoverageCell>;
}

export interface Coverage {
  subjects: string[];
  levels: string[];
  matrix: CoverageRow[];
  stats: {
    totalSubjects: number;
    totalLevels: number;
    totalCells: number;
    coveredCells: number;
    coveragePercentage: number;
  };
}

export interface FullSnapshot {
  stats: DashboardStats;
  levelBreakdown: LevelBreakdown[];
  recentActivity: RecentActivityItem[];
  publishStatus: PublishStatus;
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await api.get('/curriculum/dashboard/stats');
    return response.data.data;
  } catch (error: any) {
    console.error('Get dashboard stats error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// LEVEL BREAKDOWN
// ============================================

export async function getLevelBreakdown(): Promise<LevelBreakdown[]> {
  try {
    const response = await api.get('/curriculum/dashboard/levels');
    return response.data.data;
  } catch (error: any) {
    console.error('Get level breakdown error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// RECENT ACTIVITY
// ============================================

export async function getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  try {
    const response = await api.get('/curriculum/dashboard/recent', { params: { limit } });
    return response.data.data;
  } catch (error: any) {
    console.error('Get recent activity error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// PUBLISH STATUS
// ============================================

export async function getPublishStatus(): Promise<PublishStatus> {
  try {
    const response = await api.get('/curriculum/dashboard/publish-status');
    return response.data.data;
  } catch (error: any) {
    console.error('Get publish status error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// COVERAGE
// ============================================

export async function getCoverage(): Promise<Coverage> {
  try {
    const response = await api.get('/curriculum/dashboard/coverage');
    return response.data.data;
  } catch (error: any) {
    console.error('Get coverage error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// FULL SNAPSHOT
// ============================================

export async function getFullSnapshot(): Promise<FullSnapshot> {
  try {
    const response = await api.get('/curriculum/dashboard/snapshot');
    return response.data.data;
  } catch (error: any) {
    console.error('Get full snapshot error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// EXISTING CURRICULUM CRUD (via existing endpoints)
// ============================================

export async function getAllCurricula(params?: {
  page?: number;
  limit?: number;
  source?: string;
  visibility?: string;
  status?: string;
}) {
  try {
    const response = await api.get('/curriculum', { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Get all curricula error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getCurriculumById(curriculumId: string) {
  try {
    const response = await api.get(`/curriculum/${curriculumId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get curriculum error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getLevelsByCurriculum(curriculumId: string) {
  try {
    const response = await api.get(`/curriculum/${curriculumId}/levels`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get levels error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getSubjectsByLevel(levelId: string) {
  try {
    const response = await api.get(`/curriculum/levels/${levelId}/subjects`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get subjects error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getTopicsBySubject(subjectId: string) {
  try {
    const response = await api.get(`/curriculum/subjects/${subjectId}/topics`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get topics error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getObjectivesByTopic(topicId: string) {
  try {
    const response = await api.get(`/curriculum/topics/${topicId}/objectives`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get objectives error:', error.response?.data || error.message);
    throw error;
  }
}

export async function getLessonsByObjective(objectiveId: string) {
  try {
    const response = await api.get(`/curriculum/objectives/${objectiveId}/lessons`);
    return response.data.data;
  } catch (error: any) {
    console.error('Get lessons error:', error.response?.data || error.message);
    throw error;
  }
}