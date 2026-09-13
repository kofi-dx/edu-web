/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getStudentProgress } from '@/lib/services/schoolAdminService';

export default function StudentProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const result = await getStudentProgress();
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const overall = data?.overall || { totalLessons: 0, completedLessons: 0, progressPercentage: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Progress</h1>
        <p className="text-text-secondary">Track your learning progress across subjects</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Lessons</p>
              <p className="text-2xl font-bold text-text">{overall.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Completed</p>
              <p className="text-2xl font-bold text-text">{overall.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Overall Progress</p>
              <p className="text-2xl font-bold text-text">{overall.progressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Subject Progress
        </h2>

        {data?.subjects && data.subjects.length > 0 ? (
          <div className="space-y-4">
            {data.subjects.map((subject: any) => (
              <div key={subject.subjectId}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text">{subject.subjectName}</p>
                    <p className="text-xs text-text-secondary">
                      {subject.completedLessons} of {subject.totalLessons} lessons
                    </p>
                  </div>
                  <span className="text-sm font-bold text-akoma-green">
                    {subject.progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-akoma-green rounded-full transition-all"
                    style={{ width: `${subject.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm text-center py-6">
            No progress data available yet
          </p>
        )}
      </div>
    </div>
  );
}