'use client';

import { isFeatureEnabled } from '@/lib/config/admin-config';
import { trackFeatureUsage } from '@/lib/monitoring/feature-tracker';

interface SafeConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const SafeConfirmDialog: React.FC<SafeConfirmDialogProps> = ({
  message,
  onConfirm,
  onCancel
}) => {
  const handleConfirm = () => {
    try {
      if (isFeatureEnabled('newConfirmDialogs')) {
        // New dialog implementation
        trackFeatureUsage('new-confirm-dialog', true);
        onConfirm();
      } else {
        // Fallback to browser confirm
        if (window.confirm(message)) {
          onConfirm();
        } else if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      trackFeatureUsage('new-confirm-dialog', false, error instanceof Error ? error.message : 'Unknown error');
      // Emergency fallback
      if (window.confirm(message)) {
        onConfirm();
      }
    }
  };

  if (!isFeatureEnabled('newConfirmDialogs')) {
    return (
      <button onClick={handleConfirm} className="btn-danger">
        Delete
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <p className="mb-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="btn-danger">Confirm</button>
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};