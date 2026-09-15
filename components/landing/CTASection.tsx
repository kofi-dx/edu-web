'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  const benefits = [
    'Free for government schools',
    'Affordable plans for private schools',
    'No long-term contracts',
    'Dedicated support team',
  ];

  return (
    <section className="py-24 bg-[#0B6B4F] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-akoma-gold/10 rounded-full blur-3xl" />

      <div className="container relative px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join schools across Ghana using Akoma Edu to improve attendance,
            track progress, and connect with parents.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-akoma-gold" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/school">
              <Button className="bg-akoma-gold hover:bg-akoma-gold/90 text-white px-8 py-6 text-base rounded-full group transition-all duration-300">
                Start Your School
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-base rounded-full"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}