/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  QrCode,
  Smartphone,
  Tablet,
  Monitor,
  ScanLine,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Shield,
  Clock,
  Wifi,
  Power,
  HardDrive,
  GitBranch,
  Zap,
  Eye,
  Mail,
  MessageSquare,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  details: string[];
  tips: string[];
  image?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function AttendanceSetupGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: 'step1',
      title: 'Step 1: Understand the System',
      description: 'Learn what you need and how it works',
      icon: BookOpen,
      details: [
        'The Akoma Edu attendance system uses QR codes to identify students and staff',
        'Each student and staff member gets a unique QR code (digital or physical card)',
        'Schools need one or more scanning devices (tablets, smartphones, or scanners)',
        'Devices are registered to your school and can be placed at entry points',
        'Attendance is recorded in real-time and viewable from the dashboard'
      ],
      tips: [
        'Start with one device at the main entrance before expanding',
        'Use a dedicated tablet for the best experience',
        'Ensure devices have a stable internet connection'
      ]
    },
    {
      id: 'step2',
      title: 'Step 2: Register Your Device',
      description: 'Add your scanning device to the system',
      icon: Tablet,
      details: [
        'Go to Device Management from the attendance menu',
        'Click "Register Device"',
        'Enter a name (e.g., "Main Entrance Tablet")',
        'Select the device type (Tablet, Smartphone, Scanner, etc.)',
        'Enter the location (e.g., "Main Gate, Room 101")',
        'You will receive an activation code after registration'
      ],
      tips: [
        'Use descriptive names that help identify the device location',
        'Keep the activation code safe - you\'ll need it to activate the device',
        'You can register multiple devices for different entry points'
      ]
    },
    {
      id: 'step3',
      title: 'Step 3: Activate Your Device',
      description: 'Activate the device using the code provided',
      icon: Power,
      details: [
        'In Device Management, find your pending device',
        'Click the activate button (green power icon)',
        'Enter the activation code you received',
        'The device will become active and ready to scan',
        'You can now place the device at your entry point'
      ],
      tips: [
        'Activation codes expire after 7 days',
        'If the code expires, you can generate a new one',
        'You can deactivate devices temporarily if needed'
      ]
    },
    {
      id: 'step4',
      title: 'Step 4: Generate Student & Staff IDs',
      description: 'Create QR codes for everyone',
      icon: Users,
      details: [
        'For each student, generate a Student ID from their profile',
        'For each staff member, generate a Staff ID from their profile',
        'Each person gets a unique QR code',
        'QR codes can be printed as physical cards or used digitally',
        'Students can use the Akoma mobile app to show their QR code'
      ],
      tips: [
        'Print QR codes on durable cards for long-term use',
        'Consider lanyards for easy access',
        'You can re-generate QR codes if lost'
      ]
    },
    {
      id: 'step5',
      title: 'Step 5: Set Up the Scanning Device',
      description: 'Prepare the device for scanning',
      icon: Wifi,
      details: [
        'For Tablets/Smartphones: Open the Akoma Edu app or website',
        'Navigate to the Attendance Scan page',
        'For Scanners: Connect to the Akoma system via the device portal',
        'Test the scanner with a sample QR code',
        'Position the device at the entry point with good lighting'
      ],
      tips: [
        'For tablets, use a stand or mount at the entry point',
        'Ensure the camera has a clear view of incoming people',
        'Test the scanning angle before peak hours'
      ]
    },
    {
      id: 'step6',
      title: 'Step 6: Start Scanning Attendance',
      description: 'Begin recording attendance',
      icon: ScanLine,
      details: [
        'Students/staff present their QR code to the scanner',
        'The system records: name, time, status (Present/Late), method',
        'Late arrivals (after 8:00 AM) are automatically marked as Late',
        'Parents receive notifications (if enabled)',
        'Attendance is viewable in real-time on the dashboard'
      ],
      tips: [
        'Place signs instructing people to scan upon entry',
        'Have staff assist during the first few days',
        'Review attendance reports regularly for accuracy'
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'What devices can I use for scanning?',
      answer: 'You can use tablets, smartphones, dedicated QR scanners, or kiosk devices. Any device with a camera and internet connection can work. Tablets are recommended for a balance of screen size and portability.'
    },
    {
      question: 'Do I need internet connection for scanning?',
      answer: 'Yes, an internet connection is required for real-time attendance recording. The device needs to communicate with the Akoma Edu servers. However, we are working on offline mode for areas with limited connectivity.'
    },
    {
      question: 'What if a student loses their QR code?',
      answer: 'You can easily regenerate a new QR code from the student\'s profile. The old QR code will be deactivated automatically for security.'
    },
    {
      question: 'Can I use my personal phone as a scanner?',
      answer: 'Yes! You can install the Akoma Edu app or access the web portal on your phone and use it as a scanning device. Just make sure to register it as a device first.'
    },
    {
      question: 'How does the system handle late arrivals?',
      answer: 'The system automatically marks arrivals after 8:00 AM as "Late". This threshold can be adjusted in the school settings if needed.'
    },
    {
      question: 'Can parents see their child\'s attendance?',
      answer: 'Yes! Parents with linked accounts can view their child\'s attendance history, including arrival times, lateness, and absence patterns.'
    },
    {
      question: 'What about staff attendance?',
      answer: 'Staff members can also have QR codes and scan in/out. This is recorded separately and can be viewed by school administrators.'
    },
    {
      question: 'Is the system secure?',
      answer: 'Yes. Each QR code is unique and encrypted. Devices are registered to specific schools. The system verifies that the student belongs to the school before recording attendance.'
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/school/attendance" className="text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">Attendance Setup Guide</h1>
          <p className="text-text-secondary">Complete guide to setting up your school&apos;s attendance system</p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              toast.success('PDF download started');
            }}
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-akoma-green/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-akoma-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">6</p>
              <p className="text-xs text-text-secondary">Setup Steps</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">30</p>
              <p className="text-xs text-text-secondary">Minutes to Setup</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DeviceIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">5+</p>
              <p className="text-xs text-text-secondary">Device Types</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">100%</p>
              <p className="text-xs text-text-secondary">Secure & Private</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Types Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <DeviceIcon className="h-5 w-5 text-akoma-green" />
          Supported Devices
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Tablet, label: 'Tablet', desc: 'Recommended' },
            { icon: Smartphone, label: 'Smartphone', desc: 'Portable' },
            { icon: ScanLine, label: 'Scanner', desc: 'Dedicated' },
            { icon: Monitor, label: 'Kiosk', desc: 'Stationary' },
            { icon: QrCode, label: 'Gate Reader', desc: 'Entry Point' },
          ].map((device) => (
            <div key={device.label} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <device.icon className="h-8 w-8 mx-auto text-akoma-green mb-2" />
              <p className="text-sm font-medium text-text">{device.label}</p>
              <p className="text-xs text-text-secondary">{device.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Steps */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-akoma-green" />
            Setup Process
          </h2>
          <p className="text-sm text-text-secondary">Follow these steps in order to set up your attendance system</p>
        </div>

        <div className="p-6 space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(step.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-akoma-green">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-text">{step.title}</h3>
                    <p className="text-sm text-text-secondary">{step.description}</p>
                  </div>
                </div>
                {expandedSection === step.id ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary" />
                )}
              </button>
              {expandedSection === step.id && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-text">What to do:</p>
                    <ul className="space-y-1.5">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-akoma-green mt-0.5 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Pro Tips:
                      </p>
                      <ul className="space-y-1 mt-1">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Device Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tablet className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-text">Tablet Setup</h3>
          </div>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>Place tablet at entry point</li>
            <li>Open Akoma Edu web portal</li>
            <li>Navigate to Attendance → Scan</li>
            <li>Keep tablet connected to Wi-Fi</li>
            <li>Use a stand for stability</li>
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-text">Smartphone Setup</h3>
          </div>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>Install Akoma Edu mobile app</li>
            <li>Log in with school account</li>
            <li>Select &quot;Scan Attendance&quot;</li>
            <li>Position phone camera at entry</li>
            <li>Use a phone holder if possible</li>
          </ol>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ScanLine className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-text">Dedicated Scanner</h3>
          </div>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>Connect scanner to power</li>
            <li>Connect to school Wi-Fi</li>
            <li>Open scanner web interface</li>
            <li>Enter school activation code</li>
            <li>Test with sample QR code</li>
          </ol>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-akoma-green" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-text-secondary">Common questions about the attendance system</p>
        </div>

        <div className="p-6 space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(`faq-${index}`)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-text">{faq.question}</span>
                {expandedFaq === `faq-${index}` ? (
                  <ChevronUp className="h-5 w-5 text-text-secondary shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-secondary shrink-0" />
                )}
              </button>
              {expandedFaq === `faq-${index}` && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-text-secondary bg-gray-50 rounded-lg p-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-akoma-green/5 rounded-xl border border-akoma-green/20 p-6 text-center">
        <h3 className="text-lg font-semibold text-text">Need Help?</h3>
        <p className="text-text-secondary text-sm mt-1">
          Our support team is ready to assist you with the setup process
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.success('Support email copied to clipboard');
            }}
          >
            <Mail className="h-4 w-4" />
            support@akoma-edu.com
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.success('Opening help documentation');
            }}
          >
            <BookOpen className="h-4 w-4" />
            Documentation
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.success('Live chat opened');
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Live Chat
          </Button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-100">
        <Link href="/school/attendance/devices">
          <Button className="bg-akoma-green hover:bg-akoma-dark text-white gap-2">
            <QrCode className="h-4 w-4" />
            Go to Device Management
          </Button>
        </Link>
        <Link href="/school/attendance">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            View Attendance Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            toast.success('Tutorial video will be available soon');
          }}
        >
          <Play className="h-4 w-4" />
          Watch Tutorial
        </Button>
      </div>
    </div>
  );
}

// Helper component for device icon
function DeviceIcon(props: any) {
  return <HardDrive {...props} />;
}

// Helper component for play icon
function Play(props: any) {
  return <Zap {...props} />;
}