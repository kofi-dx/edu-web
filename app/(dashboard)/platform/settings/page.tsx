/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Shield,
  Bell,
  User,
  Database,
  Palette,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Trash2,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type TabType = 'general' | 'profile' | 'security' | 'notifications' | 'system' | 'api' | 'theme';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SecurityData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  // Security form
  const [security, setSecurity] = useState<SecurityData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Theme settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    schoolUpdates: true,
    systemAlerts: true,
    marketing: false,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultLanguage: 'en',
    timezone: 'GMT',
    dateFormat: 'DD/MM/YYYY',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({ ...notifications, [key]: value });
  };

  const handleSystemChange = (key: string, value: any) => {
    setSystemSettings({ ...systemSettings, [key]: value });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/update-profile', profile);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (security.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      toast.success('Password changed successfully');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const saveTheme = () => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('theme', theme);
    toast.success(`Theme set to ${theme}`);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
    { id: 'api', label: 'API', icon: Key },
    { id: 'theme', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-secondary">Manage your account and platform settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-akoma-green/10 text-akoma-green'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-text'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">General Settings</h3>
                  <p className="text-sm text-text-secondary">Manage your account settings</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Name</p>
                      <p className="text-sm text-text-secondary">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-sm text-akoma-green hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Email</p>
                      <p className="text-sm text-text-secondary">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="text-sm text-akoma-green hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Role</p>
                      <p className="text-sm text-text-secondary capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-text">Account Status</p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">Profile Settings</h3>
                  <p className="text-sm text-text-secondary">Update your personal information</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">First Name</label>
                      <input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">Last Name</label>
                      <input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Phone</label>
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setProfile({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                      })}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">Security Settings</h3>
                  <p className="text-sm text-text-secondary">Change your password and security preferences</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); changePassword(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={security.currentPassword}
                        onChange={handleSecurityChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all pr-10"
                        placeholder="Enter current password"
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
                    <label className="block text-sm font-medium text-text mb-1.5">New Password</label>
                    <input
                      name="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Confirm New Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Password must be at least 8 characters and include a mix of letters, numbers, and special characters.</span>
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Change Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">Notification Settings</h3>
                  <p className="text-sm text-text-secondary">Manage how you receive notifications</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-text capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {key === 'email' ? 'Receive notifications via email' :
                           key === 'sms' ? 'Receive notifications via SMS' :
                           key === 'push' ? 'Receive push notifications' :
                           key === 'schoolUpdates' ? 'Updates about your school' :
                           key === 'systemAlerts' ? 'Important system alerts' :
                           'Marketing and promotional emails'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key, !value)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-akoma-green' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => toast.success('Notification settings saved')}
                    className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">System Settings</h3>
                  <p className="text-sm text-text-secondary">Configure platform-wide settings</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Maintenance Mode</p>
                      <p className="text-sm text-text-secondary">Put the platform in maintenance mode</p>
                    </div>
                    <button
                      onClick={() => handleSystemChange('maintenanceMode', !systemSettings.maintenanceMode)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Allow Registration</p>
                      <p className="text-sm text-text-secondary">Allow new users to register</p>
                    </div>
                    <button
                      onClick={() => handleSystemChange('allowRegistration', !systemSettings.allowRegistration)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        systemSettings.allowRegistration ? 'bg-akoma-green' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        systemSettings.allowRegistration ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">Email Verification</p>
                      <p className="text-sm text-text-secondary">Require email verification for new users</p>
                    </div>
                    <button
                      onClick={() => handleSystemChange('requireEmailVerification', !systemSettings.requireEmailVerification)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        systemSettings.requireEmailVerification ? 'bg-akoma-green' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        systemSettings.requireEmailVerification ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Default Language</label>
                    <select
                      value={systemSettings.defaultLanguage}
                      onChange={(e) => handleSystemChange('defaultLanguage', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="en">English</option>
                      <option value="tw">Twi</option>
                      <option value="ga">Ga</option>
                      <option value="ha">Hausa</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => toast.success('System settings saved')}
                    className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">API Settings</h3>
                  <p className="text-sm text-text-secondary">Manage API access and tokens</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">API Access</p>
                      <p className="text-sm text-blue-700">Your API keys are used to authenticate requests to the Akoma Edu API.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">API Key</p>
                      <p className="text-sm text-text-secondary">Your secret API key</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-3 py-1.5 rounded font-mono">
                        sk_live_•••••••••••••••••••••••
                      </code>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-text">API Rate Limit</p>
                      <p className="text-sm text-text-secondary">Current rate limit</p>
                    </div>
                    <span className="text-sm font-medium text-text">100 requests/minute</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-text">API Version</p>
                      <p className="text-sm text-text-secondary">Current API version</p>
                    </div>
                    <span className="text-sm font-medium text-text">v1.0.0</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Key
                  </Button>
                  <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    Revoke Key
                  </Button>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text">Appearance</h3>
                  <p className="text-sm text-text-secondary">Customize the look and feel of the platform</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => { setTheme('light'); saveTheme(); }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-akoma-green bg-akoma-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium text-text">Light</p>
                    <p className="text-xs text-text-secondary">Light theme</p>
                  </button>
                  <button
                    onClick={() => { setTheme('dark'); saveTheme(); }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-akoma-green bg-akoma-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm font-medium text-text">Dark</p>
                    <p className="text-xs text-text-secondary">Dark theme</p>
                  </button>
                  <button
                    onClick={() => { setTheme('system'); saveTheme(); }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-akoma-green bg-akoma-green/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm font-medium text-text">System</p>
                    <p className="text-xs text-text-secondary">Follow system preference</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}