/**
 * Enhanced Confirmation Modal Component
 * Replaces browser confirm dialogs with customizable, accessible modals
 * Feature-flagged for safe rollout
 */

'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Info, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Confirmation types with visual styling
export enum ConfirmationType {
  DELETE = 'delete',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  QUESTION = 'question'
}

// Modal configuration interface
export interface ConfirmationConfig {
  type: ConfirmationType;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  isDangerous?: boolean;
  showIcon?: boolean;
  details?: string | ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Visual configuration for each type
const typeConfig = {
  [ConfirmationType.DELETE]: {
    icon: XCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    confirmVariant: 'destructive' as const,
    confirmLabel: 'Delete',
    title: 'Confirm Deletion'
  },
  [ConfirmationType.WARNING]: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    confirmVariant: 'default' as const,
    confirmLabel: 'Proceed',
    title: 'Warning'
  },
  [ConfirmationType.INFO]: {
    icon: Info,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    confirmVariant: 'default' as const,
    confirmLabel: 'OK',
    title: 'Information'
  },
  [ConfirmationType.SUCCESS]: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    confirmVariant: 'default' as const,
    confirmLabel: 'Continue',
    title: 'Success'
  },
  [ConfirmationType.ERROR]: {
    icon: XCircle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    confirmVariant: 'destructive' as const,
    confirmLabel: 'Retry',
    title: 'Error'
  },
  [ConfirmationType.QUESTION]: {
    icon: HelpCircle,
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    confirmVariant: 'default' as const,
    confirmLabel: 'Yes',
    title: 'Confirmation'
  }
};

// Animation variants
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20
  }
};

interface ConfirmationModalProps {
  isOpen: boolean;
  config: ConfirmationConfig;
  loading?: boolean;
}

export function ConfirmationModal({ isOpen, config, loading = false }: ConfirmationModalProps) {
  const {
    type,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    confirmVariant,
    isDangerous = false,
    showIcon = true,
    details,
    onConfirm,
    onCancel
  } = config;

  const typeDefaults = typeConfig[type];
  const IconComponent = typeDefaults.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.2
              }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {showIcon && (
                    <div className={`p-2 rounded-full ${typeDefaults.bgColor} ${typeDefaults.borderColor} border`}>
                      <IconComponent className={`h-5 w-5 ${typeDefaults.iconColor}`} />
                    </div>
                  )}
                  <span>{title || typeDefaults.title}</span>
                </DialogTitle>

                {typeof message === 'string' ? (
                  <DialogDescription className="text-gray-600 leading-relaxed">
                    {message}
                  </DialogDescription>
                ) : (
                  <div className="text-gray-600 leading-relaxed">
                    {message}
                  </div>
                )}

                {details && (
                  <div className={`mt-3 p-3 rounded-lg ${typeDefaults.bgColor} ${typeDefaults.borderColor} border`}>
                    {typeof details === 'string' ? (
                      <p className="text-sm text-gray-700">{details}</p>
                    ) : (
                      <div className="text-sm text-gray-700">{details}</div>
                    )}
                  </div>
                )}
              </DialogHeader>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="min-w-[80px]"
                >
                  {cancelLabel}
                </Button>

                <Button
                  variant={confirmVariant || typeDefaults.confirmVariant}
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`min-w-[80px] ${
                    isDangerous ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    confirmLabel || typeDefaults.confirmLabel
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier confirmation modal usage
export function useConfirmationModal() {
  return {
    ConfirmationModal,
    ConfirmationType,

    // Helper methods for common confirmation types
    createDeleteConfirmation: (itemName: string, onConfirm: () => void | Promise<void>): ConfirmationConfig => ({
      type: ConfirmationType.DELETE,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      isDangerous: true,
      onConfirm
    }),

    createBulkDeleteConfirmation: (count: number, onConfirm: () => void | Promise<void>): ConfirmationConfig => ({
      type: ConfirmationType.DELETE,
      title: 'Confirm Bulk Deletion',
      message: `Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmLabel: `Delete ${count} items`,
      isDangerous: true,
      details: 'This will permanently remove all selected items from the system.',
      onConfirm
    }),

    createWarningConfirmation: (title: string, message: string, onConfirm: () => void | Promise<void>): ConfirmationConfig => ({
      type: ConfirmationType.WARNING,
      title,
      message,
      confirmLabel: 'Proceed',
      onConfirm
    }),

    createUnsavedChangesConfirmation: (onConfirm: () => void | Promise<void>): ConfirmationConfig => ({
      type: ConfirmationType.WARNING,
      title: 'Unsaved Changes',
      message: 'You have unsaved changes that will be lost if you continue. Are you sure you want to leave?',
      confirmLabel: 'Leave anyway',
      details: 'Any changes you made will not be saved.',
      onConfirm
    })
  };
}

// Backward compatibility function
export const showConfirmDialog = async (
  message: string,
  title: string = 'Confirmation',
  type: ConfirmationType = ConfirmationType.QUESTION
): Promise<boolean> => {
  return new Promise((resolve) => {
    // This would be implemented with a modal manager
    // For now, fallback to browser confirm
    resolve(window.confirm(`${title}\n\n${message}`));
  });
};

export default ConfirmationModal;