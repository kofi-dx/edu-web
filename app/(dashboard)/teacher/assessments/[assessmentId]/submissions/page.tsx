/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock, 
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users, 
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getSubmissions,
  getSubmission,
  gradeAnswer
} from '@/lib/services/schoolAdminService';

// ============================================
// TYPES
// ============================================

interface Submission {
  id: string;
  attemptNumber: number;
  status: string;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  gradedAt: string | null;
  timeSpentSeconds: number;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    className: string;
  } | null;
}

// ============================================
// COMPONENT
// ============================================

export default function SubmissionsPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Submission detail modal
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [submissionDetail, setSubmissionDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Grading
  const [gradingValues, setGradingValues] = useState<Record<string, { points: string; feedback: string }>>({});
  const [savingGrade, setSavingGrade] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [assessmentId, filterStatus]);

  useEffect(() => {
    if (selectedAttemptId) {
      fetchSubmissionDetail();
    }
  }, [selectedAttemptId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const result = await getSubmissions(assessmentId, params);
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch submissions:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionDetail = async () => {
    if (!selectedAttemptId) return;
    setLoadingDetail(true);
    try {
      const result = await getSubmission(assessmentId, selectedAttemptId);
      setSubmissionDetail(result);

      // Initialize grading values
      const initVals: Record<string, { points: string; feedback: string }> = {};
      (result.answers || []).forEach((a: any) => {
        initVals[a.id] = {
          points: String(a.pointsEarned || 0),
          feedback: a.feedback || ''
        };
      });
      setGradingValues(initVals);
    } catch (error: any) {
      console.error('Failed to fetch submission:', error);
      toast.error('Failed to load submission detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleGradeAnswer = async (answerId: string, maxPoints: number) => {
    const values = gradingValues[answerId];
    if (!values) return;

    const points = Number(values.points);
    if (isNaN(points) || points < 0 || points > maxPoints) {
      toast.error(`Points must be between 0 and ${maxPoints}`);
      return;
    }

    setSavingGrade(answerId);
    try {
      await gradeAnswer(assessmentId, answerId, {
        pointsEarned: points,
        feedback: values.feedback
      });
      toast.success('Answer graded');
      // Refresh both detail and list
      await fetchSubmissionDetail();
      await fetchSubmissions();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to grade answer');
    } finally {
      setSavingGrade(null);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Submissions not available</p>
        <Link href="/teacher/assessments">
          <Button variant="outline" className="mt-4">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const stats = data.stats || {};
  const submissions: Submission[] = data.submissions || [];

  const filtered = submissions.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.student?.firstName?.toLowerCase().includes(term) ||
      s.student?.lastName?.toLowerCase().includes(term) ||
      s.student?.admissionNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/assessments/${assessmentId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">Submissions</h1>
        <p className="text-text-secondary">{data.assessment?.title}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Total</p>
              <p className="text-xl font-bold text-text">{stats.total || 0}</p>
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
              <p className="text-xl font-bold text-text">{stats.passed || 0}</p>
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
              <p className="text-xl font-bold text-text">{stats.failed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Pending</p>
              <p className="text-xl font-bold text-text">{stats.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Average</p>
              <p className="text-xl font-bold text-text">{stats.averageScore || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="graded">Graded</option>
            <option value="submitted">Pending</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No submissions match your search' : 'No submissions yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Class</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Attempt</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Score</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Submitted</th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-akoma-green">
                            {sub.student?.firstName?.[0]}{sub.student?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {sub.student?.firstName} {sub.student?.lastName}
                          </p>
                          <p className="text-xs text-text-secondary font-mono">
                            {sub.student?.admissionNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {sub.student?.className || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        #{sub.attemptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {sub.status === 'graded' ? (
                        <div>
                          <p className={`text-sm font-bold ${
                            sub.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sub.percentage}%
                          </p>
                          <p className="text-xs text-text-secondary">
                            {sub.score} pts
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {sub.status === 'graded' && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {sub.passed ? (
                            <><CheckCircle className="h-3 w-3" /> Passed</>
                          ) : (
                            <><XCircle className="h-3 w-3" /> Failed</>
                          )}
                        </span>
                      )}
                      {sub.status === 'submitted' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {sub.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <AlertCircle className="h-3 w-3" />
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-text-secondary">
                      {sub.submittedAt ? formatDate(sub.submittedAt) : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAttemptId(sub.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedAttemptId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-text">Submission Detail</h2>
                {submissionDetail?.student && (
                  <p className="text-sm text-text-secondary">
                    {submissionDetail.student.user?.firstName} {submissionDetail.student.user?.lastName}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAttemptId(null);
                  setSubmissionDetail(null);
                }}
              >
                Close
              </Button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-akoma-green" />
              </div>
            ) : submissionDetail ? (
              <div className="p-5 space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-text-secondary">Score</p>
                    <p className="text-lg font-bold text-akoma-green">
                      {submissionDetail.score || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Percentage</p>
                    <p className="text-lg font-bold text-text">
                      {Math.round(submissionDetail.percentage || 0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Status</p>
                    <p className="text-lg font-bold capitalize text-text">
                      {submissionDetail.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Time</p>
                    <p className="text-lg font-bold text-text">
                      {formatTime(submissionDetail.timeSpentSeconds)}
                    </p>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-text">Answers</h3>
                  {(submissionDetail.answers || []).length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No answers recorded
                    </p>
                  ) : (
                    submissionDetail.answers.map((ans: any, idx: number) => {
                      const q = ans.question;
                      const isOpenEnded = q?.type === 'open_ended';
                      const maxPoints = q?.points || 1;
                      const gradeVal = gradingValues[ans.id] || { points: '0', feedback: '' };

                      return (
                        <div key={ans.id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-akoma-green">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text mb-2">
                                {q?.questionText}
                              </p>

                              {/* Student answer */}
                              <div className="bg-gray-50 rounded p-3 mb-2">
                                <p className="text-xs text-text-secondary mb-1">Student&apos;s Answer:</p>
                                <p className="text-sm text-text">{ans.answer || '(No answer)'}</p>
                              </div>

                              {/* Auto-grade result */}
                              {!isOpenEnded && (
                                <div className={`flex items-center gap-2 p-2 rounded ${
                                  ans.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {ans.isCorrect ? (
                                    <><CheckCircle className="h-4 w-4" /> Correct — {ans.pointsEarned}/{maxPoints} pts</>
                                  ) : (
                                    <><XCircle className="h-4 w-4" /> Incorrect — {ans.pointsEarned}/{maxPoints} pts</>
                                  )}
                                </div>
                              )}

                              {/* Manual grading for open-ended */}
                              {isOpenEnded && (
                                <div className="mt-3 bg-blue-50 rounded p-3 border border-blue-100">
                                  <p className="text-xs font-medium text-blue-800 mb-2">
                                    Manual Grading (max {maxPoints} pts)
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max={maxPoints}
                                      value={gradeVal.points}
                                      onChange={(e) => setGradingValues(prev => ({
                                        ...prev,
                                        [ans.id]: { ...gradeVal, points: e.target.value }
                                      }))}
                                      className="px-3 py-1.5 rounded border border-blue-200 text-sm"
                                      placeholder="Points"
                                    />
                                    <input
                                      type="text"
                                      value={gradeVal.feedback}
                                      onChange={(e) => setGradingValues(prev => ({
                                        ...prev,
                                        [ans.id]: { ...gradeVal, feedback: e.target.value }
                                      }))}
                                      className="md:col-span-2 px-3 py-1.5 rounded border border-blue-200 text-sm"
                                      placeholder="Feedback (optional)"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleGradeAnswer(ans.id, maxPoints)}
                                      disabled={savingGrade === ans.id}
                                      className="bg-akoma-green hover:bg-akoma-dark text-white"
                                    >
                                      {savingGrade === ans.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  {ans.status === 'graded' && (
                                    <p className="text-xs text-green-700 mt-2">
                                      ✓ Graded: {ans.pointsEarned}/{maxPoints} pts
                                      {ans.feedback && ` — "${ans.feedback}"`}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}