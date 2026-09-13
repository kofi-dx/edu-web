/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/school/student-applications/page.tsx
'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  UserPlus,
  Eye,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getStudentApplications,
  type AdmissionApplicationSummary,
} from '@/lib/services/schoolAdminService';

// ============================================
// HELPERS
// ============================================

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn';

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

function StatusBadge({ status }: { status: AdmissionApplicationSummary['status'] }) {
  const config: Record<string, { classes: string; icon: React.ReactNode }> = {
    pending: {
      classes: 'bg-amber-100 text-amber-700',
      icon: <Clock className="h-3 w-3" />,
    },
    approved: {
      classes: 'bg-green-100 text-green-700',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
      classes: 'bg-red-100 text-red-700',
      icon: <XCircle className="h-3 w-3" />,
    },
    waitlisted: {
      classes: 'bg-blue-100 text-blue-700',
      icon: <Clock className="h-3 w-3" />,
    },
    withdrawn: {
      classes: 'bg-gray-100 text-gray-700',
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const c = config[status] || config.pending;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.classes}`}
    >
      {c.icon}
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatLevel(level: string): string {
  return level
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================
// PAGE
// ============================================

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<AdmissionApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  // Load applications
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getStudentApplications({
          page,
          limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery.trim() || undefined,
        });

        if (!mounted) return;
        setApplications(result.applications);
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.error?.message || 'Failed to load applications');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [statusFilter, searchQuery, page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-akoma-green" />
            Student Applications
          </h1>
          <p className="text-text-secondary mt-1">
            Review admission applications submitted by parents
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p)}
          className="gap-2 w-fit"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'border-akoma-green text-akoma-green'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 md:p-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by parent or student name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none text-sm"
            />
          </div>
          {!loading && !error && (
            <p className="text-sm text-text-secondary mt-3">
              {total === 0
                ? 'No applications found'
                : `Showing ${applications.length} of ${total} application${
                    total === 1 ? '' : 's'
                  }`}
            </p>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-akoma-green mb-3" />
          <p>Loading applications...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => setPage((p) => p)} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Inbox className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary">
            {statusFilter === 'pending'
              ? 'No pending applications. All caught up!'
              : 'No applications found.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Parent / Guardian</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text">
                        {app.studentFirstName} {app.studentLastName}
                      </p>
                      {app.studentDateOfBirth && (
                        <p className="text-xs text-text-secondary">
                          DOB: {formatDate(app.studentDateOfBirth)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text">
                        {app.parentFirstName} {app.parentLastName}
                      </p>
                      <p className="text-xs text-text-secondary">{app.parentEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text">
                        {formatLevel(app.desiredLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(app.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/school/student-applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/school/student-applications/${app.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">
                      {app.studentFirstName} {app.studentLastName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatLevel(app.desiredLevel)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-sm text-text-secondary">
                  <p className="truncate">
                    Parent: {app.parentFirstName} {app.parentLastName}
                  </p>
                  <p className="text-xs truncate">{app.parentEmail}</p>
                  <p className="text-xs mt-1">
                    Submitted {formatDate(app.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}