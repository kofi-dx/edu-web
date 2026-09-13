/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef } from 'react';
import {
  Printer,
  QrCode,
  CreditCard,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  admissionNumber: string;
  enrollmentStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
  studentId?: {
    id: string;
    cardNumber: string;
    qrToken: string;
    qrCode: string;
    status: string;
    expiresAt?: string | null;
  };
}

interface PrintIDCardModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintIDCardModal({ student, isOpen, onClose }: PrintIDCardModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Student ID Card - ${student.user.firstName} ${student.user.lastName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: #f0f2f5;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                .id-card {
                  width: 400px;
                  background: white;
                  border-radius: 16px;
                  padding: 24px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                  border: 1px solid #e5e7eb;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #1a73e8; 
                  padding-bottom: 12px; 
                  margin-bottom: 16px;
                }
                .header h1 { 
                  margin: 0; 
                  font-size: 18px; 
                  color: #1a73e8; 
                }
                .header p { 
                  margin: 4px 0 0; 
                  font-size: 12px; 
                  color: #6b7280; 
                }
                .qr-section { 
                  display: flex; 
                  justify-content: center; 
                  margin: 16px 0; 
                }
                .qr-section img { 
                  width: 180px; 
                  height: 180px; 
                  border: 2px dashed #d1d5db; 
                  border-radius: 12px; 
                  padding: 8px; 
                }
                .details { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 8px 16px; 
                  margin: 12px 0; 
                  font-size: 13px;
                }
                .details .label { 
                  color: #6b7280; 
                  font-weight: 500; 
                }
                .details .value { 
                  color: #1f2937; 
                  font-weight: 600; 
                }
                .footer { 
                  text-align: center; 
                  border-top: 2px solid #e5e7eb; 
                  padding-top: 12px; 
                  margin-top: 12px; 
                  font-size: 11px; 
                  color: #9ca3af; 
                }
                @media print {
                  body { background: white; padding: 0; }
                  .id-card { box-shadow: none; border: 1px solid #ddd; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="id-card">
                ${printContent}
              </div>
              <script>
                window.onload = function() { window.print(); }
              <\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Printer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text">Student ID Card</h3>
              <p className="text-sm text-text-secondary">
                Review and print ID card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ID Card Preview */}
        <div className="bg-gray-50 rounded-xl p-6 mb-4" ref={printRef}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-akoma-green to-akoma-dark p-4 text-white text-center">
              <h2 className="text-xl font-bold">AKOMA EDU</h2>
              <p className="text-sm opacity-80">Student Identification Card</p>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-akoma-green/10 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-akoma-green">
                    {student.user.firstName?.[0]}{student.user.lastName?.[0] || ''}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text">
                    {student.user.firstName} {student.user.lastName}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {student.class?.name || 'Not Assigned'}
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-text-secondary" />
                      <span className="text-text-secondary">Admission:</span>
                      <span className="font-medium text-text">{student.admissionNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                      <span className="text-text-secondary">Status:</span>
                      <span className={`font-medium ${student.enrollmentStatus === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {student.enrollmentStatus || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                {student.studentId?.qrCode ? (
                  <img
                    src={student.studentId.qrCode}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-xs text-text-secondary">Card Number: {student.studentId?.cardNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
              <p className="text-xs text-text-secondary">
                Valid until: {student.studentId?.expiresAt ? new Date(student.studentId.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print ID Card
          </Button>
        </div>
      </div>
    </div>
  );
}