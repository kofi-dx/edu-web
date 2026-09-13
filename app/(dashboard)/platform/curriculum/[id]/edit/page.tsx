/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurriculumById, updateCurriculum } from '@/lib/services/adminService';

interface FormData {
  name: string;
  description: string;
  source: string;
  sourceName: string;
  visibility: string;
  version: string;
  year: string;
}

export default function EditCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    source: 'government',
    sourceName: '',
    visibility: 'public',
    version: '1.0',
    year: new Date().getFullYear().toString(),
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  useEffect(() => {
    fetchCurriculum();
  }, [id]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const data = await getCurriculumById(id);
      if (data) {
        const formData = {
          name: data.name || '',
          description: data.description || '',
          source: data.source || 'government',
          sourceName: data.sourceName || '',
          visibility: data.visibility || 'public',
          version: data.version || '1.0',
          year: data.year || new Date().getFullYear().toString(),
        };
        setFormData(formData);
        setOriginalData(formData);
      }
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
      toast.error('Failed to load curriculum');
      router.push('/platform/curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Curriculum name is required');
      return;
    }

    // Check if anything changed
    if (JSON.stringify(formData) === JSON.stringify(originalData)) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      await updateCurriculum(id, formData);
      toast.success('Curriculum updated successfully!');
      router.push(`/platform/curriculum/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to update curriculum');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-akoma-green animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href={`/platform/curriculum/${id}`} className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Curriculum Details
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Edit Curriculum</h1>
          <p className="text-text-secondary">Update curriculum information</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Curriculum Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Ghana National Curriculum 2026"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the curriculum..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Source & Visibility */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4">Source & Visibility</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Source Type
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="government">Government</option>
                <option value="school">School</option>
                <option value="international">International</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Source Name
              </label>
              <input
                type="text"
                name="sourceName"
                value={formData.sourceName}
                onChange={handleChange}
                placeholder="e.g., NaCCA, Cambridge, School Name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="1.0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Note</p>
              <p className="text-sm text-blue-700">
                Changing the source or visibility may affect which schools can access this curriculum.
                Published curricula cannot be deleted, but can be archived.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={`/platform/curriculum/${id}`}>
            <Button variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || !hasChanges}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}