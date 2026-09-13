/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ClipboardList,
  Loader2,
  CheckCircle,
  Target, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  createAssessment,
  addQuestion,
  publishAssessment,
  getTeacherObjectives,
  getMyTeacherClasses
} from '@/lib/services/schoolAdminService';

// ============================================
// TYPES
// ============================================

interface QuestionDraft {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open_ended';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ObjectiveOption {
  id: string;
  title: string;
  code: string;
  topic?: { id: string; name: string };
  subject?: { id: string; name: string };
  classId?: string;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function CreateAssessmentPage() {
  const router = useRouter();

  // Assessment info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('quiz');
  const [instructions, setInstructions] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [passingScore, setPassingScore] = useState(60);

  // Curriculum target
  const [objectiveId, setObjectiveId] = useState('');
  const [objectives, setObjectives] = useState<ObjectiveOption[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  // Class target (optional)
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);

  // Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  // Submit
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingObjectives(true);
    try {
      // Fetch objectives AND classes in parallel
      const [objectivesData, classesData] = await Promise.all([
        getTeacherObjectives().catch(() => []),
        getMyTeacherClasses().catch(() => [])
      ]);

      setObjectives(Array.isArray(objectivesData) ? objectivesData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error: any) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load objectives. Please contact admin.');
    } finally {
      setLoadingObjectives(false);
    }
  };

  // ============================================
  // QUESTION MANAGEMENT
  // ============================================

  const addNewQuestion = () => {
    const newQ: QuestionDraft = {
      id: `q-${Date.now()}`,
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

  const updateQuestion = (id: string, updates: Partial<QuestionDraft>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[idx] = value;
      // If the previously-selected correct answer is being edited, clear it
      const newCorrect = q.correctAnswer === q.options[idx] ? value : q.correctAnswer;
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
      // If removed option was the correct answer, clear it
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
    if (!objectiveId) return 'Please select a learning objective';
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

  const handleSave = async (shouldPublish: boolean = false) => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      // 1. Create the assessment
      const assessment = await createAssessment({
        objectiveId,
        title,
        description,
        type,
        instructions,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
        passingScore,
        classId: classId || undefined
      });

      // 2. Add each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await addQuestion(assessment.id, {
          type: q.type,
          questionText: q.questionText,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          difficulty: q.difficulty,
          orderIndex: i
        });
      }

      // 3. Publish if requested
      if (shouldPublish) {
        await publishAssessment(assessment.id);
        toast.success('Assessment created and published!');
      } else {
        toast.success('Assessment saved as draft');
      }

      router.push(`/teacher/assessments/${assessment.id}`);
    } catch (error: any) {
      console.error('Failed to save assessment:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/teacher/assessments"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Create Assessment</h1>
          <p className="text-text-secondary">Build a new assessment with questions</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
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
              placeholder="e.g., Fractions Quiz 1"
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
              placeholder="Brief description of the assessment"
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
              Class (optional)
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1.5">
              Learning Objective <span className="text-red-500">*</span>
            </label>
            {loadingObjectives ? (
              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading objectives...
              </div>
            ) : objectives.length === 0 ? (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  No learning objectives available for your classes.
                  Contact your school administrator to add curriculum.
                </p>
              </div>
            ) : (
              <select
                value={objectiveId}
                onChange={(e) => setObjectiveId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">Select an objective...</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.subject?.name ? `[${obj.subject.name}] ` : ''}
                    {obj.topic?.name ? `${obj.topic.name} — ` : ''}
                    {obj.title}
                  </option>
                ))}
              </select>
            )}
            {objectives.length > 0 && (
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <Target className="h-3 w-3" />
                {objectives.length} objective{objectives.length !== 1 ? 's' : ''} available
              </p>
            )}
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
              placeholder="Instructions for students..."
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
            <Button
              onClick={addNewQuestion}
              variant="outline"
              className="gap-2"
            >
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
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as any, correctAnswer: '' })}
                        className="text-xs px-2 py-1 rounded border border-gray-200 bg-white"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="fill_blank">Fill in the Blank</option>
                        <option value="open_ended">Open Ended</option>
                      </select>
                      <select
                        value={q.difficulty}
                        onChange={(e) => updateQuestion(q.id, { difficulty: e.target.value as any })}
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
                          onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                          min="1"
                          className="w-16 text-xs px-2 py-1 rounded border border-gray-200"
                        />
                        <span className="text-xs text-text-secondary">points</span>
                      </div>
                    </div>

                    <textarea
                      value={q.questionText}
                      onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
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
                          onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
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
                          onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
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
                      onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
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
                        ℹ️ Open-ended questions are manually graded by you after submission.
                      </p>
                    </div>
                  </div>
                )}

                {/* Explanation (all types) */}
                <div className="ml-11 mt-2">
                  <label className="text-xs text-text-secondary block mb-1">
                    Explanation (optional)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
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
        <Link href="/teacher/assessments">
          <Button variant="outline">Cancel</Button>
        </Link>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
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