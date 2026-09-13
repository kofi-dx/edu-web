/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getStudentTopics } from '@/lib/services/schoolAdminService';

interface Topic {
  id: string;
  name: string;
  code: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  description: string;
}

export default function SubjectTopicsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<SubjectInfo | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [subjectId]);

  const fetchTopics = async () => {
    try {
      const data = await getStudentTopics(subjectId);
      setSubject(data.subject);
      setTopics(data.topics || []);
    } catch (error: any) {
      console.error('Failed to fetch topics:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/student/learning"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subjects
      </Link>

      {/* Header */}
      <div className="bg-linear-to-r from-akoma-green to-akoma-dark rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">{subject?.name}</h1>
        {subject?.code && (
          <p className="text-white/80 font-mono text-sm mt-1">{subject.code}</p>
        )}
        {subject?.description && (
          <p className="text-white/80 mt-2">{subject.description}</p>
        )}
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No topics available for this subject</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const isComplete = topic.progressPercentage === 100;
            const hasStarted = topic.progressPercentage > 0;

            return (
              <Link
                key={topic.id}
                href={`/student/learning/topic/${topic.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isComplete
                        ? 'bg-green-100'
                        : hasStarted
                        ? 'bg-akoma-green/10'
                        : 'bg-gray-100'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : hasStarted ? (
                      <PlayCircle className="h-5 w-5 text-akoma-green" />
                    ) : (
                      <span className="text-sm font-bold text-text-secondary">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-text mb-1">
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                            {topic.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {topic.totalLessons || 0} lessons
                      </span>
                      {topic.completedLessons > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {topic.completedLessons} completed
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">
                          {isComplete ? 'Completed' : hasStarted ? 'In Progress' : 'Not Started'}
                        </span>
                        <span className="text-xs font-medium text-akoma-green">
                          {topic.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isComplete ? 'bg-green-500' : 'bg-akoma-green'
                          }`}
                          style={{ width: `${topic.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}