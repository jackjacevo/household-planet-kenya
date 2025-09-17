'use client';

import { AlertTriangle, Info, Clock } from 'lucide-react';

interface Notice {
  type: 'warning' | 'info';
  message: string;
}

interface ExpiryNoticeProps {
  notices: Notice[];
  className?: string;
}

export function ExpiryNotice({ notices, className = '' }: ExpiryNoticeProps) {
  if (!notices || notices.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {notices.map((notice, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            notice.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {notice.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Info className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      ))}
    </div>
  );
}

export function ItemExpiryBadge({ expiresIn }: { expiresIn: number }) {
  return null;
}
