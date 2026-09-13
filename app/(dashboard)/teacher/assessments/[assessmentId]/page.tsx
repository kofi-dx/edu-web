/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Send,
  FileText,
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target,
  Trash2,
  Loader2,
  Eye,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getAssessmentById,
  publishAssessment,
  unpublishAssessment
} from '@/lib/services/schoolAdminService';

export default function AssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentById(assessmentId);
      setAssessment(data);
    } catch (error: any) {
      console.error('Failed to fetch assessment:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await publishAssessment(assessmentId);
      toast.success('Assessment published!');
      await fetchAssessment();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to publish');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setActionLoading(true);
    try {
      await unpublishAssessment(assessmentId);
      toast.success('Assessment unpublished');
      await fetchAssessment();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to unpublish');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <FileText className="h-3 w-3" />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertCircle className="h-3 w-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Assessment not found</p>
        <Link href="/teacher/assessments">
          <Button variant="outline" className="mt-4">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/assessments"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getStatusBadge(assessment.status)}
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {assessment.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">{assessment.title}</h1>
            {assessment.description && (
              <p className="text-text-secondary mb-3">{assessment.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {totalPoints} points
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Passing: {assessment.passingScore}%
              </span>
              {assessment.timeLimitMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {assessment.timeLimitMinutes} min
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href={`/teacher/assessments/${assessmentId}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Link href={`/teacher/assessments/${assessmentId}/submissions`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Submissions
              </Button>
            </Link>
            <Link href={`/teacher/assessments/${assessmentId}/analytics`}>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            {assessment.status === 'draft' && (
              <Button
                onClick={handlePublish}
                disabled={actionLoading}
                size="sm"
                className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Publish
              </Button>
            )}
            {assessment.status === 'published' && (
              <Button
                onClick={handleUnpublish}
                disabled={actionLoading}
                size="sm"
                variant="outline"
                className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Unpublish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {assessment.instructions && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructions</h3>
          <p className="text-sm text-blue-700 whitespace-pre-wrap">{assessment.instructions}</p>
        </div>
      )}

      {/* Curriculum Info */}
      {assessment.objective && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Curriculum
          </h3>
          <div className="space-y-2 text-sm">
            {assessment.objective.topic?.subject?.name && (
              <div className="flex items-center gap-2">
                <span className="text-text-secondary w-24">Subject:</span>
                <span className="text-text font-medium">
                  {assessment.objective.topic.subject.name}
                </span>
              </div>
            )}
            {assessment.objective.topic?.name && (
              <div className="flex items-center gap-2">
                <span className="text-text-secondary w-24">Topic:</span>
                <span className="text-text font-medium">
                  {assessment.objective.topic.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-text-secondary w-24">Objective:</span>
              <span className="text-text font-medium">
                {assessment.objective.title}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-akoma-green" />
            Questions ({questions.length})
          </h2>
          <Link href={`/teacher/assessments/${assessmentId}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Questions
            </Button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <HelpCircle className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary mb-3">No questions added yet</p>
            <Link href={`/teacher/assessments/${assessmentId}/edit`}>
              <Button variant="outline" className="gap-2">
                Add Questions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const isAnswerShown = showAnswers[q.id];
              return (
                <div key={q.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-akoma-green">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {q.type.replace('_', ' ')}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {q.difficulty || 'medium'}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {q.points} point{q.points !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-text font-medium mb-3 whitespace-pre-wrap">
                        {q.questionText}
                      </p>

                      {/* Multiple choice options */}
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-1.5 mb-2">
                          {(Array.isArray(q.options) ? q.options : Object.values(q.options)).map(
                            (opt: any, optIdx: number) => {
                              const isCorrect = opt === q.correctAnswer;
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2 p-2 rounded ${
                                    isCorrect
                                      ? 'bg-green-50 border border-green-200'
                                      : 'bg-gray-50'
                                  }`}
                                >
                                  <span className={`text-xs font-bold w-5 ${
                                    isCorrect ? 'text-green-700' : 'text-text-secondary'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className={`text-sm ${
                                    isCorrect ? 'text-green-800 font-medium' : 'text-text'
                                  }`}>
                                    {opt}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}

                      {/* True/False */}
                      {q.type === 'true_false' && (
                        <div className="flex gap-3 mb-2">
                          {['True', 'False'].map((opt) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div
                                key={opt}
                                className={`px-3 py-1.5 rounded text-sm ${
                                  isCorrect
                                    ? 'bg-green-50 border border-green-200 text-green-800 font-medium'
                                    : 'bg-gray-50 text-text'
                                }`}
                              >
                                {opt} {isCorrect && '✓'}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill in blank */}
                      {q.type === 'fill_blank' && (
                        <div className="mb-2">
                          <span className="text-xs text-text-secondary">Correct: </span>
                          <span className="text-sm text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded">
                            {q.correctAnswer}
                          </span>
                        </div>
                      )}

                      {/* Answer toggle for open_ended */}
                      {q.type === 'open_ended' && (
                        <div className="mb-2">
                          <button
                            onClick={() => setShowAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                            className="text-xs text-akoma-green hover:underline flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {isAnswerShown ? 'Hide' : 'Show'} model answer
                          </button>
                          {isAnswerShown && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                              {q.correctAnswer || '(No model answer provided)'}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {assessment.status === 'draft' && (
        <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Delete this assessment</p>
              <p className="text-xs text-text-secondary">
                Once deleted, it cannot be recovered.
              </p>
            </div>
            <Link href={`/teacher/assessments/${assessmentId}/edit`}>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-2">
                <Trash2 className="h-4 w-4" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 