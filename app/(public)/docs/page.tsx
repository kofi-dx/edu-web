// app/(public)/docs/page.tsx
'use client';

import Link from 'next/link';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const sections = [
  {
    id: 'for-schools',
    title: 'For Schools — Join Akoma Edu',
    articles: [
      { title: 'How to register your school', href: '/register/school' },
      { title: 'Government vs private school applications', href: '/register/school' },
      { title: 'What happens after you apply', href: '#' },
      { title: 'Your first login as a school admin', href: '/login' },
    ],
  },
  {
    id: 'for-parents',
    title: 'For Parents — Enroll Your Child',
    articles: [
      { title: 'Browse schools on Akoma Edu', href: '/schools' },
      { title: 'How to apply for your child', href: '/schools' },
      { title: 'Tracking your application status', href: '#' },
      { title: 'What happens after approval', href: '#' },
    ],
  },
  {
    id: 'school-admin',
    title: 'School Admin — Getting Started',
    articles: [
      { title: 'Understanding your school dashboard', href: '/school' },
      { title: 'Setting up your first class', href: '/school/classes' },
      { title: 'Adding teachers to your school', href: '/school/teachers' },
      { title: 'Adding students manually', href: '/school/students' },
    ],
  },
  {
    id: 'applications',
    title: 'Student Applications (Admin)',
    articles: [
      { title: 'Reviewing parent applications', href: '/school/student-applications' },
      { title: 'Approving a student & creating accounts', href: '/school/student-applications' },
      { title: 'Rejecting an application', href: '/school/student-applications' },
      { title: 'Linking parents to students', href: '/school/parents' },
    ],
  },
  {
    id: 'teachers',
    title: 'Teachers & Classes',
    articles: [
      { title: 'Adding a teacher', href: '/school/teachers' },
      { title: 'Assigning teachers to classes', href: '/school/classes' },
      { title: 'Managing class rosters', href: '/school/classes' },
      { title: 'Viewing teacher performance', href: '/school/analytics/teachers' },
    ],
  },
  {
    id: 'curriculum',
    title: 'Curriculum & Lessons',
    articles: [
      { title: 'Browsing the NaCCA curriculum', href: '#' },
      { title: 'Understanding the 10-layer structure', href: '#' },
      { title: 'Tracking lesson completion', href: '#' },
      { title: 'Using learning objectives', href: '#' },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance & Devices',
    articles: [
      { title: 'Setting up QR attendance', href: '/school/attendance/devices' },
      { title: 'Generating student ID cards', href: '/school/attendance/id-cards' },
      { title: 'Gate vs class attendance', href: '#' },
      { title: 'Troubleshooting QR scanners', href: '#' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    articles: [
      { title: 'Understanding school analytics', href: '/school/analytics' },
      { title: 'Exporting CSV reports', href: '#' },
      { title: 'Tracking attendance trends', href: '/school/analytics/attendance' },
      { title: 'Monitoring student performance', href: '/school/analytics/students' },
    ],
  },
];

export default function DocsPage() {
  return (
    <PageShell
      badge="Documentation"
      title="Akoma Edu documentation"
      subtitle="Complete guides for every role on the platform."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#17201D] uppercase tracking-wider mb-3">
              Contents
            </h3>
            <nav className="space-y-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-sm text-text-secondary hover:text-[#0B6B4F] transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-[#17201D] mb-4">
                {s.title}
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {s.articles.map((a) => (
                  <Link
                    key={a.title}
                    href={a.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-[#17201D] group-hover:text-[#0B6B4F]">
                      {a.title}
                    </span>
                    <span className="text-xs text-text-secondary">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <PageCTA
        title="Can't find what you need?"
        subtitle="Our support team is here to help."
        primaryLabel="Contact Support"
        primaryHref="/contact"
        secondaryLabel="Visit Help Center"
        secondaryHref="/help"
      />
    </PageShell>
  );
}