// app/(public)/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Building2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { roleDashboards } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      const user = (response as unknown as {
        user?: { role: keyof typeof roleDashboards };
      } | undefined)?.user;

      if (user) {
        router.push(roleDashboards[user.role] || '/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-akoma-green/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-akoma-green" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
            <p className="text-text-secondary text-sm mt-1">
              Sign in to your Akoma Edu account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-akoma-green focus:border-transparent outline-none transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-200 text-akoma-green focus:ring-akoma-green"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-akoma-green hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-akoma-green hover:bg-akoma-dark text-white py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-secondary">
                New to Akoma Edu?
              </span>
            </div>
          </div>

          {/* Register Options */}
          <div className="space-y-3">
            {/* School Registration - Primary CTA */}
            <Link href="/register/school" className="block">
              <div className="group flex items-center gap-3 p-4 rounded-xl border-2 border-akoma-green/20 bg-akoma-green/5 hover:bg-akoma-green/10 hover:border-akoma-green/40 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-akoma-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">
                    Register Your School
                  </p>
                  <p className="text-xs text-text-secondary">
                    For schools (Government & Private)
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-akoma-green group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>

            {/* Info about student/teacher/parent */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-800">
                    Student, Teacher, or Parent?
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    Your school admin will create your account. Contact your
                    school for login credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-secondary mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}