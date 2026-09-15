// components/public/PageShell.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageShell({
  badge,
  title,
  subtitle,
  children,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
        <div className="container relative px-4 py-16 mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-[#0B6B4F] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="max-w-3xl">
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-xs font-medium mb-4">
                {badge}
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-[#17201D] mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-4xl">
          {children}
        </div>
      </section>
    </div>
  );
}

export function PageCTA({
  title = 'Ready to transform your school?',
  subtitle = 'Join hundreds of Ghanaian schools using Akoma Edu.',
  primaryLabel = 'Get Started',
  primaryHref = '/apply/school',
  secondaryLabel = 'Browse Schools',
  secondaryHref = '/schools',
}: {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mt-16 bg-[#0B6B4F] rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="relative">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={primaryHref}>
            <Button className="bg-akoma-gold hover:bg-akoma-gold/90 text-white px-6 py-5 rounded-full w-full sm:w-auto">
              {primaryLabel}
            </Button>
          </Link>
          <Link href={secondaryHref}>
            <Button
              variant="outline"
              className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white px-6 py-5 rounded-full w-full sm:w-auto"
            >
              {secondaryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}