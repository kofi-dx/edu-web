/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Layers,
  Target,
  FileText,
  ClipboardList, 
  ArrowRight,
  CheckCircle, 
  Clock,
  BarChart3,
  Sparkles,
  Building2,
  Library
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getLevelBreakdown,
  getPublishStatus,
  getRecentActivity,
  type DashboardStats,
  type LevelBreakdown,
  type PublishStatus,
  type RecentActivityItem
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

export default function NaccaDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [levels, setLevels] = useState<LevelBreakdown[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, levelsData, publishData, recentData] = await Promise.all([
        getDashboardStats(),
        getLevelBreakdown(),
        getPublishStatus(),
        getRecentActivity(8)
      ]);
      setStats(statsData);
      setLevels(levelsData);
      setPublishStatus(publishData);
      setRecentActivity(recentData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'curriculum': return GraduationCap;
      case 'subject': return Library;
      case 'topic': return BookOpen;
      case 'lesson': return FileText;
      default: return Sparkles;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
        <GraduationCap className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">Dashboard data not available</p>
      </div>
    );
  }

  const { totals, curricula } = stats;

  return (
    <div className="space-y-6">
      {/* ============================================
          HEADER
          ============================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">NaCCA Dashboard</h1>
          </div>
          <p className="text-text-secondary">
            National Council for Curriculum and Assessment — Curriculum overview
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/nacca/curricula">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              View Curricula
            </Button>
          </Link>
          <Link href="/nacca/analytics">
            <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================
          HERO BANNER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Curriculum at a Glance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Curricula</p>
            </div>
            <p className="text-2xl font-bold">{totals.curricula}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Levels</p>
            </div>
            <p className="text-2xl font-bold">{totals.levels}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Subjects</p>
            </div>
            <p className="text-2xl font-bold">{totals.subjects}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-white/80" />
              <p className="text-xs text-white/80">Lessons</p>
            </div>
            <p className="text-2xl font-bold">{totals.lessons}</p>
          </div>
        </div>
      </div>

      {/* ============================================
          STAT CARDS — 4
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.subjects}</p>
          <p className="text-sm text-text-secondary mt-1">Subjects</p>
          <p className="text-xs text-text-secondary mt-2">
            {totals.topics} topics across all
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-text">{totals.objectives}</p>
          <p className="text-sm text-text-secondary mt-1">Learning Objectives</p>
          <p className="text-xs text-text-secondary mt-2">
            {totals.topics} topics
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
          <p className="text-xs text-green-600 mt-2">
            {totals.publishedLessons} published
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
            {totals.questions} questions
          </p>
        </div>
      </div>

      {/* ============================================
          PUBLISH STATUS + RECENT ACTIVITY
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Publish Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-akoma-green" />
            Publish Status
          </h2>

          {publishStatus && (
            <>
              {/* Curricula status */}
              <div className="mb-5">
                <p className="text-xs text-text-secondary mb-2">Curricula</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Published
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {publishStatus.curricula.published}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Draft
                    </span>
                    <span className="text-sm font-bold text-yellow-600">
                      {publishStatus.curricula.draft}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Archived
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {publishStatus.curricula.archived}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons status */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-text-secondary mb-2">Lessons</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Published
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {publishStatus.lessons.published}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Draft
                    </span>
                    <span className="text-sm font-bold text-yellow-600">
                      {publishStatus.lessons.draft}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-akoma-green" />
              <h2 className="font-semibold text-text">Recent Activity</h2>
            </div>
            <Link
              href="/nacca/curricula"
              className="text-xs text-akoma-green hover:underline"
            >
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 text-text-secondary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item, idx) => {
                const Icon = getActivityIcon(item.type);
                return (
                  <div
                    key={`${item.type}-${item.id}-${idx}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-akoma-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-text truncate">
                          {item.name}
                        </p>
                        <span className="text-xs text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {formatRelativeTime(item.updatedAt)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          LEVEL BREAKDOWN
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Layers className="h-5 w-5 text-akoma-green" />
              Content by Level
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Curriculum coverage across all 12 grade levels
            </p>
          </div>
          <Link href="/nacca/analytics">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View Analytics
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
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
                <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">Published</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => {
                const hasContent = level.subjects > 0;
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
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(level.publishedLessons / level.lessons) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-green-600">
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
          CURRICULA OVERVIEW
          ============================================ */}
      {curricula.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-akoma-green" />
                All Curricula
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''} in the system
              </p>
            </div>
            <Link href="/nacca/curricula">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {curricula.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/nacca/curricula/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-akoma-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-text truncate">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    {c.code && <span className="font-mono">{c.code}</span>}
                    <span className="capitalize">{c.source}</span>
                    {c.year && <span>{c.year}</span>}
                    <span>v{c.version}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-text">{c.levelCount}</p>
                    <p className="text-xs text-text-secondary">Levels</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text">{c.subjectCount}</p>
                    <p className="text-xs text-text-secondary">Subjects</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text">{c.lessonCount}</p>
                    <p className="text-xs text-text-secondary">Lessons</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          QUICK LINKS
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-akoma-green" />
          Explore
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/nacca/curricula"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Curricula</p>
              <p className="text-xs text-text-secondary truncate">
                {curricula.length} curricula
              </p>
            </div>
          </Link>

          <Link
            href="/nacca/analytics"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Analytics</p>
              <p className="text-xs text-text-secondary truncate">
                Full snapshot
              </p>
            </div>
          </Link>

          <Link
            href="/nacca/analytics/coverage"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Coverage</p>
              <p className="text-xs text-text-secondary truncate">
                Subject × Level matrix
              </p>
            </div>
          </Link>

          <Link
            href="/nacca/settings"
            className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-akoma-green/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Settings</p>
              <p className="text-xs text-text-secondary truncate">
                Account & preferences
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}