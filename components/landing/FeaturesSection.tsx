'use client';

import { 
  School2, 
  Users, 
  ClipboardCheck, 
  QrCode, 
  BarChart3,
  Bell,
  Shield,
  GraduationCap
} from 'lucide-react';

const features = [
  {
    icon: School2,
    title: 'School Management',
    description: 'Complete school administration including students, teachers, classes, and parent communication.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
  {
    icon: GraduationCap,
    title: 'Curriculum & Learning',
    description: 'Aligned with Ghana\'s national curriculum. Track learning objectives, lessons, and student progress.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
  {
    icon: QrCode,
    title: 'Smart Attendance',
    description: 'QR-based student and staff attendance with real-time tracking and parent notifications.',
    color: 'text-[#E5A823]',
    bg: 'bg-[#E5A823]/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Assessments',
    description: 'Create quizzes, tests, and exams with automatic grading and detailed performance analytics.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
  {
    icon: Bell,
    title: 'Parent Notifications',
    description: 'Real-time alerts about attendance, performance, and school activities via SMS and email.',
    color: 'text-[#E5A823]',
    bg: 'bg-[#E5A823]/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Data-driven insights for teachers, school administrators, and government policymakers.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with role-based access control and data isolation between schools.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
  {
    icon: Users,
    title: 'Connected Ecosystem',
    description: 'Seamless communication between students, teachers, parents, and school administration.',
    color: 'text-[#0B6B4F]',
    bg: 'bg-[#0B6B4F]/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B6B4F]/10 text-[#0B6B4F] text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#17201D] mb-4">
            Everything You Need for <br />
            <span className="text-[#0B6B4F]">Modern Education</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Akoma Edu provides a complete digital infrastructure for schools, 
            from student management to advanced analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-background hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#0B6B4F]/10"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-[#17201D] mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}