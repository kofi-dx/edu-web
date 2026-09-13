/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Download,
  RefreshCw,
  UserCog,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getAllUsers, changeUserRole, activateUser, suspendUser } from '@/lib/services/adminService';
import { format, formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  profilePicture?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

type RoleType = 'all' | 'super_admin' | 'government_admin' | 'regional_admin' | 'district_admin' | 
  'curriculum_admin' | 'analytics_admin' | 'school_support' | 'school_admin' | 'teacher' | 'student' | 'parent';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  government_admin: 'GES Admin',
  regional_admin: 'Regional Admin',
  district_admin: 'District Admin',
  curriculum_admin: 'Curriculum Admin',
  analytics_admin: 'Analytics Admin',
  school_support: 'School Support',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent'
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  government_admin: 'bg-blue-100 text-blue-700',
  regional_admin: 'bg-indigo-100 text-indigo-700',
  district_admin: 'bg-cyan-100 text-cyan-700',
  curriculum_admin: 'bg-green-100 text-green-700',
  analytics_admin: 'bg-orange-100 text-orange-700',
  school_support: 'bg-teal-100 text-teal-700',
  school_admin: 'bg-akoma-green/10 text-akoma-green',
  teacher: 'bg-blue-50 text-blue-600',
  student: 'bg-yellow-50 text-yellow-600',
  parent: 'bg-pink-50 text-pink-600'
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<RoleType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'activate' | 'suspend'; userId: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newRole, setNewRole] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Only pass supported parameters
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Only add role filter if not 'all'
      if (filterRole !== 'all') {
        params.role = filterRole;
      }
      // Note: status and search are not supported by the backend yet

      const data = await getAllUsers(params);
      
      if (data) {
        let usersList = data.users || [];
        
        // Client-side filtering for search
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          usersList = usersList.filter((u: User) =>
            u.firstName.toLowerCase().includes(search) ||
            u.lastName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.phone.includes(search)
          );
        }
        
        // Client-side filtering for status
        if (filterStatus !== 'all') {
          usersList = usersList.filter((u: User) =>
            filterStatus === 'active' ? u.isActive : !u.isActive
          );
        }
        
        setUsers(usersList);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        
        // Calculate stats from ALL users (not filtered)
        const allUsers = data.users || [];
        const total = data.total || 0;
        const active = allUsers.filter((u: User) => u.isActive).length;
        const inactive = allUsers.filter((u: User) => !u.isActive).length;
        
        const byRole: Record<string, number> = {};
        allUsers.forEach((u: User) => {
          byRole[u.role] = (byRole[u.role] || 0) + 1;
        });
        
        setStats({ total, active, inactive, byRole });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    setActionLoading(true);
    try {
      await changeUserRole(selectedUser.id, newRole);
      toast.success(`User role updated to ${roleLabels[newRole] || newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (userId: string) => {
    setActionLoading(true);
    try {
      await activateUser(userId);
      toast.success('User activated successfully');
      setShowConfirmModal(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    setActionLoading(true);
    try {
      await suspendUser(userId);
      toast.success('User suspended successfully');
      setShowConfirmModal(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <XCircle className="h-3 w-3" />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const color = roleColors[role] || 'bg-gray-100 text-gray-700';
    const label = roleLabels[role] || role;
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-text-secondary">
            Manage all users on the Akoma Edu platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards - REAL DATA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Total Users</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Roles</p>
          <p className="text-2xl font-bold text-akoma-green">
            {Object.keys(stats.byRole).length}
          </p>
        </div>
      </div>

      {/* Role Breakdown - REAL DATA */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <div key={role} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-text">{roleLabels[role] || role}:</span>
              <span className="text-sm font-bold text-akoma-green">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value as RoleType);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Roles</option>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - REAL DATA */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Joined
                </th>
                <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No users found</p>
                    <p className="text-xs text-text-secondary">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-akoma-green">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-text-secondary" />
                          <a href={`mailto:${user.email}`} className="text-sm text-akoma-green hover:underline">
                            {user.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-text-secondary" />
                          <a href={`tel:${user.phone}`} className="text-sm text-text hover:underline">
                            {user.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                      {user.emailVerified && (
                        <span className="inline-flex ml-1.5 text-xs text-green-600">
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm text-text-secondary">
                          {format(new Date(user.createdAt), 'PPP')}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </p>
                        {user.lastLogin && (
                          <p className="text-xs text-text-secondary">
                            Last login: {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/platform/users/${user.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setShowConfirmModal({ type: 'suspend', userId: user.id })}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => setShowConfirmModal({ type: 'activate', userId: user.id })}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, users.length)} of {users.length} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-akoma-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Change User Role</h3>
                <p className="text-sm text-text-secondary">
                  Update role for {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Current Role
                </label>
                <p className="text-sm text-text">{roleLabels[selectedUser.role] || selectedUser.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                >
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Changing a user&apos;s role will update their permissions immediately.</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                className="bg-akoma-green hover:bg-akoma-dark text-white"
                disabled={actionLoading || newRole === selectedUser.role}
              >
                {actionLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${showConfirmModal.type === 'activate' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                {showConfirmModal.type === 'activate' ? (
                  <UserCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <UserX className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {showConfirmModal.type === 'activate' ? 'Activate User' : 'Suspend User'}
                </h3>
                <p className="text-sm text-text-secondary">
                  Are you sure you want to {showConfirmModal.type} this user?
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className={`rounded-lg p-3 border ${showConfirmModal.type === 'activate' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-sm ${showConfirmModal.type === 'activate' ? 'text-green-800' : 'text-red-800'} flex items-start gap-2`}>
                  {showConfirmModal.type === 'activate' ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>
                    {showConfirmModal.type === 'activate' 
                      ? 'This user will regain access to the platform.'
                      : 'This user will lose access to the platform until reactivated.'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (showConfirmModal.type === 'activate') {
                    handleActivate(showConfirmModal.userId);
                  } else {
                    handleSuspend(showConfirmModal.userId);
                  }
                }}
                className={showConfirmModal.type === 'activate' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Yes, ${showConfirmModal.type}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}