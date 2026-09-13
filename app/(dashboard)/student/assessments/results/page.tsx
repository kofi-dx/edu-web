/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { getStudentResults } from '@/lib/services/schoolAdminService';

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getStudentResults();
      setResults(data.results || []);
    } catch (error: any) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load results');
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

  return (
    <div className="space-y-6">
      <Link
        href="/student/assessments"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">My Results</h1>
        <p className="text-text-secondary">View your assessment results and performance</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Trophy className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No results available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result: any) => (
            <div key={result.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-text mb-2">{result.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{result.subject}</span>
                <span className="text-lg font-bold text-akoma-green">{result.score}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}