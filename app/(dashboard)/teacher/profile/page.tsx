/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getTeacherProfile } from '@/lib/services/schoolAdminService';

interface TeacherProfile {
  id: string;
  employeeNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
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

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Define fetchProfile BEFORE useEffect
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getTeacherProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-akoma-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Profile</h1>
          <p className="text-text-secondary">View your profile information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-akoma-green/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-akoma-green">
                {profile.user.firstName?.[0]}{profile.user.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">
                {profile.user.firstName} {profile.user.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-secondary">{profile.employeeNumber}</span>
                <span className="w-1 h-1 rounded-full bg-text-secondary" />
                <span className="text-sm text-akoma-green capitalize">
                  {profile.employmentType?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
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
        </div>

        <div className="border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}