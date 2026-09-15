// app/(public)/privacy/page.tsx
'use client';

import { PageShell } from '@/components/public/PageShell';

export default function PrivacyPage() {
  return (
    <PageShell
      badge="Legal"
      title="Privacy Policy"
      subtitle="Last updated: 1 September 2026"
    >
      <div className="prose prose-sm max-w-none bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="space-y-6 text-sm text-text leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              1. Introduction
            </h2>
            <p>
              Akoma Edu (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)
              operates a digital education infrastructure platform in Ghana. This
              Privacy Policy explains how we collect, use, store, and protect
              personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              2. Information We Collect
            </h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>
                <strong>User accounts:</strong> name, email, phone, role, and
                authentication credentials
              </li>
              <li>
                <strong>Student records:</strong> name, date of birth, gender,
                admission number, class, and academic progress
              </li>
              <li>
                <strong>Teacher records:</strong> professional qualifications,
                GES number, subject specializations, and employment data
              </li>
              <li>
                <strong>Parent records:</strong> contact details, relationship
                to student, and communication preferences
              </li>
              <li>
                <strong>Attendance data:</strong> QR scan timestamps, class
                confirmations, and attendance statuses
              </li>
              <li>
                <strong>Assessment data:</strong> questions, answers, scores,
                and feedback
              </li>
              <li>
                <strong>Usage data:</strong> log files, IP addresses, browser
                information, and access patterns
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              3. How We Use Information
            </h2>
            <p className="mb-2">We use information to:</p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>Provide and operate the Akoma Edu platform</li>
              <li>Deliver educational content and assessments</li>
              <li>Track attendance and generate reports</li>
              <li>Communicate with schools, teachers, parents, and students</li>
              <li>Improve the platform and develop new features</li>
              <li>Comply with legal obligations under Ghanaian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              4. Legal Basis for Processing
            </h2>
            <p>
              We process personal data on the basis of: (a) contract
              performance for account holders, (b) legitimate interests for
              improving the platform and preventing fraud, (c) consent where
              required, and (d) legal obligation under the Data Protection Act
              2012 (Act 843) of Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              5. Data Sharing
            </h2>
            <p className="mb-2">
              We do <strong>not</strong> sell personal data. We may share data
              with:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>
                <strong>Your school:</strong> school administrators see data
                about their students, teachers, and parents
              </li>
              <li>
                <strong>Government bodies:</strong> aggregated, anonymized
                data may be shared with GES and the Ministry of Education for
                national planning
              </li>
              <li>
                <strong>Service providers:</strong> cloud hosting, email, SMS,
                and file storage providers who process data on our behalf
              </li>
              <li>
                <strong>Legal authorities:</strong> when required by law
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              6. Data Security
            </h2>
            <p>
              We implement industry-standard safeguards: encryption in transit
              (HTTPS/TLS), password hashing (bcrypt), role-based access
              control, JWT-based authentication, regular security audits, and
              secure cloud infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              7. Data Retention
            </h2>
            <p>
              We retain personal data for as long as your account is active or
              as needed to provide services. Student academic records are
              retained for the duration required by Ghanaian education
              regulations. When no longer needed, data is deleted or
              anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              8. Your Rights
            </h2>
            <p className="mb-2">Under Ghana&apos;s Data Protection Act, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with the Data Protection Commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Student accounts are created and managed by schools and parents.
              We do not knowingly collect data directly from children under 13
              without parental consent. Schools are responsible for obtaining
              appropriate consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated via email or in-app notification.
              Continued use of the platform constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              11. Contact Us
            </h2>
            <p>
              Questions about this Privacy Policy? Email{' '}
              <a
                href="mailto:privacy@akoma-edu.com"
                className="text-[#0B6B4F] hover:underline"
              >
                privacy@akoma-edu.com
              </a>{' '}
              or write to us at Airport City, Accra, Greater Accra, Ghana.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}