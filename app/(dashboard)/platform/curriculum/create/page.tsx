/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCurriculum } from '@/lib/services/adminService';

interface FormData {
  name: string;
  description: string;
  source: string;
  sourceName: string;
  visibility: string;
  version: string;
  year: string;
}

export default function CreateCurriculumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    source: 'government',
    sourceName: '',
    visibility: 'public',
    version: '1.0',
    year: new Date().getFullYear().toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Curriculum name is required');
      return;
    }

    setLoading(true);
    try {
      const data = await createCurriculum(formData);
      toast.success('Curriculum created successfully!');
      router.push(`/platform/curriculum/${data.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to create curriculum');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link href="/platform/curriculum" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Curricula
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Create New Curriculum</h1>
          <p className="text-text-secondary">Define a new curriculum for the platform</p>
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/platform/curriculum">
            <Button variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Creating...' : 'Create Curriculum'}
          </Button>
        </div>
      </form>
    </div>
  );
}