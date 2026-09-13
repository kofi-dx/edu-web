/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStudentAssessments } from '@/lib/services/schoolAdminService';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  duration: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
}

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const data = await getStudentAssessments();
      setAssessments(data.assessments || []);
    } catch (error: any) {
      console.error('Failed to fetch assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = assessments.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Assessments</h1>
          <p className="text-text-secondary">Take assessments and track your results</p>
        </div>
        <Link href="/student/assessments/results">
          <Button variant="outline">View Results</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No assessments match your search' : 'No assessments available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {assessment.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                    ) : assessment.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <PlayCircle className="h-3 w-3" />
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <AlertCircle className="h-3 w-3" />
                        Not Started
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-text mb-1">{assessment.title}</h3>
                  <p className="text-sm text-text-secondary">{assessment.subject}</p>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    {assessment.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {assessment.duration} min
                      </span>
                    )}
                    {assessment.dueDate && (
                      <span>Due: {assessment.dueDate}</span>
                    )}
                  </div>
                </div>

                <div>
                  {assessment.status === 'completed' ? (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-akoma-green">{assessment.score || 0}%</p>
                      <p className="text-xs text-text-secondary">Score</p>
                    </div>
                  ) : (
                    <Link href={`/student/assessments/${assessment.id}`}>
                      <Button className="bg-akoma-green hover:bg-akoma-dark text-white">
                        {assessment.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}