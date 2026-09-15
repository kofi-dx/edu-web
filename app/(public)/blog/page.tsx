// app/(public)/blog/page.tsx
'use client';

import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const posts = [
  {
    id: 'welcome',
    title: 'Introducing Akoma Edu: Ghana\'s Digital Education Infrastructure',
    excerpt:
      'Today we\'re launching Akoma Edu — a platform built to connect every student, teacher, parent, and school across Ghana.',
    category: 'Announcement',
    date: '2026-01-15',
    readTime: '5 min read',
  },
  {
    id: 'qr-attendance',
    title: 'How QR attendance is changing Ghanaian classrooms',
    excerpt:
      'Manual attendance takes 10 minutes per class. QR scanning cuts it to 30 seconds — and gives real-time data to schools.',
    category: 'Product',
    date: '2026-02-10',
    readTime: '7 min read',
  },
  {
    id: 'digital-curriculum',
    title: 'Bringing the NaCCA curriculum to every classroom',
    excerpt:
      'Our 10-layer curriculum knowledge base maps every lesson to national standards — automatically tracking student progress.',
    category: 'Education',
    date: '2026-03-05',
    readTime: '6 min read',
  },
  {
    id: 'parent-engagement',
    title: 'Why parent engagement matters (and how we make it easy)',
    excerpt:
      'Research shows parental involvement improves outcomes. Our parent dashboard gives real-time visibility without extra effort.',
    category: 'Education',
    date: '2026-04-20',
    readTime: '8 min read',
  },
  {
    id: 'government-analytics',
    title: 'From Accra to Tamale: national education analytics in real time',
    excerpt:
      'For the first time, Ghana can see live data on every region, district, and school — enabling faster, better decisions.',
    category: 'Government',
    date: '2026-05-12',
    readTime: '6 min read',
  },
  {
    id: 'school-case-study',
    title: 'Case study: How Kwame Nkrumah Basic School digitized in 2 weeks',
    excerpt:
      'From paper registers to QR attendance and digital assessments — a real story of transformation.',
    category: 'Case Study',
    date: '2026-06-01',
    readTime: '10 min read',
  },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <PageShell
      badge="Blog"
      title="Stories from Ghana's classrooms"
      subtitle="Insights, updates, and lessons from schools using Akoma Edu."
    >
      {/* Featured post */}
      <Link
        href={`/blog/${featured.id}`}
        className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden group mb-10"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-xs font-medium">
              {featured.category}
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(featured.date)}
            </span>
            <span className="text-xs text-text-secondary">
              {featured.readTime}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#17201D] group-hover:text-[#0B6B4F] transition-colors mb-3">
            {featured.title}
          </h2>
          <p className="text-text-secondary mb-4">{featured.excerpt}</p>
          <span className="inline-flex items-center gap-1 text-[#0B6B4F] font-medium text-sm group-hover:gap-2 transition-all">
            Read article
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rest.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-6 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-xs font-medium">
                {post.category}
              </span>
              <span className="text-xs text-text-secondary">
                {formatDate(post.date)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#17201D] group-hover:text-[#0B6B4F] transition-colors mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-3 mb-4">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{post.readTime}</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state hint */}
      {posts.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No blog posts yet. Check back soon!</p>
        </div>
      )}

      <PageCTA
        title="Want to share your school's story?"
        subtitle="We'd love to feature your journey on the Akoma Edu blog."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
        secondaryLabel="Read More"
        secondaryHref="/faq"
      />
    </PageShell>
  );
}