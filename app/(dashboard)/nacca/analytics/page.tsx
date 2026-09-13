/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  Layers,
  Target,
  FileText,
  ClipboardList,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle, 
  Sparkles, 
  Library, 
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getLevelBreakdown,
  getPublishStatus,
  type DashboardStats,
  type LevelBreakdown,
  type PublishStatus
} from '@/lib/services/naccaService';

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

export default function NaccaAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [levels, setLevels] = useState<LevelBreakdown[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, levelsData, publishData] = await Promise.all([
        getDashboardStats(),
        getLevelBreakdown(),
        getPublishStatus()
      ]);
      setStats(statsData);
      setLevels(levelsData);
      setPublishStatus(publishData);
    } catch (error: any) {
      console.error('Failed to fetch analytics data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load analytics');
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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Analytics data not available</p>
      </div>
    );
  }

  const { totals, curricula } = stats;

  // Sort levels by content (descending)
  const sortedLevels = [...levels].sort((a, b) => b.subjects - a.subjects);

  // Compute insights
  const levelsWithContent = levels.filter(l => l.subjects > 0).length;
  const levelsEmpty = levels.length - levelsWithContent;
  const mostContentLevel = sortedLevels[0];
  const emptiestLevel = [...sortedLevels].reverse()[0];

  // Average content per level
  const avgSubjectsPerLevel = levelsWithContent > 0
    ? Math.round(levels.reduce((sum, l) => sum + l.subjects, 0) / levelsWithContent)
    : 0;
  const avgTopicsPerSubject = totals.subjects > 0
    ? Math.round(totals.topics / totals.subjects)
    : 0;
  const avgObjectivesPerTopic = totals.topics > 0
    ? Math.round(totals.objectives / totals.topics)
    : 0;
  const avgLessonsPerObjective = totals.objectives > 0
    ? Math.round(totals.lessons / totals.objectives)
    : 0;

  // Publish coverage percentage
  const publishCoverage = totals.lessons > 0
    ? Math.round((totals.publishedLessons / totals.lessons) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">Analytics</h1>
          </div>
          <p className="text-text-secondary">
            Complete content coverage and publishing snapshot
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/nacca/analytics/coverage">
            <Button variant="outline" className="gap-2">
              <Target className="h-4 w-4" />
              View Coverage Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================
          HERO BANNER — total content
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Curriculum Content at a Glance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-white/80 mb-1">Curricula</p>
            <p className="text-2xl font-bold">{totals.curricula}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-white/80 mb-1">Subjects</p>
            <p className="text-2xl font-bold">{totals.subjects}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-white/80 mb-1">Topics</p>
            <p className="text-2xl font-bold">{totals.topics}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-white/80 mb-1">Objectives</p>
            <p className="text-2xl font-bold">{totals.objectives}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-xs text-white/80 mb-1">Lessons</p>
            <p className="text-2xl font-bold">{totals.lessons}</p>
          </div>
        </div>
      </div>

      {/* ============================================
          PRIMARY STATS — 4 cards
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.subjects}</p>
          <p className="text-sm text-text-secondary mt-1">Subjects</p>
          <p className="text-xs text-text-secondary mt-2">
            ~{avgTopicsPerSubject} topics per subject
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.objectives}</p>
          <p className="text-sm text-text-secondary mt-1">Objectives</p>
          <p className="text-xs text-text-secondary mt-2">
            ~{avgObjectivesPerTopic} per topic
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-akoma-green" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.lessons}</p>
          <p className="text-sm text-text-secondary mt-1">Lessons</p>
          <p className="text-xs text-text-secondary mt-2">
            ~{avgLessonsPerObjective} per objective
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.assessments}</p>
          <p className="text-sm text-text-secondary mt-1">Assessments</p>
          <p className="text-xs text-text-secondary mt-2">
            {totals.questions} questions total
          </p>
        </div>
      </div>

      {/* ============================================
          PUBLISHING + CONTENT DEPTH
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publishing coverage */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-akoma-green" />
            Publishing Progress
          </h2>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Lessons Published</span>
              <span className="text-3xl font-bold text-green-600">
                {publishCoverage}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${publishCoverage}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {totals.publishedLessons} of {totals.lessons} lessons published
            </p>
          </div>

          {publishStatus && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-text-secondary mb-2">Curricula</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Published
                    </span>
                    <span className="font-bold text-green-600">
                      {publishStatus.curricula.published}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Draft
                    </span>
                    <span className="font-bold text-yellow-600">
                      {publishStatus.curricula.draft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Archived
                    </span>
                    <span className="font-bold text-gray-600">
                      {publishStatus.curricula.archived}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-secondary mb-2">Lessons</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Published
                    </span>
                    <span className="font-bold text-green-600">
                      {publishStatus.lessons.published}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Draft
                    </span>
                    <span className="font-bold text-yellow-600">
                      {publishStatus.lessons.draft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Archived
                    </span>
                    <span className="font-bold text-gray-600">
                      {publishStatus.lessons.archived}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content depth */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-akoma-green" />
            Content Depth
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">Avg Subjects per Level</span>
                <span className="text-sm font-bold text-text">{avgSubjectsPerLevel}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(avgSubjectsPerLevel * 10, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">Avg Topics per Subject</span>
                <span className="text-sm font-bold text-text">{avgTopicsPerSubject}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(avgTopicsPerSubject * 5, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">Avg Objectives per Topic</span>
                <span className="text-sm font-bold text-text">{avgObjectivesPerTopic}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(avgObjectivesPerTopic * 20, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary">Avg Lessons per Objective</span>
                <span className="text-sm font-bold text-text">{avgLessonsPerObjective}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-akoma-green rounded-full"
                  style={{ width: `${Math.min(avgLessonsPerObjective * 50, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Total Resources</span>
              <span className="font-bold text-text">{totals.resources}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          LEVEL COVERAGE TABLE
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Layers className="h-5 w-5 text-akoma-green" />
              Level-by-Level Coverage
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Content depth for each of the 12 grade levels
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Level</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Subjects</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Topics</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Objectives</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Lessons</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Publish Progress</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => {
                const hasContent = level.subjects > 0;
                const publishPct = level.lessons > 0
                  ? Math.round((level.publishedLessons / level.lessons) * 100)
                  : 0;

                return (
                  <tr
                    key={level.levelType}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          hasContent ? 'bg-akoma-green' : 'bg-gray-300'
                        }`} />
                        <p className="text-sm font-medium text-text">
                          {LEVEL_LABELS[level.levelType] || level.levelType}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${hasContent ? 'text-text' : 'text-text-secondary'}`}>
                        {level.subjects}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${hasContent ? 'text-text' : 'text-text-secondary'}`}>
                        {level.topics}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${hasContent ? 'text-text' : 'text-text-secondary'}`}>
                        {level.objectives}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${hasContent ? 'text-text' : 'text-text-secondary'}`}>
                        {level.lessons}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {level.lessons > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                publishPct >= 80 ? 'bg-green-500' :
                                publishPct >= 50 ? 'bg-blue-500' :
                                publishPct >= 20 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${publishPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-text-secondary">
                            {level.publishedLessons}/{level.lessons}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================
          INSIGHTS
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-akoma-green" />
          Content Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700">Most Content</p>
            </div>
            <p className="font-bold text-green-800 truncate">
              {mostContentLevel ? LEVEL_LABELS[mostContentLevel.levelType] : '—'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {mostContentLevel?.subjects || 0} subjects • {mostContentLevel?.lessons || 0} lessons
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              <p className="text-xs font-semibold text-yellow-700">Needs Content</p>
            </div>
            <p className="font-bold text-yellow-800 truncate">
              {emptiestLevel ? LEVEL_LABELS[emptiestLevel.levelType] : '—'}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              {emptiestLevel?.subjects || 0} subjects • {emptiestLevel?.lessons || 0} lessons
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Library className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700">Coverage Summary</p>
            </div>
            <p className="font-bold text-blue-800">
              {levelsWithContent} of {levels.length} levels covered
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {levelsEmpty} level{levelsEmpty !== 1 ? 's' : ''} without content
            </p>
          </div>
        </div>
      </div>

      {/* ============================================
          CURRICULA LIST
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-akoma-green" />
              Curriculum Breakdown
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Content across all {curricula.length} curricula
            </p>
          </div>
          <Link href="/nacca/curricula">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {curricula.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-10 w-10 text-text-secondary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No curricula yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Curriculum</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Levels</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Subjects</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Lessons</th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Published</th>
                </tr>
              </thead>
              <tbody>
                {curricula.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/nacca/curricula/${c.id}`}
                        className="text-sm font-medium text-text hover:text-akoma-green transition-colors line-clamp-1"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        c.status === 'published' ? 'bg-green-100 text-green-700' :
                        c.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{c.levelCount}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{c.subjectCount}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-text">{c.lessonCount}</span>
                    </td>
                    <td className="px-6 py-3">
                      {c.lessonCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(c.publishedLessonCount / c.lessonCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-secondary">
                            {c.publishedLessonCount}/{c.lessonCount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================
          NEXT STEPS
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/nacca/analytics/coverage"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-akoma-green" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-semibold text-text mb-1">Coverage Matrix</h3>
          <p className="text-sm text-text-secondary">
            See exactly which subjects exist at which levels in a grid view
          </p>
        </Link>

        <Link
          href="/nacca/curricula"
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-akoma-green/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-semibold text-text mb-1">Browse Curricula</h3>
          <p className="text-sm text-text-secondary">
            Drill down into each curriculum structure
          </p>
        </Link>
      </div>
    </div>
  );
}