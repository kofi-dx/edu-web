// app/(public)/help/page.tsx
'use client';

import Link from 'next/link';
import {
  BookOpen,
  Users,
  GraduationCap,
  School2,
  QrCode,
  BarChart3,
  Mail,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const categories = [
  {
    icon: School2,
    title: 'Getting Started',
    description: 'Apply, onboard, and set up your school',
    href: '/docs#getting-started',
  },
  {
    icon: Users,
    title: 'Students & Parents',
    description: 'Manage enrollment, admission, and parent access',
    href: '/docs#students',
  },
  {
    icon: GraduationCap,
    title: 'Teachers & Classes',
    description: 'Assign teachers, create classes, and manage rosters',
    href: '/docs#teachers',
  },
  {
    icon: BookOpen,
    title: 'Curriculum & Lessons',
    description: 'Browse the curriculum and deliver lessons',
    href: '/docs#curriculum',
  },
  {
    icon: QrCode,
    title: 'Attendance & Devices',
    description: 'Set up QR scanners and confirm class attendance',
    href: '/docs#attendance',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Track progress and export reports',
    href: '/docs#analytics',
  },
];

const quickLinks = [
  { label: 'How to apply for a school account', href: '/docs#apply-school' },
  { label: 'Adding students to a class', href: '/docs#add-students' },
  { label: 'Creating an assessment', href: '/docs#create-assessment' },
  { label: 'Setting up QR attendance', href: '/docs#qr-setup' },
  { label: 'Generating a school report', href: '/docs#reports' },
];

export default function HelpPage() {
  return (
    <PageShell
      badge="Help Center"
      title="How can we help?"
      subtitle="Find answers, guides, and support for everything Akoma Edu."
    >
      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-[#17201D] mb-6">
          Browse by topic
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-[#0B6B4F]" />
                </div>
                <h3 className="font-semibold text-[#17201D] group-hover:text-[#0B6B4F] transition-colors mb-1">
                  {c.title}
                </h3>
                <p className="text-sm text-text-secondary">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-[#17201D] mb-4">
          Popular articles
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm text-[#17201D] group-hover:text-[#0B6B4F]">
                {link.label}
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
            <Mail className="h-5 w-5 text-[#0B6B4F]" />
          </div>
          <h3 className="font-semibold text-[#17201D] mb-1">Email Support</h3>
          <p className="text-sm text-text-secondary mb-3">
            We respond within 1 business day.
          </p>
          <a
            href="mailto:support@akoma-edu.com"
            className="text-sm text-[#0B6B4F] font-medium hover:underline"
          >
            support@akoma-edu.com
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
            <MessageCircle className="h-5 w-5 text-[#0B6B4F]" />
          </div>
          <h3 className="font-semibold text-[#17201D] mb-1">Contact Us</h3>
          <p className="text-sm text-text-secondary mb-3">
            Have a specific question? Reach out directly.
          </p>
          <Link
            href="/contact"
            className="text-sm text-[#0B6B4F] font-medium hover:underline"
          >
            Go to contact form →
          </Link>
        </div>
      </div>

      <PageCTA
        title="Need a walkthrough?"
        subtitle="Our team can guide your school through setup and onboarding."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="View Documentation"
        secondaryHref="/docs"
      />
    </PageShell>
  );
}