/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Layers,
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Target,
  CheckCircle,
  Clock, 
  Loader2,
  Sparkles,
  Calendar, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getCurriculumById, 
  getSubjectsByLevel,
  getTopicsBySubject,
  getObjectivesByTopic,
  getLessonsByObjective,
} from '@/lib/services/naccaService';

// ============================================
// TYPES
// ============================================

interface LevelNode {
  id: string;
  name: string;
  code: string | null;
  levelType: string;
  orderIndex: number;
  expanded: boolean;
  loading: boolean;
  subjects: SubjectNode[];
}

interface SubjectNode {
  id: string;
  name: string;
  code: string | null;
  isCore: boolean;
  expanded: boolean;
  loading: boolean;
  topics: TopicNode[];
}

interface TopicNode {
  id: string;
  name: string;
  code: string | null;
  expanded: boolean;
  loading: boolean;
  objectives: ObjectiveNode[];
}

interface ObjectiveNode {
  id: string;
  title: string;
  code: string | null;
  bloomTaxonomy: string;
  difficultyLevel: string;
  expanded: boolean;
  loading: boolean;
  lessons: LessonNode[];
}

interface LessonNode {
  id: string;
  title: string;
  status: string;
  durationMinutes: number;
}

// ============================================
// LEVEL LABELS
// ============================================

const LEVEL_LABELS: Record<string, string> = {
  basic_1: 'Basic 1',
  basic_2: 'Basic 2',
  basic_3: 'Basic 3',
  basic_4: 'Basic 4',
  basic_5: 'Basic 5',
  basic_6: 'Basic 6',
  jhs_1: 'JHS 1',
  jhs_2: 'JHS 2',
  jhs_3: 'JHS 3',
  shs_1: 'SHS 1',
  shs_2: 'SHS 2',
  shs_3: 'SHS 3'
};

// ============================================
// COMPONENT
// ============================================

export default function CurriculumTreePage() {
  const params = useParams();
  const curriculumId = params.curriculumId as string;

  const [curriculum, setCurriculum] = useState<any>(null);
  const [levels, setLevels] = useState<LevelNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurriculum();
  }, [curriculumId]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const data = await getCurriculumById(curriculumId);
      setCurriculum(data);

      // Build initial level nodes
      const levelNodes: LevelNode[] = (data.levels || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        code: l.code,
        levelType: l.levelType,
        orderIndex: l.orderIndex || 0,
        expanded: false,
        loading: false,
        subjects: []
      }));

      setLevels(levelNodes.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch (error: any) {
      console.error('Failed to fetch curriculum:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EXPAND HANDLERS
  // ============================================

  const toggleLevel = async (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;

    // If already loaded, just toggle
    if (level.subjects.length > 0) {
      setLevels(levels.map(l =>
        l.id === levelId ? { ...l, expanded: !l.expanded } : l
      ));
      return;
    }

    // If not loaded, load subjects
    setLevels(levels.map(l =>
      l.id === levelId ? { ...l, loading: true, expanded: true } : l
    ));

    try {
      const subjectsData = await getSubjectsByLevel(levelId);
      const subjectNodes: SubjectNode[] = (subjectsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        isCore: s.isCore,
        expanded: false,
        loading: false,
        topics: []
      }));

      setLevels(levels.map(l =>
        l.id === levelId
          ? { ...l, loading: false, subjects: subjectNodes }
          : l
      ));
    } catch  {
      toast.error('Failed to load subjects');
      setLevels(levels.map(l =>
        l.id === levelId ? { ...l, loading: false } : l
      ));
    }
  };

  const toggleSubject = async (levelId: string, subjectId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;

    const subject = level.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    if (subject.topics.length > 0) {
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId ? { ...s, expanded: !s.expanded } : s
              )
            }
          : l
      ));
      return;
    }

    setLevels(levels.map(l =>
      l.id === levelId
        ? {
            ...l,
            subjects: l.subjects.map(s =>
              s.id === subjectId ? { ...s, loading: true, expanded: true } : s
            )
          }
        : l
    ));

    try {
      const topicsData = await getTopicsBySubject(subjectId);
      const topicNodes: TopicNode[] = (topicsData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        expanded: false,
        loading: false,
        objectives: []
      }));

      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? { ...s, loading: false, topics: topicNodes }
                  : s
              )
            }
          : l
      ));
    } catch  {
      toast.error('Failed to load topics');
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId ? { ...s, loading: false } : s
              )
            }
          : l
      ));
    }
  };

  const toggleTopic = async (levelId: string, subjectId: string, topicId: string) => {
    const level = levels.find(l => l.id === levelId);
    const subject = level?.subjects.find(s => s.id === subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    if (!topic) return;

    if (topic.objectives.length > 0) {
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId ? { ...t, expanded: !t.expanded } : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
      return;
    }

    setLevels(levels.map(l =>
      l.id === levelId
        ? {
            ...l,
            subjects: l.subjects.map(s =>
              s.id === subjectId
                ? {
                    ...s,
                    topics: s.topics.map(t =>
                      t.id === topicId ? { ...t, loading: true, expanded: true } : t
                    )
                  }
                : s
            )
          }
        : l
    ));

    try {
      const objectivesData = await getObjectivesByTopic(topicId);
      const objectiveNodes: ObjectiveNode[] = (objectivesData || []).map((o: any) => ({
        id: o.id,
        title: o.title,
        code: o.code,
        bloomTaxonomy: o.bloomTaxonomy,
        difficultyLevel: o.difficultyLevel,
        expanded: false,
        loading: false,
        lessons: []
      }));

      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId
                          ? { ...t, loading: false, objectives: objectiveNodes }
                          : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
    } catch  {
      toast.error('Failed to load objectives');
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId ? { ...t, loading: false } : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
    }
  };

  const toggleObjective = async (
    levelId: string,
    subjectId: string,
    topicId: string,
    objectiveId: string
  ) => {
    const level = levels.find(l => l.id === levelId);
    const subject = level?.subjects.find(s => s.id === subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    const objective = topic?.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    if (objective.lessons.length > 0) {
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId
                          ? {
                              ...t,
                              objectives: t.objectives.map(o =>
                                o.id === objectiveId ? { ...o, expanded: !o.expanded } : o
                              )
                            }
                          : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
      return;
    }

    setLevels(levels.map(l =>
      l.id === levelId
        ? {
            ...l,
            subjects: l.subjects.map(s =>
              s.id === subjectId
                ? {
                    ...s,
                    topics: s.topics.map(t =>
                      t.id === topicId
                        ? {
                            ...t,
                            objectives: t.objectives.map(o =>
                              o.id === objectiveId ? { ...o, loading: true, expanded: true } : o
                            )
                          }
                        : t
                    )
                  }
                : s
            )
          }
        : l
    ));

    try {
      const lessonsData = await getLessonsByObjective(objectiveId);
      const lessonNodes: LessonNode[] = (lessonsData || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        durationMinutes: l.durationMinutes
      }));

      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId
                          ? {
                              ...t,
                              objectives: t.objectives.map(o =>
                                o.id === objectiveId
                                  ? { ...o, loading: false, lessons: lessonNodes }
                                  : o
                              )
                            }
                          : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
    } catch {
      toast.error('Failed to load lessons');
      setLevels(levels.map(l =>
        l.id === levelId
          ? {
              ...l,
              subjects: l.subjects.map(s =>
                s.id === subjectId
                  ? {
                      ...s,
                      topics: s.topics.map(t =>
                        t.id === topicId
                          ? {
                              ...t,
                              objectives: t.objectives.map(o =>
                                o.id === objectiveId ? { ...o, loading: false } : o
                              )
                            }
                          : t
                      )
                    }
                  : s
              )
            }
          : l
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Draft
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

  if (!curriculum) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Curriculum not found</p>
        <Link href="/nacca/curricula">
          <Button variant="outline" className="mt-4">Back to Curricula</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/nacca/curricula"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Curricula
      </Link>

      {/* Curriculum Header */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{curriculum.name}</h1>
                {getStatusBadge(curriculum.status)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                {curriculum.code && (
                  <span className="font-mono">{curriculum.code}</span>
                )}
                {curriculum.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {curriculum.year}
                  </span>
                )}
                <span>v{curriculum.version}</span>
                <span className="capitalize">{curriculum.source}</span>
              </div>
            </div>
          </div>
        </div>
        {curriculum.description && (
          <p className="text-white/80 mt-4">{curriculum.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{levels.length}</p>
          <p className="text-xs text-text-secondary">Levels</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {levels.reduce((sum, l) => sum + l.subjects.length, 0)}
          </p>
          <p className="text-xs text-text-secondary">Subjects loaded</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-akoma-green" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">—</p>
          <p className="text-xs text-text-secondary">Objectives</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">—</p>
          <p className="text-xs text-text-secondary">Lessons</p>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-akoma-green" />
            Curriculum Structure
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Click to expand each level and drill down
          </p>
        </div>

        <div className="p-4 space-y-2">
          {levels.map((level) => (
            <div key={level.id} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Level row */}
              <button
                onClick={() => toggleLevel(level.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
              >
                {level.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-akoma-green shrink-0" />
                ) : level.expanded ? (
                  <ChevronDown className="h-4 w-4 text-akoma-green shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
                )}
                <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-medium text-text">
                  {LEVEL_LABELS[level.levelType] || level.name}
                </span>
                {level.code && (
                  <span className="text-xs text-text-secondary font-mono">
                    {level.code}
                  </span>
                )}
                {level.subjects.length > 0 && (
                  <span className="text-xs text-text-secondary ml-auto">
                    {level.subjects.length} subjects
                  </span>
                )}
              </button>

              {/* Subjects */}
              {level.expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 pl-8 pr-3 py-2 space-y-1">
                  {level.subjects.length === 0 && !level.loading && (
                    <p className="text-xs text-text-secondary py-2">No subjects</p>
                  )}
                  {level.subjects.map((subject) => (
                    <div key={subject.id} className="border border-gray-100 rounded bg-white overflow-hidden">
                      {/* Subject row */}
                      <button
                        onClick={() => toggleSubject(level.id, subject.id)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        {subject.loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-akoma-green shrink-0" />
                        ) : subject.expanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-akoma-green shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                        )}
                        <BookOpen className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span className="text-sm text-text">{subject.name}</span>
                        {subject.code && (
                          <span className="text-xs text-text-secondary font-mono">
                            {subject.code}
                          </span>
                        )}
                        {subject.isCore && (
                          <span className="text-xs bg-akoma-green/10 text-akoma-green px-1.5 py-0.5 rounded">
                            Core
                          </span>
                        )}
                        {subject.topics.length > 0 && (
                          <span className="text-xs text-text-secondary ml-auto">
                            {subject.topics.length} topics
                          </span>
                        )}
                      </button>

                      {/* Topics */}
                      {subject.expanded && (
                        <div className="border-t border-gray-100 bg-gray-50/30 pl-6 pr-2 py-1.5 space-y-1">
                          {subject.topics.length === 0 && !subject.loading && (
                            <p className="text-xs text-text-secondary py-1.5">No topics</p>
                          )}
                          {subject.topics.map((topic) => (
                            <div key={topic.id} className="border border-gray-100 rounded bg-white overflow-hidden">
                              {/* Topic row */}
                              <button
                                onClick={() =>
                                  toggleTopic(level.id, subject.id, topic.id)
                                }
                                className="w-full flex items-center gap-2.5 p-2 hover:bg-gray-50 transition-colors text-left"
                              >
                                {topic.loading ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-akoma-green shrink-0" />
                                ) : topic.expanded ? (
                                  <ChevronDown className="h-3 w-3 text-akoma-green shrink-0" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-text-secondary shrink-0" />
                                )}
                                <BookOpen className="h-3 w-3 text-akoma-green shrink-0" />
                                <span className="text-xs text-text">{topic.name}</span>
                                {topic.objectives.length > 0 && (
                                  <span className="text-xs text-text-secondary ml-auto">
                                    {topic.objectives.length} objectives
                                  </span>
                                )}
                              </button>

                              {/* Objectives */}
                              {topic.expanded && (
                                <div className="border-t border-gray-100 bg-gray-50/30 pl-5 pr-2 py-1 space-y-1">
                                  {topic.objectives.length === 0 && !topic.loading && (
                                    <p className="text-xs text-text-secondary py-1">No objectives</p>
                                  )}
                                  {topic.objectives.map((objective) => (
                                    <div
                                      key={objective.id}
                                      className="border border-gray-100 rounded bg-white overflow-hidden"
                                    >
                                      {/* Objective row */}
                                      <button
                                        onClick={() =>
                                          toggleObjective(
                                            level.id,
                                            subject.id,
                                            topic.id,
                                            objective.id
                                          )
                                        }
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left"
                                      >
                                        {objective.loading ? (
                                          <Loader2 className="h-3 w-3 animate-spin text-akoma-green shrink-0" />
                                        ) : objective.expanded ? (
                                          <ChevronDown className="h-3 w-3 text-akoma-green shrink-0" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-text-secondary shrink-0" />
                                        )}
                                        <Target className="h-3 w-3 text-orange-600 shrink-0" />
                                        <span className="text-xs text-text flex-1 truncate">
                                          {objective.title}
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded capitalize shrink-0">
                                          {objective.bloomTaxonomy}
                                        </span>
                                        {objective.lessons.length > 0 && (
                                          <span className="text-xs text-text-secondary shrink-0">
                                            {objective.lessons.length} lessons
                                          </span>
                                        )}
                                      </button>

                                      {/* Lessons */}
                                      {objective.expanded && (
                                        <div className="border-t border-gray-100 bg-gray-50/30 pl-4 pr-2 py-1 space-y-0.5">
                                          {objective.lessons.length === 0 && !objective.loading && (
                                            <p className="text-xs text-text-secondary py-1">
                                              No lessons
                                            </p>
                                          )}
                                          {objective.lessons.map((lesson) => (
                                            <div
                                              key={lesson.id}
                                              className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition-colors"
                                            >
                                              <FileText className="h-3 w-3 text-akoma-green shrink-0" />
                                              <span className="text-xs text-text flex-1 truncate">
                                                {lesson.title}
                                              </span>
                                              <span className="text-xs text-text-secondary shrink-0">
                                                {lesson.durationMinutes}m
                                              </span>
                                              {getStatusBadge(lesson.status)}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {levels.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">No levels found in this curriculum</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}