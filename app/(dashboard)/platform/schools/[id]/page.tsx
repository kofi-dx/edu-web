/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-img-element */
// app/(dashboard)/platform/schools/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getSchoolById, getSchoolStats } from '@/lib/services/adminService';
import { toast } from 'sonner';

// Import tab components
import { StudentTab } from '@/components/platform/schools/StudentTab';
import { TeacherTab } from '@/components/platform/schools/TeacherTab';
import { ClassesTab } from '@/components/platform/schools/ClassesTab';
import { AttendanceTab } from '@/components/platform/schools/AttendanceTab';

interface School {
  id: string;
  name: string;
  code: string;
  type: 'public' | 'private' | 'international';
  level: 'primary' | 'jhs' | 'shs' | 'combined';
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  region: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  gesCode?: string;
  districtCode?: string;
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  verifiedAt?: string;
}

interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  attendanceRate?: number;
  studentGrowth?: number;
  status: string;
  type: string;
  registrationCompleted: boolean;
}

type TabType = 'overview' | 'students' | 'teachers' | 'classes' | 'attendance';

export default function SchoolDetailsPage() {
  const params = useParams();
  const schoolId = params.id as string;
  const [school, setSchool] = useState<School | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    fetchSchoolData();
  }, [schoolId]);

  const fetchSchoolData = async () => {
  setLoading(true);
  try {
    const schoolData = await getSchoolById(schoolId);
    if (schoolData) {
      setSchool(schoolData);
    }

    // Try to get stats, but don't fail if it doesn't work
    try {
      const statsData = await getSchoolStats(schoolId);
      if (statsData) {
        setStats(statsData.stats);
      }
    } catch {
      // Set default stats so page still works
      setStats({
        students: 0,
        teachers: 0,
        classes: 0,
        attendanceRate: 0,
        studentGrowth: 0,
        status: schoolData?.status || 'unknown',
        type: schoolData?.type || 'unknown',
        registrationCompleted: false,
      });
      console.warn('Stats not available, using defaults');
    }
  } catch (error) {
    console.error('Failed to fetch school data:', error);
    toast.error('Failed to load school details');
  } finally {
    setLoading(false);
  }
};

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      active: { 
        color: 'bg-green-100 text-green-700', 
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Active'
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-700', 
        icon: <Clock className="h-4 w-4" />,
        label: 'Pending'
      },
      suspended: { 
        color: 'bg-red-100 text-red-700', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Suspended'
      },
      rejected: { 
        color: 'bg-gray-100 text-gray-700', 
        icon: <XCircle className="h-4 w-4" />,
        label: 'Rejected'
      },
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'students':
        return <StudentTab schoolId={schoolId} />;
      case 'teachers':
        return <TeacherTab schoolId={schoolId} />;
      case 'classes':
        return <ClassesTab schoolId={schoolId} />;
      case 'attendance':
        return <AttendanceTab schoolId={schoolId} />;
      default:
        return null;
    }
  };

  const renderOverview = () => {
    if (!school) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-akoma-green" />
                <p className="text-sm text-text-secondary">Total Students</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats?.students || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="h-4 w-4 text-akoma-green" />
                <p className="text-sm text-text-secondary">Total Teachers</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats?.teachers || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-akoma-green" />
                <p className="text-sm text-text-secondary">Total Classes</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats?.classes || 0}</p>
            </div>
          </div>

          {/* School Information */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4">School Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Location</p>
                  <p className="text-sm text-text">{school.address || 'Not provided'}</p>
                  <p className="text-sm text-text-secondary">{school.district}, {school.region}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Contact Email</p>
                  <a href={`mailto:${school.contactEmail}`} className="text-sm text-akoma-green hover:underline">
                    {school.contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm text-text-secondary">Contact Phone</p>
                  <a href={`tel:${school.contactPhone}`} className="text-sm text-text hover:underline">
                    {school.contactPhone}
                  </a>
                </div>
              </div>
              {school.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary">Website</p>
                    <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm text-akoma-green hover:underline">
                      {school.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Government Info */}
          {school.gesCode && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-text mb-4">Government Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">GES Code</p>
                  <p className="text-sm font-mono">{school.gesCode}</p>
                </div>
                {school.districtCode && (
                  <div>
                    <p className="text-sm text-text-secondary">District Code</p>
                    <p className="text-sm font-mono">{school.districtCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Director Info */}
          {school.directorName && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-text mb-4">Director Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Name</p>
                  <p className="text-sm text-text">{school.directorName}</p>
                </div>
                {school.directorEmail && (
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <a href={`mailto:${school.directorEmail}`} className="text-sm text-akoma-green hover:underline">
                      {school.directorEmail}
                    </a>
                  </div>
                )}
                {school.directorPhone && (
                  <div>
                    <p className="text-sm text-text-secondary">Phone</p>
                    <a href={`tel:${school.directorPhone}`} className="text-sm text-text hover:underline">
                      {school.directorPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4">Verification</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Status</span>
                {getStatusBadge(school.status)}
              </div>
              {school.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Verified At</span>
                  <span className="text-sm text-text">
                    {format(new Date(school.verifiedAt), 'PPP')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Created</span>
                <span className="text-sm text-text">
                  {format(new Date(school.createdAt), 'PPP')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href={`/platform/schools/${school.id}/manage`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Manage School
                </Button>
              </Link>
              <Link href={`/platform/schools/${school.id}/stats`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Statistics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">School not found</h2>
          <Link href="/platform/schools">
            <Button className="mt-4">Back to Schools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link href="/platform/schools" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Schools
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-akoma-green/10 flex items-center justify-center shrink-0">
            {school.logo ? (
              <img src={school.logo} alt={school.name} className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-akoma-green" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text">{school.name}</h1>
              {getStatusBadge(school.status)}
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                {school.code}
              </code>
              <span className="text-sm text-text-secondary">{school.type.charAt(0).toUpperCase() + school.type.slice(1)}</span>
              <span className="text-sm text-text-secondary">•</span>
              <span className="text-sm text-text-secondary">{school.level.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/platform/schools/${school.id}/manage`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          </Link>
          <Link href={`/platform/schools/${school.id}/stats`}>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {['overview', 'students', 'teachers', 'classes', 'attendance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-akoma-green text-akoma-green'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}