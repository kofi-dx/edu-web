// app/(public)/pricing/page.tsx
'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const plans = [
  {
    name: 'Public School',
    price: 'Free',
    period: 'forever',
    description: 'For government-funded schools across Ghana',
    features: [
      'Unlimited students & teachers',
      'Full curriculum access',
      'QR attendance system',
      'Assessment & grading',
      'Parent portal',
      'Government reporting',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/apply/school',
    highlighted: false,
  },
  {
    name: 'Private School',
    price: 'GH₵ 2,500',
    period: 'per year',
    description: 'For private schools & academies',
    features: [
      'Everything in Public School',
      'Custom school branding',
      'Priority support',
      'Advanced analytics',
      'Fee management (coming soon)',
      'Timetable system (coming soon)',
      'SMS notifications',
    ],
    cta: 'Start Free Trial',
    href: '/apply/school',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For school groups & districts',
    features: [
      'Everything in Private School',
      'Multi-school management',
      'District-level analytics',
      'Dedicated account manager',
      'Custom integrations',
      'On-site training',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <PageShell
      badge="Pricing"
      title="Simple pricing for every school"
      subtitle="Free for public schools. Affordable for private schools. Custom for enterprises."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-[#0B6B4F] bg-[#0B6B4F]/5 shadow-lg'
                : 'border-gray-200 bg-white'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0B6B4F] text-white text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </div>
            )}
            <h3 className="text-lg font-semibold text-[#17201D]">
              {plan.name}
            </h3>
            <p className="text-sm text-text-secondary mt-1 mb-4">
              {plan.description}
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#17201D]">
                {plan.price}
              </span>
              <span className="text-sm text-text-secondary ml-2">
                {plan.period}
              </span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-[#0B6B4F] shrink-0 mt-0.5" />
                  <span className="text-text">{f}</span>
                </li>
              ))}
            </ul>
            <Link href={plan.href}>
              <Button
                className={`w-full py-5 rounded-full ${
                  plan.highlighted
                    ? 'bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white'
                    : 'bg-white border border-gray-200 text-[#17201D] hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#17201D] mb-2">
          Frequently asked questions about pricing
        </h2>
        <p className="text-sm text-text-secondary">
          Have more questions? Visit our{' '}
          <Link href="/faq" className="text-[#0B6B4F] hover:underline">
            FAQ page
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-[#0B6B4F] hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>

      <PageCTA />
    </PageShell>
  );
}