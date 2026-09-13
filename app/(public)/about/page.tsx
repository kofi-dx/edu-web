'use client';

import Link from 'next/link';
import { 
  GraduationCap, 
  Users, 
  Heart, 
  Target, 
  Eye,
  ArrowRight,
  CheckCircle,
  BookOpen,
  QrCode,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: GraduationCap,
    title: 'Education for All',
    description: 'Every child in Ghana deserves access to quality education. We\'re building the infrastructure to make it happen.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We believe in the power of community. Students, parents, teachers, and schools working together.',
  },
  {
    icon: Heart,
    title: 'Ghanaian Roots',
    description: 'Built in Ghana, for Ghana. We understand the unique challenges and opportunities of Ghanaian education.',
  },
  {
    icon: Target,
    title: 'Impact Driven',
    description: 'We measure success by the impact we make on students, teachers, and communities across Ghana.',
  },
];

const team = [
  {
    name: 'Dr. Kwame Nkrumah',
    role: 'Founder & CEO',
    bio: 'Education technology leader with 15+ years of experience in Ghanaian education.',
    image: '/team-1.jpg',
  },
  {
    name: 'Ama Mensah',
    role: 'Head of Product',
    bio: 'Former teacher and curriculum designer passionate about edtech innovation.',
    image: '/team-2.jpg',
  },
  {
    name: 'Kofi Asare',
    role: 'Lead Engineer',
    bio: 'Full-stack developer with expertise in scalable education platforms.',
    image: '/team-3.jpg',
  },
  {
    name: 'Dr. Abena Osei',
    role: 'Education Advisor',
    bio: 'Former GES official with deep understanding of Ghana\'s education system.',
    image: '/team-4.jpg',
  },
];

const stats = [
  { label: 'Schools', value: '10+', icon: GraduationCap },
  { label: 'Students', value: '1,000+', icon: Users },
  { label: 'Teachers', value: '50+', icon: BookOpen },
  { label: 'Attendance Rate', value: '90%+', icon: QrCode },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-linear-to-br from-[#0B6B4F]/5 via-transparent to-akoma-gold/5" />
        <div className="container relative px-4 py-20 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium mb-4">
              About Akoma Edu
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#17201D] mb-6">
              Building the Future of <br />
              <span className="text-[#0B6B4F]">Education in Ghana</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Akoma Edu is a digital education infrastructure connecting students, 
              parents, teachers, schools, and government across Ghana.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-[#0B6B4F]" />
              </div>
              <h2 className="text-2xl font-bold text-[#17201D] mb-3">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed">
                To build a comprehensive digital education infrastructure for Ghana 
                that empowers every student, teacher, parent, and school to achieve 
                their full potential through technology.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-akoma-gold/10 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-akoma-gold" />
              </div>
              <h2 className="text-2xl font-bold text-[#17201D] mb-3">Our Vision</h2>
              <p className="text-text-secondary leading-relaxed">
                A Ghana where every student has access to quality education, every 
                teacher has the tools to succeed, and every school can operate 
                efficiently in the digital age.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-[#0B6B4F]" />
                </div>
                <p className="text-3xl font-bold text-[#0B6B4F]">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#17201D] mb-4">Our Core Values</h2>
            <p className="text-text-secondary">
              The principles that guide everything we do at Akoma Edu.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B6B4F]/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-[#0B6B4F]" />
                </div>
                <h3 className="text-lg font-semibold text-[#17201D] mb-2">{value.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Akoma Edu */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium mb-4">
                Why Akoma Edu?
              </div>
              <h2 className="text-3xl font-bold text-[#17201D] mb-6">
                Built for Ghana&apos;s <br />
                <span className="text-[#0B6B4F]">Education Needs</span>
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                Akoma Edu is designed specifically for the Ghanaian education system, 
                with a deep understanding of local challenges and opportunities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#0B6B4F] shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[#17201D]">Offline Capable</p>
                    <p className="text-sm text-text-secondary">Works even with limited internet connectivity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#0B6B4F] shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[#17201D]">Curriculum Aligned</p>
                    <p className="text-sm text-text-secondary">Fully aligned with Ghana&apos;s national curriculum</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#0B6B4F] shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[#17201D]">Multi-Tenant Platform</p>
                    <p className="text-sm text-text-secondary">One platform serving all schools with data isolation</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-2xl p-6 border border-gray-100">
                <GraduationCap className="h-8 w-8 text-[#0B6B4F] mb-3" />
                <h4 className="font-semibold text-[#17201D]">Students</h4>
                <p className="text-sm text-text-secondary">Personalized learning and progress tracking</p>
              </div>
              <div className="bg-background rounded-2xl p-6 border border-gray-100">
                <Users className="h-8 w-8 text-[#0B6B4F] mb-3" />
                <h4 className="font-semibold text-[#17201D]">Teachers</h4>
                <p className="text-sm text-text-secondary">Tools to teach effectively and track progress</p>
              </div>
              <div className="bg-background rounded-2xl p-6 border border-gray-100">
                <Heart className="h-8 w-8 text-[#0B6B4F] mb-3" />
                <h4 className="font-semibold text-[#17201D]">Parents</h4>
                <p className="text-sm text-text-secondary">Real-time visibility into their child&apos;s progress</p>
              </div>
              <div className="bg-background rounded-2xl p-6 border border-gray-100">
                <Building2 className="h-8 w-8 text-[#0B6B4F] mb-3" />
                <h4 className="font-semibold text-[#17201D]">Schools</h4>
                <p className="text-sm text-text-secondary">Complete school management and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#17201D] mb-4">The Team</h2>
            <p className="text-text-secondary">
              Dedicated professionals working to transform education in Ghana.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#0B6B4F]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#0B6B4F]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-[#17201D]">{member.name}</h3>
                <p className="text-sm text-[#0B6B4F] font-medium mb-2">{member.role}</p>
                <p className="text-sm text-text-secondary">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B6B4F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-akoma-gold/10 rounded-full blur-3xl" />
        <div className="container relative px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Akoma Edu Community
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Be part of the movement to transform education in Ghana.
          </p>
          <Link href="/apply/school">
            <Button className="bg-akoma-gold hover:bg-akoma-gold/90 text-white px-8 py-6 text-base rounded-full group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}