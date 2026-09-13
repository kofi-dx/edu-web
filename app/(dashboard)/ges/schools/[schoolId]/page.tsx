/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Building2,
  Mail,
  Phone,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp, 
  Calendar,
  ClipboardList,
  BarChart3,
  Target, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// ============================================
// COMPONENT
// ============================================

export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    fetchSchool();
  }, [schoolId]);

  const fetchSchool = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/schools/${schoolId}`);
      setSchool(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch school:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load school');
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

  if (!school) {
    return (
      <div className="text-center py-12">
        <Landmark className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">School not found</p>
        <Link href="/ges/schools">
          <Button variant="outline" className="mt-4">Back to Schools</Button>
        </Link>
      </div>
    );
  }

  // Compute ratio
  const ratio = school.teacherCount > 0
    ? Math.round(school.studentCount / school.teacherCount)
    : 0;
  const isRatioBad = ratio > 30;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/ges/schools"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Schools
      </Link>

      {/* ============================================
          SCHOOL HEADER
          ============================================ */}
      <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Landmark className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{school.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  school.type === 'public'
                    ? 'bg-white/30 text-white'
                    : 'bg-white/30 text-white'
                }`}>
                  {school.type}
                </span>
              </div>
              <p className="text-white/80 text-sm font-mono">{school.code}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/80">
                {school.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {school.region}
                    {school.district && ` • ${school.district}`}
                  </span>
                )}
                {school.contactEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {school.contactEmail}
                  </span>
                )}
                {school.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {school.contactPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {school.status && (
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              school.status === 'active'
                ? 'bg-green-400 text-green-900'
                : 'bg-red-400 text-red-900'
            }`}>
              {school.status}
            </span>
          )}
        </div>
      </div>

      {/* ============================================
          KEY METRICS
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {school.studentCount || 0}
          </p>
          <p className="text-xs text-text-secondary">Students</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {school.teacherCount || 0}
          </p>
          <p className="text-xs text-text-secondary">Teachers</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">
            {school.classCount || 0}
          </p>
          <p className="text-xs text-text-secondary">Classes</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${isRatioBad ? 'text-red-600' : 'text-text'}`}>
            1:{ratio}
          </p>
          <p className="text-xs text-text-secondary">Student:Teacher</p>
          {isRatioBad && (
            <p className="text-xs text-red-600 mt-1">⚠ Above recommended</p>
          )}
        </div>
      </div>

      {/* ============================================
          PLACEHOLDER — Analytics coming soon
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-akoma-green" />
              Attendance Performance
            </h2>
          </div>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">
              Detailed attendance analytics coming soon
            </p>
            <p className="text-xs text-text-secondary mt-1">
              National trends available in the analytics section
            </p>
            <Link href="/ges/analytics/attendance">
              <Button variant="outline" size="sm" className="mt-3 gap-1">
                View National Attendance
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-akoma-green" />
              Assessment Performance
            </h2>
          </div>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">
              Assessment analytics coming soon
            </p>
            <p className="text-xs text-text-secondary mt-1">
              National results available in the analytics section
            </p>
            <Link href="/ges/analytics/assessments">
              <Button variant="outline" size="sm" className="mt-3 gap-1">
                View National Assessments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================
          SCHOOL INFO
          ============================================ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-akoma-green" />
          School Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4 text-text-secondary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Location</p>
              <p className="text-sm text-text">
                {school.district && `${school.district}, `}{school.region || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Contact Email</p>
              <p className="text-sm text-text">{school.contactEmail || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Contact Phone</p>
              <p className="text-sm text-text">{school.contactPhone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Landmark className="h-4 w-4 text-text-secondary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">School Code</p>
              <p className="text-sm text-text font-mono">{school.code}</p>
            </div>
          </div>
          {school.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
              <Building2 className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-text-secondary">Address</p>
                <p className="text-sm text-text">{school.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}