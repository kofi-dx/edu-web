/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string;
  user: string;
  isActive: boolean;
  lastLogin?: string;
  profilePicture?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'student' | 'teacher' | 'parent';
  schoolCode?: string;
  schoolId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  
const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data.data;
    
    Cookies.set('accessToken', accessToken, { expires: 1 / 24 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
    setUser(user);
    toast.success('Login successful! Welcome back.');
    return response.data.data; // ← Add this return
  } catch (error: any) {
    const message = error.response?.data?.error?.message || 'Login failed. Please try again.';
    toast.error(message);
    throw error;
  }
};

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      let endpoint = '/auth/register/student';
      if (data.role === 'teacher') endpoint = '/auth/register/teacher';
      if (data.role === 'parent') endpoint = '/auth/register/parent';
      
      const response = await api.post(endpoint, data);
      const { accessToken, refreshToken, user } = response.data.data;
      
      Cookies.set('accessToken', accessToken, { expires: 1 / 24 });
      Cookies.set('refreshToken', refreshToken, { expires: 30 });
      setUser(user);
      toast.success('Registration successful! Welcome to Akoma Edu.');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to change password';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    refreshUser,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}