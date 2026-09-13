/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Trophy,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { startAssessment, submitAssessment } from '@/lib/services/schoolAdminService';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open_ended';
  options?: string[];
  points: number;
  orderIndex: number;
}

interface AssessmentData {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  totalPoints: number;
  questions: Question[];
}

interface AttemptData {
  id: string;
  attemptNumber: number;
  startedAt: string;
  status: string;
}

export default function TakeAssessmentPage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Start the assessment on mount
  useEffect(() => {
    startTheAssessment();
  }, [assessmentId]);

  // Timer
  useEffect(() => {
    if (!attempt || result) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt, result]);

  const startTheAssessment = async () => {
    setStarting(true);
    try {
      const data = await startAssessment(assessmentId);
      setAssessment({
        id: data.assessment.id,
        title: data.assessment.title,
        description: data.assessment.description,
        durationMinutes: data.assessment.durationMinutes,
        passingScore: data.assessment.passingScore,
        totalPoints: data.assessment.totalPoints,
        questions: data.questions || []
      });
      setAttempt(data.attempt);
      setStartTime(Date.now());
    } catch (error: any) {
      console.error('Failed to start assessment:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to start assessment');
    } finally {
      setStarting(false);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    const unanswered = assessment.questions.filter(q => !answers[q.id]);

    if (unanswered.length > 0 && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = assessment.questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || '',
        timeSpentSeconds: 0
      }));

      const data = await submitAssessment(assessmentId, {
        answers: answerArray,
        timeSpentSeconds: elapsedSeconds
      });

      setResult(data);
      toast.success(data.message || 'Assessment submitted!');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || starting) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Starting assessment...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULT VIEW
  // ============================================
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.passed ? (
              <Trophy className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-text mb-2">
            {result.passed ? 'Congratulations! 🎉' : 'Keep Trying!'}
          </h1>
          <p className="text-text-secondary mb-6">{result.message}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Score</p>
              <p className="text-2xl font-bold text-akoma-green">{result.percentage}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Points</p>
              <p className="text-2xl font-bold text-text">
                {result.score}/{result.totalPoints}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Correct</p>
              <p className="text-2xl font-bold text-text">
                {result.correctCount}/{result.totalQuestions}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${
            result.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm ${result.passed ? 'text-green-700' : 'text-yellow-700'}`}>
              Passing score: {result.passingScore}%
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/student/assessments">
              <Button variant="outline">Back to Assessments</Button>
            </Link>
            <Link href="/student/assessments/results">
              <Button className="bg-akoma-green hover:bg-akoma-dark text-white">
                View All Results
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ASSESSMENT VIEW
  // ============================================
  if (!assessment || !attempt) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-text-secondary">Assessment not available</p>
        <Link href="/student/assessments">
          <Button variant="outline" className="mt-4">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
  const totalQuestions = assessment.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/student/assessments"
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <h1 className="font-bold text-text truncate">{assessment.title}</h1>
            <p className="text-xs text-text-secondary">
              Attempt #{attempt.attemptNumber}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-akoma-green/10 text-akoma-green flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-text-secondary">
              {answeredCount} answered
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-akoma-green rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-akoma-green">
              {currentIndex + 1}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-text font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-2">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-akoma-green bg-akoma-green/5'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                    isSelected
                      ? 'bg-akoma-green text-white'
                      : 'bg-gray-100 text-text-secondary'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-sm text-text">{option}</span>
                </button>
              );
            })
          )}

          {currentQuestion.type === 'true_false' && (
            <>
              {['True', 'False'].map((option) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange(currentQuestion.id, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-akoma-green bg-akoma-green/5'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-akoma-green' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-akoma-green" />}
                    </div>
                    <span className="text-sm text-text font-medium">{option}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
            />
          )}

          {currentQuestion.type === 'open_ended' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Question dots */}
          {assessment.questions.length <= 10 && (
            <div className="hidden md:flex items-center gap-1">
              {assessment.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-akoma-green'
                      : answers[q.id]
                      ? 'bg-akoma-green/50'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Submit Assessment?</h3>
                <p className="text-sm text-text-secondary">
                  {totalQuestions - answeredCount} unanswered question(s)
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-6">
              You have {totalQuestions - answeredCount} unanswered question
              {totalQuestions - answeredCount !== 1 ? 's' : ''}.
              Are you sure you want to submit?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                disabled={submitting}
              >
                Keep Answering
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-akoma-green hover:bg-akoma-dark text-white"
              >
                {submitting ? 'Submitting...' : 'Submit Anyway'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}