/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Search, 
  FileText,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getMyAssessments,
  publishAssessment,
  unpublishAssessment,
  deleteAssessment
} from '@/lib/services/schoolAdminService';

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  totalPoints: number;
  passingScore: number;
  timeLimitMinutes: number | null;
  subject: string;
  topic: string;
  objective: string;
  questionCount: number;
  attemptCount: number;
  gradedCount: number;
  averageScore: number;
  createdAt: string;
  publishedAt: string | null;
}

interface Stats {
  total: number;
  drafts: number;
  published: number;
  archived: number;
  totalAttempts: number;
}

export default function TeacherAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    drafts: 0,
    published: 0,
    archived: 0,
    totalAttempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, [filterStatus, filterType]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.type = filterType;

      const data = await getMyAssessments(params);
      setAssessments(data.assessments || []);
      setStats(data.stats || {
        total: 0,
        drafts: 0,
        published: 0,
        archived: 0,
        totalAttempts: 0
      });
    } catch (error: any) {
      console.error('Failed to fetch assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (assessment: Assessment) => {
    setActionLoading(assessment.id);
    try {
      await publishAssessment(assessment.id);
      toast.success('Assessment published!');
      await fetchAssessments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to publish');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (assessment: Assessment) => {
    setActionLoading(assessment.id);
    try {
      await unpublishAssessment(assessment.id);
      toast.success('Assessment unpublished');
      await fetchAssessments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to unpublish');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssessment) return;
    setActionLoading(selectedAssessment.id);
    try {
      await deleteAssessment(selectedAssessment.id);
      toast.success('Assessment deleted');
      setShowDeleteModal(false);
      setSelectedAssessment(null);
      await fetchAssessments();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAssessments = assessments.filter(a =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      quiz: 'bg-blue-100 text-blue-700',
      test: 'bg-purple-100 text-purple-700',
      exam: 'bg-red-100 text-red-700',
      homework: 'bg-orange-100 text-orange-700',
      formative: 'bg-teal-100 text-teal-700',
      summative: 'bg-pink-100 text-pink-700'
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Assessments</h1>
          <p className="text-text-secondary">
            Create and manage assessments for your students
          </p>
        </div>
        <Link href="/teacher/assessments/create">
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <Plus className="h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{stats.drafts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Archived</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.archived}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Attempts</p>
          <p className="text-2xl font-bold text-akoma-green">{stats.totalAttempts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="test">Test</option>
              <option value="exam">Exam</option>
              <option value="homework">Homework</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <ClipboardList className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {searchTerm ? 'No assessments match your search' : 'No assessments yet'}
          </p>
          {!searchTerm && (
            <Link href="/teacher/assessments/create">
              <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Assessment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(assessment.status)}
                    {getTypeBadge(assessment.type)}
                  </div>

                  <Link href={`/teacher/assessments/${assessment.id}`}>
                    <h3 className="font-semibold text-text hover:text-akoma-green transition-colors mb-1">
                      {assessment.title}
                    </h3>
                  </Link>

                  {assessment.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {assessment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {assessment.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {assessment.totalPoints} points
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {assessment.attemptCount} attempts
                    </span>
                    {assessment.timeLimitMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {assessment.timeLimitMinutes} min
                      </span>
                    )}
                    <span className="text-akoma-green">
                      {assessment.subject}
                    </span>
                  </div>
                </div>

                {/* Score + Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                  {assessment.gradedCount > 0 && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-akoma-green">
                        {assessment.averageScore}%
                      </p>
                      <p className="text-xs text-text-secondary">avg score</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Link href={`/teacher/assessments/${assessment.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/teacher/assessments/${assessment.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/teacher/assessments/${assessment.id}/submissions`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Submissions">
                        <Users className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/teacher/assessments/${assessment.id}/analytics`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Analytics">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    {assessment.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handlePublish(assessment)}
                        disabled={actionLoading === assessment.id}
                        title="Publish"
                      >
                        {actionLoading === assessment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {assessment.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        onClick={() => handleUnpublish(assessment)}
                        disabled={actionLoading === assessment.id}
                        title="Unpublish"
                      >
                        {actionLoading === assessment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedAssessment(assessment);
                        setShowDeleteModal(true);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Delete Assessment</h3>
                <p className="text-sm text-text-secondary">
                  {selectedAssessment.title}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary">
                Are you sure you want to delete this assessment? This action cannot be undone.
              </p>
              {selectedAssessment.attemptCount > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This assessment has {selectedAssessment.attemptCount} student attempt(s). 
                    Delete is not allowed — archive it instead.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAssessment(null);
                }}
                disabled={actionLoading === selectedAssessment.id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={
                  actionLoading === selectedAssessment.id ||
                  selectedAssessment.attemptCount > 0
                }
              >
                {actionLoading === selectedAssessment.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete Assessment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}