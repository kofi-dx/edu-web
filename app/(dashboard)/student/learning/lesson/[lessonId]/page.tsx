/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getLesson, markLessonComplete } from '@/lib/services/schoolAdminService';

interface LessonDetail {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  summary: string;
  durationMinutes: number;
  status: string;
  completedAt: string | null;
  topic: any;
  objectives: any[];
  resources: any[];
  nextLesson: any;
  previousLesson: any;
}

export default function LessonViewPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const data = await getLesson(lessonId);
      setLesson(data);
    } catch (error: any) {
      console.error('Failed to fetch lesson:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await markLessonComplete(lessonId);
      toast.success('Lesson marked as complete! 🎉');
      await fetchLesson();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to mark lesson complete');
    } finally {
      setMarking(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf':
      case 'document': return <FileText className="h-4 w-4" />;
      case 'link': return <LinkIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Lesson not found</p>
        <Link href="/student/learning">
          <Button variant="outline" className="mt-4">Back to Learning</Button>
        </Link>
      </div>
    );
  }

  const isCompleted = lesson.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/student/learning" className="hover:text-text">Learning</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/student/learning/${lesson.topic?.subject?.id}`} className="hover:text-text">
          {lesson.topic?.subject?.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/student/learning/topic/${lesson.topic?.id}`} className="hover:text-text">
          {lesson.topic?.name}
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  Not Started
                </span>
              )}
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lesson.durationMinutes || 45} min
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text">{lesson.title}</h1>
          </div>
        </div>

        {lesson.summary && (
          <p className="text-text-secondary">{lesson.summary}</p>
        )}
      </div>

      {/* Objectives */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-akoma-green" />
            Learning Objectives
          </h2>
          <ul className="space-y-2">
            {lesson.objectives.map((obj: any) => (
              <li key={obj.id} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-akoma-green mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-text">{obj.title}</p>
                  {obj.description && (
                    <p className="text-xs text-text-secondary mt-0.5">{obj.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson Content */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4">Lesson Content</h2>
        {lesson.contentHtml ? (
          <div
            className="prose prose-sm max-w-none text-text"
            dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
          />
        ) : lesson.content ? (
          <div className="prose prose-sm max-w-none text-text whitespace-pre-wrap">
            {lesson.content}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">No content available for this lesson.</p>
        )}
      </div>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4">Resources</h2>
          <div className="space-y-2">
            {lesson.resources.map((resource: any) => (
              <a
                key={resource.id}
                href={resource.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{resource.title}</p>
                  <p className="text-xs text-text-secondary capitalize">{resource.type}</p>
                </div>
                <Download className="h-4 w-4 text-text-secondary" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-4">
        <div>
          {lesson.previousLesson && (
            <Link href={`/student/learning/lesson/${lesson.previousLesson.id}`}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted && (
            <Button
              onClick={handleMarkComplete}
              disabled={marking}
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            >
              {marking ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Mark as Complete
            </Button>
          )}
          {isCompleted && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Completed
            </span>
          )}

          {lesson.nextLesson && (
            <Link href={`/student/learning/lesson/${lesson.nextLesson.id}`}>
              <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}