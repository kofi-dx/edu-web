// app/(public)/faq/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageShell, PageCTA } from '@/components/public/PageShell';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I register my school on Akoma Edu?',
        a: 'Visit /apply/school, fill the application form with your school details, and submit. Our team reviews applications within 2-3 business days. Once approved, you\'ll receive login credentials for your school admin account.',
      },
      {
        q: 'Is Akoma Edu really free for public schools?',
        a: 'Yes. Government-funded schools can use Akoma Edu free of charge forever, funded by the Ministry of Education and GES partnership.',
      },
      {
        q: 'How long does onboarding take?',
        a: 'Most schools are fully set up within 1-2 weeks. Our support team guides you through importing students, adding teachers, setting up classes, and configuring attendance devices.',
      },
    ],
  },
  {
    category: 'For Teachers',
    questions: [
      {
        q: 'Can I create my own assessments?',
        a: 'Yes. Teachers can create assessments with 4 question types: multiple choice, true/false, fill-in-the-blank, and open-ended. Open-ended questions are graded manually; the rest are auto-graded.',
      },
      {
        q: 'How does attendance work?',
        a: 'Students scan a QR code at the school gate. Teachers then confirm who is actually in class. This gives you accurate attendance data without extra paperwork.',
      },
      {
        q: 'Can I track my students\' progress over time?',
        a: 'Yes. Teachers get per-student analytics showing assessment scores, subject-by-subject progress, and attendance trends.',
      },
    ],
  },
  {
    category: 'For Parents',
    questions: [
      {
        q: 'How do I apply for my child\'s admission?',
        a: 'Visit /schools, find your school, and click "Apply for Admission". Fill the form, submit it, and the school will review your application. You\'ll be notified by email when a decision is made.',
      },
      {
        q: 'How do I monitor my child\'s progress?',
        a: 'Once your child is enrolled, you get a parent account. Log in to see grades, attendance, assessment results, and learning progress — all in one place.',
      },
      {
        q: 'Can I link multiple children to my account?',
        a: 'Yes. You can link multiple children to a single parent account and switch between them easily.',
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'Does Akoma Edu work on mobile?',
        a: 'Yes. The entire platform is responsive and works on smartphones, tablets, and desktop computers.',
      },
      {
        q: 'What devices do I need for QR attendance?',
        a: 'Any Android tablet or smartphone with a camera and internet connection. We also support dedicated USB QR scanners connected to a computer.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use industry-standard encryption, JWT authentication, role-based access control, and follow Ghana\'s Data Protection Act. Student data is only visible to authorized users.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <PageShell
      badge="FAQ"
      title="Frequently asked questions"
      subtitle="Everything you need to know about Akoma Edu."
    >
      <div className="space-y-10">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-semibold text-[#17201D] mb-4">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item, idx) => {
                const key = `${section.category}-${idx}`;
                const isOpen = openIndex === key;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-[#17201D]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-text-secondary shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-text-secondary">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <PageCTA
        title="Still have questions?"
        subtitle="Our team is here to help you get started."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="Browse Schools"
        secondaryHref="/schools"
      />
    </PageShell>
  );
}