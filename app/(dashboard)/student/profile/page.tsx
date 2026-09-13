/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, School, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { getStudentProfile } from '@/lib/services/schoolAdminService';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getStudentProfile();
      setProfile(data);
    } catch  {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-secondary">View your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-akoma-green/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-akoma-green">
              {profile?.user?.firstName?.[0]}{profile?.user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">
              {profile?.user?.firstName} {profile?.user?.lastName}
            </h2>
            <p className="text-sm text-text-secondary">{profile?.admissionNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text">{profile?.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Phone</p>
              <p className="text-sm text-text">{profile?.user?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Date of Birth</p>
              <p className="text-sm text-text">{profile?.dateOfBirth || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">Gender</p>
              <p className="text-sm text-text capitalize">{profile?.gender || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Info */}
      {profile?.class && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <School className="h-5 w-5 text-akoma-green" />
            Class Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <GraduationCap className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Class</p>
                <p className="text-sm text-text">{profile.class.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">School</p>
                <p className="text-sm text-text">{profile.class.school?.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}