/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ClipboardList,
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getAssessmentById,
  updateAssessment,
  addQuestion,
  updateQuestion as updateQuestionApi,
  deleteQuestion as deleteQuestionApi,
  publishAssessment,
  unpublishAssessment
} from '@/lib/services/schoolAdminService';

// ============================================
// TYPES
// ============================================

interface QuestionDraft {
  id: string; // local id OR server id (prefixed with 'server-')
  serverId?: string; // set if it came from the server
  isNew?: boolean;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open_ended';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ============================================
// COMPONENT
// ============================================

export default function EditAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  // Assessment state
  const [assessment, setAssessment] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('quiz');
  const [instructions, setInstructions] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [passingScore, setPassingScore] = useState(60);

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Loading/saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const data = await getAssessmentById(assessmentId);
      setAssessment(data);

      // Populate assessment fields
      setTitle(data.title || '');
      setDescription(data.description || '');
      setType(data.type || 'quiz');
      setInstructions(data.instructions || '');
      setTimeLimitMinutes(data.timeLimitMinutes || '');
      setPassingScore(data.passingScore || 60);

      // Map server questions to drafts
      const drafts: QuestionDraft[] = (data.questions || []).map((q: any) => ({
        id: `server-${q.id}`,
        serverId: q.id,
        isNew: false,
        type: q.type || 'multiple_choice',
        questionText: q.questionText || '',
        options: Array.isArray(q.options) && q.options.length > 0
          ? q.options
          : q.type === 'multiple_choice'
            ? ['', '', '', '']
            : [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        points: q.points || 1,
        difficulty: q.difficulty || 'medium'
      }));

      setQuestions(drafts);
    } catch (error: any) {
      console.error('Failed to fetch assessment:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // QUESTION MANAGEMENT
  // ============================================

  const addNewQuestion = () => {
    const newQ: QuestionDraft = {
      id: `new-${Date.now()}`,
      isNew: true,
      type: 'multiple_choice',
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      difficulty: 'medium'
    };
    setQuestions([...questions, newQ]);
  };

  const updateQ = (id: string, updates: Partial<QuestionDraft>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    const q = questions.find(x => x.id === id);
    if (q?.serverId) {
      setDeletedQuestionIds(prev => [...prev, q.serverId!]);
    }
    setQuestions(questions.filter(x => x.id !== id));
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      const oldValue = newOptions[idx];
      newOptions[idx] = value;
      const newCorrect = q.correctAnswer === oldValue ? value : q.correctAnswer;
      return { ...q, options: newOptions, correctAnswer: newCorrect };
    }));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: [...q.options, ''] };
    }));
  };

  const removeOption = (qId: string, idx: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const removedValue = q.options[idx];
      const newOptions = q.options.filter((_, i) => i !== idx);
      const newCorrect = q.correctAnswer === removedValue ? '' : q.correctAnswer;
      return { ...q, options: newOptions, correctAnswer: newCorrect };
    }));
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  // ============================================
  // VALIDATION
  // ============================================

  const validate = (): string | null => {
    if (!title.trim()) return 'Assessment title is required';
    if (questions.length === 0) return 'Add at least one question';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1}: question text is required`;

      if (q.type === 'multiple_choice') {
        const validOptions = q.options.filter(o => o.trim());
        if (validOptions.length < 2) return `Question ${i + 1}: need at least 2 options`;
        if (!q.correctAnswer.trim()) return `Question ${i + 1}: correct answer is required`;
        if (!validOptions.includes(q.correctAnswer)) {
          return `Question ${i + 1}: correct answer must be one of the options`;
        }
      }

      if (q.type === 'true_false' && !['True', 'False'].includes(q.correctAnswer)) {
        return `Question ${i + 1}: select correct answer (True/False)`;
      }

      if (q.type === 'fill_blank' && !q.correctAnswer.trim()) {
        return `Question ${i + 1}: correct answer is required`;
      }
    }
    return null;
  };

  // ============================================
  // SAVE
  // ============================================

  const handleSave = async (shouldPublish?: boolean) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      // 1. Update assessment metadata
      await updateAssessment(assessmentId, {
        title,
        description,
        type,
        instructions,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
        passingScore
      });

      // 2. Delete removed questions
      for (const qid of deletedQuestionIds) {
        try {
          await deleteQuestionApi(assessmentId, qid);
        } catch (err) {
          console.warn('Failed to delete question:', qid, err);
        }
      }

      // 3. Update existing questions or add new ones
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const payload = {
          type: q.type,
          questionText: q.questionText,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          difficulty: q.difficulty,
          orderIndex: i
        };

        if (q.isNew) {
          await addQuestion(assessmentId, payload);
        } else if (q.serverId) {
          await updateQuestionApi(assessmentId, q.serverId, payload);
        }
      }

      // 4. Publish/unpublish if requested
      if (shouldPublish === true && assessment?.status !== 'published') {
        await publishAssessment(assessmentId);
      } else if (shouldPublish === false && assessment?.status === 'published') {
        await unpublishAssessment(assessmentId);
      }

      toast.success('Assessment updated successfully!');
      router.push(`/teacher/assessments/${assessmentId}`);
    } catch (error: any) {
      console.error('Failed to update assessment:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to update assessment');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!assessment) return;
    setActionLoading(true);
    try {
      if (assessment.status === 'published') {
        await unpublishAssessment(assessmentId);
        toast.success('Assessment unpublished');
      } else {
        await publishAssessment(assessmentId);
        toast.success('Assessment published!');
      }
      await fetchAssessment();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to toggle publish');
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`/teacher/assessments/${assessmentId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessment
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Assessment</h1>
          <p className="text-text-secondary">{assessment.title}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePublishToggle}
            disabled={actionLoading}
            className="gap-2"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {assessment.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Assessment Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-akoma-green" />
          Assessment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Assessment Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="quiz">Quiz</option>
              <option value="test">Test</option>
              <option value="exam">Exam</option>
              <option value="homework">Homework</option>
              <option value="formative">Formative</option>
              <option value="summative">Summative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : '')}
              placeholder="Optional"
              min="1"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1.5">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">
            Questions ({questions.length})
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              Total: <span className="font-bold text-akoma-green">{totalPoints}</span> points
            </span>
            <Button
              onClick={addNewQuestion}
              size="sm"
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary mb-3">No questions yet</p>
            <Button onClick={addNewQuestion} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Question
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-akoma-green">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {q.isNew && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      <select
                        value={q.type}
                        onChange={(e) => updateQ(q.id, { type: e.target.value as any, correctAnswer: '' })}
                        className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="fill_blank">Fill in the Blank</option>
                        <option value="open_ended">Open Ended</option>
                      </select>
                      <select
                        value={q.difficulty}
                        onChange={(e) => updateQ(q.id, { difficulty: e.target.value as any })}
                        className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQ(q.id, { points: Number(e.target.value) })}
                          min="1"
                          className="w-16 text-xs px-2 py-1 rounded border border-gray-200"
                        />
                        <span className="text-xs text-text-secondary">points</span>
                      </div>
                    </div>

                    <textarea
                      value={q.questionText}
                      onChange={(e) => updateQ(q.id, { questionText: e.target.value })}
                      placeholder="Type your question..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(q.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Multiple choice */}
                {q.type === 'multiple_choice' && (
                  <div className="ml-11 space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === opt && opt.trim() !== ''}
                          onChange={() => updateQ(q.id, { correctAnswer: opt })}
                          className="h-4 w-4 text-akoma-green"
                        />
                        <span className="text-xs font-medium text-text-secondary w-5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 px-3 py-1.5 rounded border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm"
                        />
                        {q.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(q.id, optIdx)}
                            className="h-7 w-7 p-0 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(q.id)}
                      className="text-xs text-akoma-green gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add option
                    </Button>
                  </div>
                )}

                {/* True / False */}
                {q.type === 'true_false' && (
                  <div className="ml-11 flex gap-3">
                    {['True', 'False'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === opt}
                          onChange={() => updateQ(q.id, { correctAnswer: opt })}
                          className="h-4 w-4 text-akoma-green"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in the blank */}
                {q.type === 'fill_blank' && (
                  <div className="ml-11">
                    <label className="text-xs text-text-secondary block mb-1">
                      Correct Answer:
                    </label>
                    <input
                      type="text"
                      value={q.correctAnswer}
                      onChange={(e) => updateQ(q.id, { correctAnswer: e.target.value })}
                      placeholder="Type the correct answer"
                      className="w-full px-3 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm"
                    />
                  </div>
                )}

                {/* Open ended */}
                {q.type === 'open_ended' && (
                  <div className="ml-11">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-blue-700">
                        ℹ️ Open-ended questions are manually graded after submission.
                      </p>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="ml-11 mt-2">
                  <label className="text-xs text-text-secondary block mb-1">
                    Explanation (optional)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQ(q.id, { explanation: e.target.value })}
                    placeholder="Explain the answer..."
                    className="w-full px-3 py-1.5 rounded border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-white p-4 rounded-xl border border-gray-100 shadow-lg">
        <Link href={`/teacher/assessments/${assessmentId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={saving}
          >
            Save Only
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Save & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}