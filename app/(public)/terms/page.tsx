// app/(public)/terms/page.tsx
'use client';

import { PageShell } from '@/components/public/PageShell';

export default function TermsPage() {
  return (
    <PageShell
      badge="Legal"
      title="Terms of Service"
      subtitle="Last updated: 1 September 2026"
    >
      <div className="prose prose-sm max-w-none bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="space-y-6 text-sm text-text leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Akoma Edu, you agree to these Terms of
              Service. If you do not agree, please do not use the platform.
              These terms apply to all users including schools, teachers,
              students, parents, and government administrators.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to create an account. Users
              under 18 require consent from a parent or guardian. School
              accounts are managed by authorized school administrators who are
              responsible for their users&apos; compliance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              3. Account Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>Provide accurate and up-to-date information</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of unauthorized access</li>
              <li>Do not share accounts between users</li>
              <li>Do not use the platform for unlawful purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              4. Acceptable Use
            </h2>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-1 text-text-secondary">
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
              <li>Interfere with the platform&apos;s operation</li>
              <li>Scrape, harvest, or collect user data</li>
              <li>Impersonate another person or entity</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              5. Intellectual Property
            </h2>
            <p>
              All content, software, designs, and trademarks on Akoma Edu are
              owned by us or our licensors. You may not copy, modify,
              distribute, or create derivative works without permission.
              Curriculum content may be subject to separate licenses from
              NaCCA or other rights holders.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              6. User Content
            </h2>
            <p>
              You retain ownership of content you create (assessments,
              lessons, feedback). By uploading, you grant us a license to host,
              display, and process that content to operate the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              7. Fees and Payment
            </h2>
            <p>
              Public schools may use Akoma Edu free of charge. Private schools
              pay fees as set out on our Pricing page. Fees are billed annually
              and are non-refundable except as required by law. We may change
              fees with 30 days&apos; notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              8. Availability and Support
            </h2>
            <p>
              We aim for 99.9% uptime but do not guarantee uninterrupted
              service. Scheduled maintenance will be communicated in advance
              where possible. Support is provided via email and the Help
              Center.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              9. Termination
            </h2>
            <p>
              We may suspend or terminate your account for violating these
              terms, illegal activity, or non-payment. You may terminate your
              account at any time by contacting your school administrator or
              support.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              10. Disclaimers
            </h2>
            <p>
              Akoma Edu is provided &quot;as is&quot; without warranties of any
              kind. We do not warrant that the platform will be error-free or
              that learning outcomes will improve. Educational results depend
              on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              11. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, we are not liable for
              indirect, incidental, or consequential damages arising from your
              use of the platform. Our total liability shall not exceed the
              fees you paid in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              12. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of Ghana.
              Any disputes shall be resolved in the courts of Accra, Ghana.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              13. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes
              will be communicated via email or in-app notification. Continued
              use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#17201D] mb-2">
              14. Contact
            </h2>
            <p>
              Questions about these Terms? Email{' '}
              <a
                href="mailto:legal@akoma-edu.com"
                className="text-[#0B6B4F] hover:underline"
              >
                legal@akoma-edu.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}