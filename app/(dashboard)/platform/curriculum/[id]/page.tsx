/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Layers,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurriculumById, publishCurriculum, archiveCurriculum } from '@/lib/services/adminService';
import { format } from 'date-fns';

interface Curriculum {
  id: string;
  name: string;
  description: string;
  source: 'government' | 'school' | 'international' | 'custom';
  sourceName: string;
  visibility: 'public' | 'private' | 'shared' | 'pending';
  version: string;
  year: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  isActive: boolean;
  createdAt: string;
  publishedAt?: string;
  levels?: any[];
}

export default function CurriculumDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, [id]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const data = await getCurriculumById(id);
      if (data) {
        setCurriculum(data);
      }
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
      toast.error('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!curriculum) return;
    setActionLoading(true);
    try {
      await publishCurriculum(curriculum.id);
      toast.success('Curriculum published successfully');
      await fetchCurriculum();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to publish curriculum');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!curriculum) return;
    setActionLoading(true);
    try {
      await archiveCurriculum(curriculum.id);
      toast.success('Curriculum archived successfully');
      await fetchCurriculum();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to archive curriculum');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      published: {
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Published'
      },
      draft: {
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="h-4 w-4" />,
        label: 'Draft'
      },
      archived: {
        color: 'bg-gray-100 text-gray-700',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Archived'
      },
      under_review: {
        color: 'bg-blue-100 text-blue-700',
        icon: <Clock className="h-4 w-4" />,
        label: 'Under Review'
      },
    };
    const config = configs[status] || configs.draft;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">Curriculum not found</h2>
          <Link href="/platform/curriculum">
            <Button className="mt-4">Back to Curricula</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link href="/platform/curriculum" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Curricula
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text">{curriculum.name}</h1>
            {getStatusBadge(curriculum.status)}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
            <span>Source: {curriculum.source.charAt(0).toUpperCase() + curriculum.source.slice(1)}</span>
            {curriculum.sourceName && <span>• {curriculum.sourceName}</span>}
            <span>• Version v{curriculum.version}</span>
            {curriculum.year && <span>• {curriculum.year}</span>}
            <span>• {curriculum.visibility.charAt(0).toUpperCase() + curriculum.visibility.slice(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/platform/curriculum/${curriculum.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {curriculum.status === 'draft' && (
            <Button
              onClick={handlePublish}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Publish
            </Button>
          )}
          {curriculum.status === 'published' && (
            <Button
              onClick={handleArchive}
              disabled={actionLoading}
              variant="outline"
              className="text-gray-600 gap-2"
            >
              {actionLoading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {curriculum.description && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-2">Description</h3>
          <p className="text-text-secondary">{curriculum.description}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Levels</p>
          </div>
          <p className="text-2xl font-bold text-text">{curriculum.levels?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Created</p>
          </div>
          <p className="text-sm font-medium text-text">
            {format(new Date(curriculum.createdAt), 'PPP')}
          </p>
        </div>
        {curriculum.publishedAt && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-text-secondary">Published</p>
            </div>
            <p className="text-sm font-medium text-text">
              {format(new Date(curriculum.publishedAt), 'PPP')}
            </p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-akoma-green" />
            <p className="text-sm text-text-secondary">Visibility</p>
          </div>
          <p className="text-sm font-medium text-text capitalize">{curriculum.visibility}</p>
        </div>
      </div>

      {/* Levels List */}
      {curriculum.levels && curriculum.levels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {curriculum.levels.map((level: any) => (
              <div key={level.id} className="bg-background rounded-lg p-3 border border-gray-100">
                <p className="font-medium text-text">{level.name}</p>
                <p className="text-xs text-text-secondary">{level.code}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {level.subjects?.length || 0} subjects
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/platform/curriculum/${curriculum.id}/levels/add`}>
            <Button variant="outline" className="gap-2">
              <Layers className="h-4 w-4" />
              Add Level
            </Button>
          </Link>
          <Link href={`/platform/curriculum/${curriculum.id}/export`}>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Export Curriculum
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
            Delete Curriculum
          </Button>
        </div>
      </div>
    </div>
  );
}