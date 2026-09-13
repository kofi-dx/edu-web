/* eslint-disable react-hooks/immutability */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Briefcase, Globe, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getParentProfile } from '@/lib/services/schoolAdminService';

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getParentProfile();
      setProfile(data);
    } catch {
      toast.error('Failed to load profile');
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

  const user = profile?.user || profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-secondary">View your personal information</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-akoma-green/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-akoma-green">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-text-secondary capitalize">
              {profile?.relationship || 'Parent'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text">{user?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Phone</p>
              <p className="text-sm text-text">{user?.phone || 'N/A'}</p>
            </div>
          </div>

          {profile?.occupation && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Occupation</p>
                <p className="text-sm text-text">{profile.occupation}</p>
              </div>
            </div>
          )}

          {profile?.preferredLanguage && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Preferred Language</p>
                <p className="text-sm text-text uppercase">{profile.preferredLanguage}</p>
              </div>
            </div>
          )}

          {profile?.notificationPreference && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Notifications</p>
                <p className="text-sm text-text capitalize">{profile.notificationPreference}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Verification</p>
              <p className="text-sm text-text">
                {profile?.isVerified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}