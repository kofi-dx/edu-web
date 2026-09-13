/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { getChildAssessments } from '@/lib/services/schoolAdminService';

export default function ChildAssessmentsPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [studentId]);

  const fetchAssessments = async () => {
    try {
      const result = await getChildAssessments(studentId);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch assessments:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load assessments');
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

  const summary = data?.summary || { totalAttempts: 0, passedCount: 0, failedCount: 0, averageScore: 0 };

  return (
    <div className="space-y-6">
      <Link
        href={`/parent/children/${studentId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Child
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">Assessment Results</h1>
        <p className="text-text-secondary">
          {data?.student?.name || 'Child'}&apos;s assessment history
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Attempts</p>
              <p className="text-xl font-bold text-text">{summary.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Passed</p>
              <p className="text-xl font-bold text-text">{summary.passedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Failed</p>
              <p className="text-xl font-bold text-text">{summary.failedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Average</p>
              <p className="text-xl font-bold text-text">{summary.averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-text">All Results</h2>
        </div>

        {data?.assessments && data.assessments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.assessments.map((attempt: any) => (
              <div key={attempt.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="h-3 w-3" />
                          Failed
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        Attempt #{attempt.attemptNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text mb-1">{attempt.title}</h3>
                    <p className="text-xs text-text-secondary">{attempt.subject}</p>
                    {attempt.submittedAt && (
                      <p className="text-xs text-text-secondary mt-1">
                        Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-akoma-green">
                      {attempt.percentage}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      {attempt.score} points
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">No assessment results yet</p>
          </div>
        )}
      </div>
    </div>
  );
}