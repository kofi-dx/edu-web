'use client';

import Link from 'next/link';
import { 
  School2, 
  Users, 
  ClipboardCheck, 
  QrCode, 
  BarChart3,
  Bell,
  Shield,
  GraduationCap,
  Smartphone,
  Database,
  MessageSquare,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const features = [
  {
    icon: School2,
    title: 'School Management',
    description: 'Complete school administration including students, teachers, classes, and parent communication.',
    details: 'Manage all school operations from a single dashboard. Track attendance, performance, and communication.',
    category: 'Management',
  },
  {
    icon: GraduationCap,
    title: 'Curriculum & Learning',
    description: 'Aligned with Ghana\'s national curriculum. Track learning objectives, lessons, and student progress.',
    details: 'Access the national curriculum, create custom curricula, and track student progress against learning objectives.',
    category: 'Learning',
  },
  {
    icon: QrCode,
    title: 'Smart Attendance',
    description: 'QR-based student and staff attendance with real-time tracking and parent notifications.',
    details: 'Students and staff scan QR codes to record attendance. Parents receive instant notifications when their child arrives.',
    category: 'Operations',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessments',
    description: 'Create quizzes, tests, and exams with automatic grading and detailed performance analytics.',
    details: 'Build assessments with multiple question types. Auto-grade objective questions and get instant results.',
    category: 'Learning',
  },
  {
    icon: Bell,
    title: 'Parent Notifications',
    description: 'Real-time alerts about attendance, performance, and school activities via SMS and email.',
    details: 'Keep parents informed with automated notifications about attendance, grades, and school events.',
    category: 'Communication',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Data-driven insights for teachers, school administrators, and government policymakers.',
    details: 'Visualize student performance, attendance trends, and learning outcomes with interactive dashboards.',
    category: 'Analytics',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with role-based access control and data isolation between schools.',
    details: 'Each school\'s data is isolated. Role-based access ensures only authorized users see sensitive information.',
    category: 'Security',
  },
  {
    icon: Users,
    title: 'Connected Ecosystem',
    description: 'Seamless communication between students, teachers, parents, and school administration.',
    details: 'A unified platform where all stakeholders connect, communicate, and collaborate effectively.',
    category: 'Communication',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description: 'Responsive design that works on phones, tablets, and desktops. Offline support for Ghana\'s connectivity.',
    details: 'Access the platform from any device. Offline mode ensures continuity even with limited internet.',
    category: 'Technology',
  },
  {
    icon: Database,
    title: 'Government Integration',
    description: 'Seamless integration with Ghana\'s education systems including EMIS and NaCCA curriculum.',
    details: 'Sync with EMIS for reporting. Access NaCCA curriculum updates. Support government policy initiatives.',
    category: 'Government',
  },
  {
    icon: MessageSquare,
    title: 'Feedback & Voice',
    description: 'Students, teachers, and parents can provide feedback through structured, moderated channels.',
    details: 'Collect feedback on teaching, materials, facilities, and school activities. Track trends and act on insights.',
    category: 'Communication',
  },
  {
    icon: Award,
    title: 'Achievements & Badges',
    description: 'Recognize student achievements with digital badges and certificates.',
    details: 'Motivate students with achievement tracking. Generate certificates for milestones and completions.',
    category: 'Learning',
  },
];

const categories = ['All', 'Management', 'Learning', 'Operations', 'Communication', 'Analytics', 'Security', 'Technology', 'Government'];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = features.filter((feature) => {
    const matchesCategory = activeCategory === 'All' || feature.category === activeCategory;
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
        <div className="container relative px-4 py-20 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium mb-4">
              Features
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#17201D] mb-6">
              Everything You Need for <br />
              <span className="text-[#0B6B4F]">Modern Education</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Akoma Edu provides a complete digital infrastructure for schools, 
              from student management to advanced analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-[#0B6B4F] text-white'
                      : 'bg-background text-text-secondary hover:bg-[#0B6B4F]/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary">No features found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#0B6B4F]/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-[#0B6B4F]" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#17201D]">
                      {feature.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background text-text-secondary">
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-2">
                    {feature.description}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed border-t border-gray-100 pt-3 mt-3">
                    {feature.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B6B4F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-akoma-gold/10 rounded-full blur-3xl" />
        <div className="container relative px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join schools across Ghana using Akoma Edu to improve education outcomes.
          </p>
          <Link href="/apply/school">
            <Button className="bg-akoma-gold hover:bg-akoma-gold/90 text-white px-8 py-6 text-base rounded-full group">
              Start Your School
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}