// app/(public)/careers/page.tsx
'use client';

import Link from 'next/link';
import { MapPin, Briefcase, ArrowRight, Heart } from 'lucide-react';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const openings = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Accra, Ghana (Hybrid)',
    type: 'Full-time',
    description:
      'Design and scale the APIs powering thousands of schools across Ghana.',
  },
  {
    title: 'Frontend Engineer (Next.js)',
    department: 'Engineering',
    location: 'Remote (Ghana)',
    type: 'Full-time',
    description:
      'Build delightful experiences for students, teachers, and parents.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Accra, Ghana (Hybrid)',
    type: 'Full-time',
    description:
      'Shape how millions of Ghanaians experience education technology.',
  },
  {
    title: 'School Success Manager',
    department: 'Customer Success',
    location: 'Kumasi, Ghana',
    type: 'Full-time',
    description:
      'Onboard schools, train teachers, and ensure every school thrives.',
  },
  {
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Accra, Ghana',
    type: 'Full-time',
    description:
      'Turn raw education data into insights for schools and government.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote (Ghana)',
    type: 'Full-time',
    description:
      'Keep our platform reliable, secure, and fast for every user.',
  },
];

const values = [
  {
    title: 'Education first',
    description:
      'Every decision we make starts with one question: will this improve learning outcomes for Ghanaian students?',
  },
  {
    title: 'Build for scale',
    description:
      'We design for millions of users from day one — no shortcuts that break under pressure.',
  },
  {
    title: 'Ghana-rooted',
    description:
      'We\'re built by Ghanaians, for Ghana. Local context drives every product decision.',
  },
  {
    title: 'Move fast, stay humble',
    description:
      'We ship quickly, learn from feedback, and never stop improving.',
  },
];

export default function CareersPage() {
  return (
    <PageShell
      badge="Careers"
      title="Build the future of education in Ghana"
      subtitle="Join a team that's transforming how millions of students learn."
    >
      {/* Values */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-[#17201D] mb-6">
          Our values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
                <Heart className="h-5 w-5 text-[#0B6B4F]" />
              </div>
              <h3 className="font-semibold text-[#17201D] mb-2">{v.title}</h3>
              <p className="text-sm text-text-secondary">{v.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Openings */}
      <div>
        <h2 className="text-xl font-semibold text-[#17201D] mb-6">
          Open positions ({openings.length})
        </h2>
        <div className="space-y-3">
          {openings.map((job) => (
            <div
              key={job.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#17201D] group-hover:text-[#0B6B4F] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      {job.type}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/careers/${job.title
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  className="shrink-0"
                >
                  <span className="inline-flex items-center gap-1 text-sm text-[#0B6B4F] font-medium hover:gap-2 transition-all">
                    Apply
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageCTA
        title="Don't see your role?"
        subtitle="We're always looking for talented people. Send us your CV."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="Read Blog"
        secondaryHref="/blog"
      />
    </PageShell>
  );
}