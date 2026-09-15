// app/(public)/contact/page.tsx
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/public/PageShell';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    // TODO: wire up to a real contact endpoint later
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <PageShell
      badge="Contact"
      title="Get in touch"
      subtitle="We respond to every message within 1 business day."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
              <Mail className="h-5 w-5 text-[#0B6B4F]" />
            </div>
            <h3 className="font-semibold text-[#17201D] mb-1">Email</h3>
            <a
              href="mailto:hello@akoma-edu.com"
              className="text-sm text-[#0B6B4F] hover:underline"
            >
              hello@akoma-edu.com
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
              <Phone className="h-5 w-5 text-[#0B6B4F]" />
            </div>
            <h3 className="font-semibold text-[#17201D] mb-1">Phone</h3>
            <a
              href="tel:+233501234567"
              className="text-sm text-[#0B6B4F] hover:underline"
            >
              +233 50 123 4567
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-[#0B6B4F]" />
            </div>
            <h3 className="font-semibold text-[#17201D] mb-1">Office</h3>
            <p className="text-sm text-text-secondary">
              Airport City, Accra
              <br />
              Greater Accra, Ghana
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-[#17201D] mb-2">
                Message sent!
              </h2>
              <p className="text-text-secondary mb-6">
                Thanks for reaching out. We&apos;ll reply to {form.email} within 1 business day.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', subject: '', message: '' });
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#17201D] mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#17201D] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#17201D] mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is this about?"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#17201D] mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  maxLength={1000}
                  placeholder="Tell us how we can help..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0B6B4F] focus:border-transparent outline-none text-sm resize-none"
                />
                <p className="text-xs text-text-secondary mt-1 text-right">
                  {form.message.length}/1000
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0B6B4F] hover:bg-[#0B6B4F]/90 text-white py-5 rounded-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}