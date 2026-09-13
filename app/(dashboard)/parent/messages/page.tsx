'use client';

import { MessageSquare } from 'lucide-react';

export default function ParentMessagesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
        <MessageSquare className="h-16 w-16 text-akoma-green mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Messages Coming Soon</h1>
        <p className="text-text-secondary">
          Direct messaging with teachers and school administrators is under development.
        </p>
      </div>
    </div>
  );
}