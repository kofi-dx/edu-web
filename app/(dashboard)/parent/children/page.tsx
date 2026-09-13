/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search, 
  GraduationCap,
  School,
  User,
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getMyChildren } from '@/lib/services/schoolAdminService';

export default function ChildrenListPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const data = await getMyChildren();
      setChildren(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const filtered = children.filter(c => {
    const name = c.user ? `${c.user.firstName} ${c.user.lastName}` : '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Children</h1>
        <p className="text-text-secondary">View and monitor your children&apos;s progress</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search children by name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Children Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {searchTerm ? 'No children match your search' : 'No children linked yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((child) => {
            const name = child.user ? `${child.user.firstName} ${child.user.lastName}` : 'Unknown';
            return (
              <div
                key={child.id}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-akoma-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text">{name}</h3>
                    <p className="text-xs text-text-secondary font-mono">
                      {child.admissionNumber}
                    </p>
                    {child.enrollmentStatus && (
                      <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        child.enrollmentStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {child.enrollmentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {child.class && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <GraduationCap className="h-4 w-4" />
                      <span>{child.class.name}</span>
                    </div>
                  )}
                  {child.class?.school && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <School className="h-4 w-4" />
                      <span>{child.class.school.name}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                  <Link
                    href={`/parent/children/${child.id}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    <User className="h-4 w-4 text-akoma-green" />
                    <span className="text-xs font-medium text-text">Overview</span>
                  </Link>
                  <Link
                    href={`/parent/children/${child.id}/progress`}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    <BookOpen className="h-4 w-4 text-akoma-green" />
                    <span className="text-xs font-medium text-text">Progress</span>
                  </Link>
                  <Link
                    href={`/parent/children/${child.id}/attendance`}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    <CalendarCheck className="h-4 w-4 text-akoma-green" />
                    <span className="text-xs font-medium text-text">Attendance</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}