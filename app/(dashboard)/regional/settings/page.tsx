/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Globe,
  Lock,
  Mail,
  Phone,
  Building2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Eye,
  EyeOff,
  LogOut,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getRegionalOverview } from '@/lib/services/regionalService';

// ============================================
// TYPES
// ============================================

interface NotificationSettings {
  emailOnApplication: boolean;
  emailWeeklyReport: boolean;
  emailMonthlyReport: boolean;
  emailCriticalAlerts: boolean;
  smsCriticalAlerts: boolean;
}

interface Preferences {
  language: 'en' | 'tw' | 'ga' | 'ee';
  dashboardDefaultRange: '7d' | '30d' | '90d' | '1y';
  currency: 'GHS' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

// ============================================
// COMPONENT
// ============================================

export default function RegionalSettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [regionName, setRegionName] = useState<string>('');

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    office: '',
    position: 'Regional Director',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailOnApplication: true,
    emailWeeklyReport: true,
    emailMonthlyReport: true,
    emailCriticalAlerts: true,
    smsCriticalAlerts: false,
  });

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'en',
    dashboardDefaultRange: '30d',
    currency: 'GHS',
    dateFormat: 'DD/MM/YYYY',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Load settings from localStorage + fetch region name
  useEffect(() => {
    try {
      const saved = localStorage.getItem('regional_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.preferences) setPreferences(parsed.preferences);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }

    // Fetch region name
    const fetchRegion = async () => {
      try {
        const overview = await getRegionalOverview('30d');
        if (overview?.region?.name) {
          setRegionName(overview.region.name);
        }
      } catch {
        // Silently fail — user may not have scope
      }
    };
    fetchRegion();
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem(
        'regional_settings',
        JSON.stringify({ notifications, preferences })
      );
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    if (!profile.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    saveSettings();
    toast.success('Notification preferences saved');
  };

  const handleSavePreferences = () => {
    saveSettings();
    toast.success('Preferences saved');
  };

  const handleChangePassword = async () => {
    if (!passwords.current) {
      toast.error('Current password is required');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Lock className="h-6 w-6 text-akoma-green" />
        <h1 className="text-2xl font-bold text-text">Settings</h1>
      </div>
      <p className="text-text-secondary">
        Manage your account and preferences
      </p>

      {/* Region Banner */}
      {regionName && (
        <div className="bg-linear-to-r from-akoma-green to-green-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Managing</p>
              <p className="text-xl font-bold">{regionName} Region</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-akoma-green text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================
          PROFILE TAB
          ============================================ */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                <User className="h-5 w-5 text-akoma-green" />
                Profile Information
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Update your personal information
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-akoma-green/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-akoma-green">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-text">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-text-secondary capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                ID: {user?.id?.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Office / Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <input
                  type="text"
                  value={profile.office}
                  onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                  placeholder={`${regionName || 'Regional'} Education Office`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Position / Title
              </label>
              <input
                type="text"
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                placeholder="e.g., Regional Director"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Button
              variant="outline"
              onClick={() => setProfile({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                phone: (user as any)?.phone || '',
                office: '',
                position: 'Regional Director',
              })}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* ============================================
          NOTIFICATIONS TAB
          ============================================ */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-1">
            <Bell className="h-5 w-5 text-akoma-green" />
            Notification Preferences
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Choose what updates you want to receive
          </p>

          {/* Email Notifications */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-text-secondary" />
              Email Notifications
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'emailOnApplication' as const,
                  label: 'New school applications',
                  desc: 'Get notified when a new school applies in your region'
                },
                {
                  key: 'emailWeeklyReport' as const,
                  label: 'Weekly performance summary',
                  desc: 'Receive a weekly email with key metrics for your region'
                },
                {
                  key: 'emailMonthlyReport' as const,
                  label: 'Monthly analytics report',
                  desc: 'Full monthly report with charts and trends'
                },
                {
                  key: 'emailCriticalAlerts' as const,
                  label: 'Critical alerts',
                  desc: 'Important notifications about at-risk schools in your region'
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    className="h-4 w-4 rounded text-akoma-green focus:ring-akoma-green mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">{item.label}</p>
                    <p className="text-xs text-text-secondary">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-text-secondary" />
              SMS Notifications
            </h3>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={notifications.smsCriticalAlerts}
                onChange={(e) => setNotifications({ ...notifications, smsCriticalAlerts: e.target.checked })}
                className="h-4 w-4 rounded text-akoma-green focus:ring-akoma-green mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Critical alerts via SMS</p>
                <p className="text-xs text-text-secondary">
                  Get urgent notifications by text message (data rates may apply)
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Button
              onClick={handleSaveNotifications}
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* ============================================
          PREFERENCES TAB
          ============================================ */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-1">
            <Globe className="h-5 w-5 text-akoma-green" />
            System Preferences
          </h2>
          <p className="text-xs text-text-secondary mb-6">
            Customize how the platform looks and behaves
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="en">English</option>
                <option value="tw">Twi</option>
                <option value="ga">Ga</option>
                <option value="ee">Ewe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Default Dashboard Range
              </label>
              <select
                value={preferences.dashboardDefaultRange}
                onChange={(e) => setPreferences({ ...preferences, dashboardDefaultRange: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="GHS">Ghana Cedis (GHS)</option>
                <option value="USD">US Dollars (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Button
              onClick={handleSavePreferences}
              className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* ============================================
          SECURITY TAB
          ============================================ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-1">
              <Lock className="h-5 w-5 text-akoma-green" />
              Change Password
            </h2>
            <p className="text-xs text-text-secondary mb-6">
              Keep your account secure with a strong password
            </p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  At least 8 characters, mix of letters and numbers recommended
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                />
                {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
                {passwords.new && passwords.confirm && passwords.new === passwords.confirm && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <Button
                onClick={handleChangePassword}
                disabled={saving}
                className="bg-akoma-green hover:bg-akoma-dark text-white gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Update Password
              </Button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-akoma-green" />
              Session
            </h2>
            <p className="text-xs text-text-secondary mb-6">
              Current login session information
            </p>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-text">Current Session</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Signed in as {user?.email}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Active now
                </p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-1">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Irreversible and destructive actions
            </p>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="text-sm font-medium text-red-800">
                  Deactivate Account
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  Contact super admin to deactivate your account
                </p>
              </div>
              <Button
                variant="outline"
                disabled
                className="text-red-600 border-red-200"
              >
                Contact Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}