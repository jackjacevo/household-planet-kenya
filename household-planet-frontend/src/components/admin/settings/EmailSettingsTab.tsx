'use client';

import { Mail } from 'lucide-react';

interface EmailSettingsTabProps {
  settings: any;
  onSettingsChange: () => void;
}

export function EmailSettingsTab({ settings, onSettingsChange }: EmailSettingsTabProps) {
  return (
    <div className="text-center py-12">
      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Email Settings</h3>
      <p className="text-gray-500">Email configuration coming soon.</p>
    </div>
  );
}
