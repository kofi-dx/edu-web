'use client';

import { ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-akoma-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#0B6B4F]/10 rounded-full blur-3xl" />

      <div className="container relative px-4 py-24 mx-auto md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B6B4F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B6B4F]" />
              </span>
              Ghana&apos;s Digital Education Platform
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-[#17201D]">
              Connecting <br />
              <span className="text-[#0B6B4F]">Education</span> in Ghana
            </h1>

            <p className="text-lg text-text-secondary max-w-lg leading-relaxed">
              Akoma Edu is a digital education infrastructure that connects students, 
              parents, teachers, schools, and government across Ghana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/apply/school">
                <Button className="bg-[#0B6B4F] hover:bg-akoma-dark text-white px-8 py-6 text-base rounded-full group transition-all duration-300 hover:shadow-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="px-8 py-6 text-base rounded-full border-2 border-[#0B6B4F] text-[#0B6B4F] hover:bg-[#0B6B4F]/5">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats - Dark text on light background */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
              <div>
                <p className="text-2xl font-bold text-[#0B6B4F]">10+</p>
                <p className="text-sm text-text-secondary">Schools</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B6B4F]">1,000+</p>
                <p className="text-sm text-text-secondary">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B6B4F]">50+</p>
                <p className="text-sm text-text-secondary">Teachers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0B6B4F]">90%</p>
                <p className="text-sm text-text-secondary">Attendance</p>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#0B6B4F]/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-[#0B6B4F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#17201D]">Akoma Edu</p>
                    <p className="text-sm text-text-secondary">School Dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-4">
                    <p className="text-2xl font-bold text-[#0B6B4F]">842</p>
                    <p className="text-xs text-text-secondary">Students</p>
                  </div>
                  <div className="bg-background rounded-xl p-4">
                    <p className="text-2xl font-bold text-[#0B6B4F]">47</p>
                    <p className="text-xs text-text-secondary">Teachers</p>
                  </div>
                  <div className="bg-background rounded-xl p-4">
                    <p className="text-2xl font-bold text-[#0B6B4F]">713</p>
                    <p className="text-xs text-text-secondary">Parents</p>
                  </div>
                  <div className="bg-background rounded-xl p-4">
                    <p className="text-2xl font-bold text-akoma-gold">94%</p>
                    <p className="text-xs text-text-secondary">Attendance</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Today&apos;s Attendance</span>
                    <span className="font-semibold text-[#0B6B4F]">94%</span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#0B6B4F] rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 animate-float">
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-akoma-gold/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-akoma-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17201D]">Learning</p>
                      <p className="text-xs text-text-secondary">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B6B4F]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#0B6B4F]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#17201D]">Parents</p>
                      <p className="text-xs text-text-secondary">Connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}