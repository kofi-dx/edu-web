/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Bell,
  Lock,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Briefcase,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getTeacherProfile } from '@/lib/services/schoolAdminService';

type SettingsTab = 'profile' | 'notifications' | 'security';

interface TeacherProfile {
  id: string;
  employeeNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  ghanaCardNumber: string | null;
  qualifications: string | null;
  specializations: string[];
  subjects: string[];
  experience: number;
  employmentType: string;
  hiredAt: string;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  school: {
    id: string;
    name: string;
  };
}

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    attendanceAlerts: true,
    assignmentReminders: true,
    parentMessages: true,
    weeklyReports: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Fetch teacher profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await getTeacherProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save notification settings
  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // TODO: API call to update notifications
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (securitySettings.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      // TODO: API call to change password
      toast.success('Password changed successfully');
      setSecuritySettings({
        ...securitySettings,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-secondary">
          Manage your account preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-akoma-green/10 text-akoma-green'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Profile Settings - VIEW ONLY */}
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">Profile Information</h2>
                    <p className="text-sm text-text-secondary">
                      Your account details (view only)
                    </p>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-text-secondary">Loading profile...</p>
                    </div>
                  </div>
                ) : profile ? (
                  <>
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                      <div className="w-16 h-16 rounded-full bg-akoma-green/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-akoma-green">
                          {profile.user.firstName?.[0]}{profile.user.lastName?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text">
                          {profile.user.firstName} {profile.user.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-text-secondary">{profile.employeeNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-text-secondary" />
                          <span className="text-sm text-akoma-green capitalize">
                            {profile.employmentType?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {profile.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-text-secondary">
                            {profile.experience} years experience
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                          Personal Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Full Name</p>
                              <p className="text-sm text-text">
                                {profile.user.firstName} {profile.user.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Email</p>
                              <p className="text-sm text-text">{profile.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Phone</p>
                              <p className="text-sm text-text">{profile.user.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Date of Birth</p>
                              <p className="text-sm text-text">
                                {profile.dateOfBirth
                                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Gender</p>
                              <p className="text-sm text-text capitalize">{profile.gender || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Nationality</p>
                              <p className="text-sm text-text">{profile.nationality || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                          Professional Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Qualifications</p>
                              <p className="text-sm text-text">{profile.qualifications || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Specializations</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {profile.specializations && profile.specializations.length > 0 ? (
                                  profile.specializations.map((spec, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                                    >
                                      {spec}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-text-secondary">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Subjects</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {profile.subjects && profile.subjects.length > 0 ? (
                                  profile.subjects.map((subject, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                    >
                                      {subject}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-text-secondary">N/A</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">Hired At</p>
                              <p className="text-sm text-text">
                                {profile.hiredAt
                                  ? new Date(profile.hiredAt).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-text-secondary" />
                            <div>
                              <p className="text-xs text-text-secondary">School</p>
                              <p className="text-sm text-text">{profile.school?.name || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> To update your profile information, please contact your school administrator.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">Profile not found</p>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">Notification Preferences</h2>
                    <p className="text-sm text-text-secondary">
                      Choose how you want to be notified
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-text">Email Notifications</p>
                      <p className="text-xs text-text-secondary">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: !notificationSettings.emailNotifications,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.emailNotifications
                          ? 'bg-akoma-green'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationSettings.emailNotifications
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-text">Push Notifications</p>
                      <p className="text-xs text-text-secondary">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: !notificationSettings.pushNotifications,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.pushNotifications
                          ? 'bg-akoma-green'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationSettings.pushNotifications
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-text">SMS Notifications</p>
                      <p className="text-xs text-text-secondary">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: !notificationSettings.smsNotifications,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.smsNotifications
                          ? 'bg-akoma-green'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationSettings.smsNotifications
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    What to notify me about
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'When students are absent or late' },
                      { key: 'assignmentReminders', label: 'Assignment Reminders', desc: 'Upcoming assignments and deadlines' },
                      { key: 'parentMessages', label: 'Parent Messages', desc: 'Messages from parents' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly summary of class performance' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-akoma-green focus:ring-akoma-green"
                        />
                        <div>
                          <p className="text-sm font-medium text-text">{item.label}</p>
                          <p className="text-xs text-text-secondary">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={saveNotificationSettings}
                    disabled={saving}
                    className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">Security Settings</h2>
                    <p className="text-sm text-text-secondary">
                      Manage your password and account security
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text">Current Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={securitySettings.currentPassword}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securitySettings.newPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={securitySettings.confirmPassword}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={changePassword}
                    disabled={saving || !securitySettings.currentPassword || !securitySettings.newPassword}
                    className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Two-Factor Authentication</p>
                        <p className="text-xs text-text-secondary">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorEnabled: !securitySettings.twoFactorEnabled,
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        securitySettings.twoFactorEnabled
                          ? 'bg-akoma-green'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          securitySettings.twoFactorEnabled
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 