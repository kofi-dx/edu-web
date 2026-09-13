/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  Search,
  BookMarked
} from 'lucide-react';
import { toast } from 'sonner';
import { getStudentSubjects } from '@/lib/services/schoolAdminService';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  topicCount: number;
}

export default function StudentLearningPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getStudentSubjects();
      setSubjects(data.subjects || []);
      setStudentInfo(data.student || null);
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Learning</h1>
        <p className="text-text-secondary">
          {studentInfo?.className
            ? `${studentInfo.className} • ${studentInfo.level?.replace('_', ' ')}`
            : 'Browse subjects and start learning'}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No subjects match your search' : 'No subjects available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/student/learning/${subject.id}`}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-akoma-green/10 flex items-center justify-center">
                  <BookMarked className="h-6 w-6 text-akoma-green" />
                </div>
                <ChevronRight className="h-5 w-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </div>

              <h3 className="font-semibold text-text mb-1">{subject.name}</h3>
              {subject.code && (
                <p className="text-xs text-text-secondary font-mono mb-2">{subject.code}</p>
              )}
              {subject.description && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {subject.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                <span>{subject.topicCount || 0} topics</span>
                <span>•</span>
                <span>{subject.totalLessons || 0} lessons</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">Progress</span>
                  <span className="text-xs font-medium text-akoma-green">
                    {subject.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-akoma-green rounded-full transition-all"
                    style={{ width: `${subject.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}