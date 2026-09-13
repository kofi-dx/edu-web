/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  UserCog,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Printer,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getUserById, changeUserRole, activateUser, suspendUser } from '@/lib/services/adminService';
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
  updatedAt: string;
  profilePicture?: string;
}

interface UserProfile {
  id: string;
  type: 'student' | 'teacher' | 'parent' | 'school_admin' | null;
  details: any;
}

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

const roleIcons: Record<string, any> = {
  super_admin: Shield,
  government_admin: Building2,
  regional_admin: Building2,
  district_admin: Building2,
  curriculum_admin: BookOpen,
  analytics_admin: Users,
  school_support: Users,
  school_admin: Building2,
  teacher: GraduationCap,
  student: GraduationCap,
  parent: Users
};

// Helper function to render role icon
const getRoleIcon = (role: string) => {
  const Icon = roleIcons[role];
  if (!Icon) return null;
  return <Icon className="h-5 w-5 text-akoma-green" />;
};

// Fixed mock activity data (outside component to avoid Date.now() during render)
const MOCK_ACTIVITIES = [
  {
    id: '1',
    type: 'login',
    description: 'User logged in',
    status: 'success'
  },
  {
    id: '2',
    type: 'update',
    description: 'Profile information updated',
    status: 'success'
  },
  {
    id: '3',
    type: 'login',
    description: 'Failed login attempt',
    status: 'failed'
  },
  {
    id: '4',
    type: 'password',
    description: 'Password changed',
    status: 'success'
  }
];

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'activate' | 'suspend'; userId: string } | null>(null);
  const [newRole, setNewRole] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'permissions'>('profile');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserById(userId);
      if (data) {
        setUser(data);
        
        // Check if user has a profile
        let profileData: UserProfile | null = null;
        if (data.role === 'student') {
          profileData = {
            id: data.id,
            type: 'student',
            details: {
              admissionNumber: 'STU-2024-0001',
              class: 'Basic 5A',
              school: 'Kwame Nkrumah Basic School',
              guardian: 'John Doe',
              guardianPhone: '0244123456'
            }
          };
        } else if (data.role === 'teacher') {
          profileData = {
            id: data.id,
            type: 'teacher',
            details: {
              employeeNumber: 'TCH-2024-0001',
              school: 'Kwame Nkrumah Basic School',
              qualifications: 'B.Ed Mathematics',
              subjects: ['Mathematics', 'Science'],
              experience: '5 years'
            }
          };
        } else if (data.role === 'parent') {
          profileData = {
            id: data.id,
            type: 'parent',
            details: {
              children: ['Ama Mensah', 'Kwame Mensah'],
              school: 'Kwame Nkrumah Basic School',
              relationship: 'Father'
            }
          };
        } else if (data.role === 'school_admin') {
          profileData = {
            id: data.id,
            type: 'school_admin',
            details: {
              school: 'Kwame Nkrumah Basic School',
              schoolCode: 'GPS-KWA-38368',
              position: 'Headmaster'
            }
          };
        }
        setProfile(profileData);
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!user || !newRole) return;
    
    setActionLoading(true);
    try {
      await changeUserRole(user.id, newRole);
      toast.success(`User role updated to ${roleLabels[newRole] || newRole}`);
      setShowRoleModal(false);
      setNewRole('');
      await fetchUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      await activateUser(user.id);
      toast.success('User activated successfully');
      setShowConfirmModal(null);
      await fetchUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      await suspendUser(user.id);
      toast.success('User suspended successfully');
      setShowConfirmModal(null);
      await fetchUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!user) return null;
    
    if (user.isActive) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
        <XCircle className="h-4 w-4" />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const color = roleColors[role] || 'bg-gray-100 text-gray-700';
    const label = roleLabels[role] || role;
    return (
      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const renderProfile = () => {
    if (!user) return null;

    return (
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-akoma-green" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Full Name</p>
              <p className="text-base font-medium text-text">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">User ID</p>
              <p className="text-sm font-mono text-text">{user.id}</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <a href={`mailto:${user.email}`} className="text-sm text-akoma-green hover:underline">
                  {user.email}
                </a>
                {user.emailVerified && (
                  <span className="inline-flex ml-2 text-xs text-green-600">✓ Verified</span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-text-secondary">Phone</p>
                <a href={`tel:${user.phone}`} className="text-sm text-text hover:underline">
                  {user.phone}
                </a>
                {user.phoneVerified && (
                  <span className="inline-flex ml-2 text-xs text-green-600">✓ Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-akoma-green" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Role</p>
              <div className="mt-1">{getRoleBadge(user.role)}</div>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Joined</p>
              <p className="text-text">
                {format(new Date(user.createdAt), 'PPP')}
              </p>
              <p className="text-xs text-text-secondary">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </p>
            </div>
            {user.lastLogin && (
              <div>
                <p className="text-sm text-text-secondary">Last Login</p>
                <p className="text-text">
                  {format(new Date(user.lastLogin), 'PPP')}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        {profile && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              {getRoleIcon(user.role)}
              {roleLabels[user.role] || 'Profile'} Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-text-secondary capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-text">
                    {Array.isArray(value) ? value.join(', ') : String(value || 'Not provided')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActivity = () => {
    if (!user) return null;

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-akoma-green" />
          Activity History
        </h3>
        <div className="space-y-4">
          {MOCK_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {activity.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">{activity.description}</p>
                <p className="text-xs text-text-secondary">
                  {/* Use a static time or current time */}
                  {format(new Date(), 'PPP')} at {format(new Date(), 'p')}
                  {' '}(Recently)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPermissions = () => {
    if (!user) return null;

    const permissions = [
      { action: 'View Dashboard', allowed: true },
      { action: 'Manage Users', allowed: user.role === 'super_admin' || user.role === 'government_admin' },
      { action: 'Manage Schools', allowed: ['super_admin', 'government_admin', 'regional_admin', 'district_admin', 'school_admin'].includes(user.role) },
      { action: 'Manage Curriculum', allowed: ['super_admin', 'curriculum_admin', 'school_admin', 'teacher'].includes(user.role) },
      { action: 'View Analytics', allowed: ['super_admin', 'government_admin', 'analytics_admin'].includes(user.role) },
      { action: 'Manage Classes', allowed: ['super_admin', 'school_admin', 'teacher'].includes(user.role) },
      { action: 'Manage Assessments', allowed: ['super_admin', 'school_admin', 'teacher'].includes(user.role) },
      { action: 'View Reports', allowed: ['super_admin', 'government_admin', 'analytics_admin', 'school_admin', 'teacher'].includes(user.role) },
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-akoma-green" />
          Permissions
        </h3>
        <div className="space-y-2">
          {permissions.map((perm, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-text">{perm.action}</span>
              {perm.allowed ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Allowed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                  <XCircle className="h-3.5 w-3.5" />
                  Denied
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            Permissions are determined by the user&apos;s role. Changing a role will update permissions.
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-text-secondary mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text">User not found</h2>
          <Link href="/platform/users">
            <Button className="mt-4">Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/platform/users" className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUser}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-akoma-green">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-text">
                  {user.firstName} {user.lastName}
                </h1>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap">
                {getRoleBadge(user.role)}
                <span className="text-text-secondary">•</span>
                <span className="text-sm text-text-secondary">ID: {user.id.slice(0, 8)}...</span>
                <span className="text-text-secondary">•</span>
                <span className="text-sm text-text-secondary">
                  Joined {format(new Date(user.createdAt), 'PPP')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="default"
              className="gap-2"
              onClick={() => {
                setNewRole(user.role);
                setShowRoleModal(true);
              }}
            >
              <UserCog className="h-4 w-4" />
              Change Role
            </Button>
            {user.isActive ? (
              <Button
                variant="outline"
                size="default"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                onClick={() => setShowConfirmModal({ type: 'suspend', userId: user.id })}
              >
                <UserX className="h-4 w-4" />
                Suspend
              </Button>
            ) : (
              <Button
                size="default"
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => setShowConfirmModal({ type: 'activate', userId: user.id })}
              >
                <UserCheck className="h-4 w-4" />
                Activate
              </Button>
            )}
            <Button
              variant="outline"
              size="default"
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['profile', 'activity', 'permissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'profile' | 'activity' | 'permissions')}
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
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'activity' && renderActivity()}
      {activeTab === 'permissions' && renderPermissions()}

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-akoma-green/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-akoma-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Change User Role</h3>
                <p className="text-sm text-text-secondary">
                  Update role for {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Current Role
                </label>
                <p className="text-sm text-text">{roleLabels[user.role] || user.role}</p>
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
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Changing the user&apos;s role will update their permissions immediately.</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setNewRole('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                className="bg-akoma-green hover:bg-akoma-dark text-white"
                disabled={actionLoading || newRole === user.role}
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
                  Are you sure you want to {showConfirmModal.type} {user.firstName} {user.lastName}?
                </p>
              </div>
            </div>

            <div className={`rounded-lg p-3 border mb-6 ${showConfirmModal.type === 'activate' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm ${showConfirmModal.type === 'activate' ? 'text-green-800' : 'text-red-800'} flex items-start gap-2`}>
                {showConfirmModal.type === 'activate' ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>
                  {showConfirmModal.type === 'activate' 
                    ? `${user.firstName} will regain access to the platform.`
                    : `${user.firstName} will lose access to the platform until reactivated.`}
                </span>
              </p>
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
                onClick={showConfirmModal.type === 'activate' ? handleActivate : handleSuspend}
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