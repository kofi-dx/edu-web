/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react'; 
import {
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
  X,
  UserCog,
  GraduationCap,
  User as UserIcon,
  Building2,
  Landmark,
  MapPin,
  School as SchoolIcon,
  Heart, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

// ============================================
// ROLE CONFIG
// ============================================

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700', icon: Shield },
  government_admin: { label: 'Government Admin', color: 'bg-red-100 text-red-700', icon: Landmark },
  regional_admin: { label: 'Regional Admin', color: 'bg-orange-100 text-orange-700', icon: MapPin },
  district_admin: { label: 'District Admin', color: 'bg-yellow-100 text-yellow-700', icon: Building2 },
  curriculum_admin: { label: 'Curriculum Admin', color: 'bg-indigo-100 text-indigo-700', icon: GraduationCap },
  analytics_admin: { label: 'Analytics Admin', color: 'bg-cyan-100 text-cyan-700', icon: UserCog },
  school_support: { label: 'School Support', color: 'bg-teal-100 text-teal-700', icon: UserIcon },
  school_admin: { label: 'School Admin', color: 'bg-blue-100 text-blue-700', icon: SchoolIcon },
  teacher: { label: 'Teacher', color: 'bg-green-100 text-green-700', icon: GraduationCap },
  student: { label: 'Student', color: 'bg-akoma-green/10 text-akoma-green', icon: GraduationCap },
  parent: { label: 'Parent', color: 'bg-pink-100 text-pink-700', icon: Heart },
};

// ============================================
// COMPONENT
// ============================================

export default function RegionalUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: itemsPerPage,
      };
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      // Uses the same admin endpoint — but scoping happens server-side
      const response = await api.get('/admin/users', { params });
      const data = response.data.data;

      let filtered = data.users || [];
      // Client-side status filter
      if (statusFilter === 'active') {
        filtered = filtered.filter((u: any) => u.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter((u: any) => !u.isActive);
      }

      setUsers(filtered);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error(error?.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || {
      label: role,
      color: 'bg-gray-100 text-gray-700',
      icon: UserIcon
    };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-6 w-6 text-akoma-green" />
            <h1 className="text-2xl font-bold text-text">Users</h1>
          </div>
          <p className="text-text-secondary">
            {total > 0
              ? `${total.toLocaleString()} user${total !== 1 ? 's' : ''} across all schools in your region`
              : 'Users across all schools in your region'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-akoma-green" />
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Regional User Overview
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              This view shows all users in schools within your region.
              To manage users in a specific school, contact the school admin.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {(showFilters || hasActiveFilters) && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Roles</option>
              {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-akoma-green/10 text-akoma-green text-xs font-medium">
              Search: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-akoma-green/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              {ROLE_CONFIG[roleFilter]?.label || roleFilter}
              <button
                onClick={() => setRoleFilter('all')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium capitalize">
              {statusFilter}
              <button
                onClick={() => setStatusFilter('all')}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Users Table */}
      {loading && users.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
          <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {hasActiveFilters ? 'No users match your filters' : 'No users available'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                      Contact
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-text-secondary uppercase px-6 py-3">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-akoma-green">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-text-secondary font-mono truncate">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-48">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-6 py-4 shadow-sm">
              <p className="text-sm text-text-secondary">
                Page {page} of {totalPages} • Showing {users.length} of {total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-text-secondary mb-2">Role Legend</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}