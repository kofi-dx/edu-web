// components/Navbar.tsx (PUBLIC VERSION)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  Building2,
  LogOut,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const publicNavItems = [
    { label: 'Features', href: '/features' },
    { label: 'Schools', href: '/schools' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <GraduationCap className="h-8 w-8 text-akoma-green" />
            <span className="text-xl font-bold text-akoma-green">Akoma Edu</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Public Links */}
            {publicNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-text-secondary hover:text-text transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Register Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('register')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-1 text-text-secondary hover:text-text transition-colors text-sm font-medium">
                Get Started
                <ChevronDown className="h-4 w-4" />
              </button>
              {openDropdown === 'register' && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Primary CTA: School Registration */}
                  <Link
                    href="/register/school"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-akoma-green/5 transition-colors"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5 text-akoma-green" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">
                        Register Your School
                      </p>
                      <p className="text-xs text-text-secondary">
                        For Government & Private schools
                      </p>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1" />

                  {/* Info: Others created by school */}
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-800">
                          Student, Teacher, or Parent?
                        </p>
                        <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                          Your school admin will create your account. Contact
                          your school for login credentials.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Check Application Status */}
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    href="/apply/status"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <ArrowRight className="h-4 w-4 text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">
                        Check Application Status
                      </p>
                      <p className="text-xs text-text-secondary">
                        Already applied? Track your application
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* User Section */}
            {user ? (
              <Link href={`/dashboard/${user.role}`}>
                <Button className="bg-akoma-green hover:bg-akoma-dark text-white text-sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register/school">
                  <Button className="bg-akoma-green hover:bg-akoma-dark text-white text-sm">
                    Register School
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Public Links */}
            {publicNavItems.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-2.5 text-text-secondary hover:text-text transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Get Started (Mobile) */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Get Started
              </p>

              {/* Primary CTA: Register School */}
              <Link
                href="/register/school"
                className="flex items-center gap-3 py-2.5 text-text-secondary hover:text-text transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-akoma-green" />
                </div>
                <div>
                  <p className="text-sm font-medium">Register Your School</p>
                  <p className="text-xs text-text-secondary">
                    For Government & Private
                  </p>
                </div>
              </Link>

              {/* Info for students/teachers/parents */}
              <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-800">
                      Student, Teacher, or Parent?
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                      Your school admin will create your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Check status */}
              <Link
                href="/apply/status"
                className="flex items-center gap-3 py-2.5 text-text-secondary hover:text-text transition-colors mt-1"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Check Application Status</p>
                </div>
              </Link>
            </div>

            {/* User Section (Mobile) */}
            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/${user.role}`}
                  className="block py-2.5 text-akoma-green font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Go to Dashboard →
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 py-2.5 text-red-600 font-medium w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register/school" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-akoma-green hover:bg-akoma-dark text-white">
                    Register School
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}