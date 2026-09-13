'use client';

import Link from 'next/link';
import { GraduationCap, Mail } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Schools', href: '/schools' },
    { label: 'FAQ', href: '/faq' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-text text-white/80">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white">
              <GraduationCap className="h-8 w-8 text-akoma-gold" />
              <span className="text-2xl font-bold">Akoma Edu</span>
            </Link>
            <p className="mt-4 text-sm max-w-sm">
              Ghana&apos;s digital education infrastructure connecting students, 
              parents, teachers, schools, and government.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-white transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <FaGithub className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-center">
          <p>© {new Date().getFullYear()} Akoma Edu. All rights reserved.</p>
          <p className="mt-1">Built with ❤️ for Ghana&apos;s education</p>
        </div>
      </div>
    </footer>
  );
}