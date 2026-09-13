/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  CheckCircle,
  Clock,
  PlayCircle,
  Target,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { getStudentLessons } from '@/lib/services/schoolAdminService';

interface Lesson {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  status: 'not_started' | 'in_progress' | 'completed';
  orderIndex: number;
  objective?: {
    id: string;
    title: string;
    code: string;
  };
}

interface TopicInfo {
  id: string;
  name: string;
  description: string;
  subject: any;
}

export default function TopicLessonsPage() {
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<TopicInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [topicId]);

  const fetchLessons = async () => {
    try {
      const data = await getStudentLessons(topicId);
      setTopic(data.topic);
      setLessons(data.lessons || []);
    } catch (error: any) {
      console.error('Failed to fetch lessons:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  // Group lessons by objective
  const groupedLessons = lessons.reduce((acc: Record<string, { objective: any; lessons: Lesson[] }>, lesson) => {
    const key = lesson.objective?.id || 'no-objective';
    if (!acc[key]) {
      acc[key] = {
        objective: lesson.objective || null,
        lessons: []
      };
    }
    acc[key].lessons.push(lesson);
    return acc;
  }, {});

  const hasObjectives = lessons.some(l => l.objective);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`/student/learning/${topic?.subject?.id}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {topic?.subject?.name || 'Subject'}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">{topic?.name}</h1>
        {topic?.description && (
          <p className="text-text-secondary mt-1">{topic.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {lessons.filter(l => l.status === 'completed').length} completed
          </span>
        </div>
      </div>

      {/* Lessons */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <FileText className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No lessons available for this topic</p>
        </div>
      ) : hasObjectives ? (
        // Grouped by objective
        <div className="space-y-6">
          {Object.entries(groupedLessons).map(([key, group]) => (
            <div key={key}>
              {/* Objective Header */}
              {group.objective && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Target className="h-4 w-4 text-akoma-green" />
                  <h2 className="text-sm font-semibold text-text">
                    {group.objective.title}
                  </h2>
                  {group.objective.code && (
                    <span className="text-xs text-text-secondary font-mono">
                      {group.objective.code}
                    </span>
                  )}
                </div>
              )}

              {/* Lessons in this objective */}
              <div className="space-y-2">
                {group.lessons.map((lesson, index) => (
                  <LessonCard key={lesson.id} lesson={lesson} index={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list (no objectives)
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <LessonCard key={lesson.id} lesson={lesson} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// LESSON CARD COMPONENT
// ============================================
function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <Link
      href={`/student/learning/lesson/${lesson.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className="shrink-0">
          {lesson.status === 'completed' ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : lesson.status === 'in_progress' ? (
            <PlayCircle className="h-8 w-8 text-akoma-green" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-text-secondary">
                {index + 1}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-text mb-1 truncate">
                {lesson.title}
              </h3>
              {lesson.summary && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {lesson.summary}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lesson.durationMinutes || 45} min
            </span>
            <span
              className={`capitalize ${
                lesson.status === 'completed'
                  ? 'text-green-600 font-medium'
                  : lesson.status === 'in_progress'
                  ? 'text-akoma-green font-medium'
                  : 'text-text-secondary'
              }`}
            >
              {lesson.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}