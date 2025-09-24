/**
 * Confirmation Modal Context and Manager
 * Provides centralized confirmation modal management
 * Feature-flagged for safe rollout
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal, ConfirmationConfig, ConfirmationType } from '@/components/ui/ConfirmationModal';
import { adminConfig, isFeatureEnabled, debugLog, trackFeatureUsage } from '@/lib/config/admin-config';

// Modal state interface
interface ModalState {
  isOpen: boolean;
  config: ConfirmationConfig | null;
  loading: boolean;
}

// Context interface
interface ConfirmationContextType {
  showConfirmation: (config: ConfirmationConfig) => Promise<boolean>;
  showDeleteConfirmation: (itemName: string) => Promise<boolean>;
  showBulkDeleteConfirmation: (count: number, itemType?: string) => Promise<boolean>;
  showWarningConfirmation: (title: string, message: string) => Promise<boolean>;
  showUnsavedChangesConfirmation: () => Promise<boolean>;
  isModalOpen: boolean;
}

// Create context
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

// Provider component
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    config: null,
    loading: false
  });

  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  // Main confirmation function
  const showConfirmation = (config: ConfirmationConfig): Promise<boolean> => {
    // Check if new confirmation modals are enabled
    if (!isFeatureEnabled('newConfirmDialogs')) {
      debugLog('Using fallback browser confirm for:', config.title);
      trackFeatureUsage('fallback-browser-confirm', true, config.type);

      // Fallback to browser confirm
      const message = typeof config.message === 'string' ? config.message : config.title;
      return Promise.resolve(window.confirm(`${config.title}\n\n${message}`));
    }

    debugLog('Using new confirmation modal for:', config.title);
    trackFeatureUsage('new-confirmation-modal', true, config.type);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);

      // Wrap onConfirm to handle promise resolution
      const originalOnConfirm = config.onConfirm;
      const wrappedConfig: ConfirmationConfig = {
        ...config,
        onConfirm: async () => {
          setModalState(prev => ({ ...prev, loading: true }));

          try {
            await originalOnConfirm();
            closeModal(true);
          } catch (error) {
            console.error('Confirmation action failed:', error);
            setModalState(prev => ({ ...prev, loading: false }));
            // Don't close modal on error, let user retry
          }
        },
        onCancel: () => {
          closeModal(false);
        }
      };

      setModalState({
        isOpen: true,
        config: wrappedConfig,
        loading: false
      });
    });
  };

  // Close modal and resolve promise
  const closeModal = (result: boolean) => {
    setModalState({
      isOpen: false,
      config: null,
      loading: false
    });

    if (resolvePromise) {
      resolvePromise(result);
      setResolvePromise(null);
    }
  };

  // Helper methods for common confirmation types
  const showDeleteConfirmation = (itemName: string): Promise<boolean> => {
    return showConfirmation({
      type: ConfirmationType.DELETE,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${itemName}"?`,
      confirmLabel: 'Delete',
      isDangerous: true,
      details: 'This action cannot be undone.',
      onConfirm: async () => {
        // The actual delete action will be handled by the caller
        // This is just the confirmation
      }
    });
  };

  const showBulkDeleteConfirmation = (count: number, itemType = 'items'): Promise<boolean> => {
    return showConfirmation({
      type: ConfirmationType.DELETE,
      title: 'Confirm Bulk Deletion',
      message: `Are you sure you want to delete ${count} ${itemType}?`,
      confirmLabel: `Delete ${count} ${itemType}`,
      isDangerous: true,
      details: 'This action cannot be undone and will permanently remove all selected items.',
      onConfirm: async () => {
        // The actual delete action will be handled by the caller
      }
    });
  };

  const showWarningConfirmation = (title: string, message: string): Promise<boolean> => {
    return showConfirmation({
      type: ConfirmationType.WARNING,
      title,
      message,
      confirmLabel: 'Proceed',
      onConfirm: async () => {
        // Just confirm, action handled by caller
      }
    });
  };

  const showUnsavedChangesConfirmation = (): Promise<boolean> => {
    return showConfirmation({
      type: ConfirmationType.WARNING,
      title: 'Unsaved Changes',
      message: 'You have unsaved changes that will be lost if you continue.',
      confirmLabel: 'Leave anyway',
      details: 'Any changes you made will not be saved.',
      onConfirm: async () => {
        // Just confirm, navigation handled by caller
      }
    });
  };

  // Context value
  const contextValue: ConfirmationContextType = {
    showConfirmation,
    showDeleteConfirmation,
    showBulkDeleteConfirmation,
    showWarningConfirmation,
    showUnsavedChangesConfirmation,
    isModalOpen: modalState.isOpen
  };

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}

      {/* Render confirmation modal */}
      {modalState.config && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          config={modalState.config}
          loading={modalState.loading}
        />
      )}
    </ConfirmationContext.Provider>
  );
}

// Hook to use confirmation context
export function useConfirmation() {
  const context = useContext(ConfirmationContext);

  if (context === undefined) {
    // Provide fallback if context is not available
    debugLog('ConfirmationContext not available, using fallback');

    return {
      showConfirmation: async (config: ConfirmationConfig) => {
        const message = typeof config.message === 'string' ? config.message : config.title;
        return window.confirm(`${config.title}\n\n${message}`);
      },
      showDeleteConfirmation: async (itemName: string) => {
        return window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`);
      },
      showBulkDeleteConfirmation: async (count: number, itemType = 'items') => {
        return window.confirm(`Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`);
      },
      showWarningConfirmation: async (title: string, message: string) => {
        return window.confirm(`${title}\n\n${message}`);
      },
      showUnsavedChangesConfirmation: async () => {
        return window.confirm('You have unsaved changes that will be lost if you continue. Are you sure you want to leave?');
      },
      isModalOpen: false
    };
  }

  return context;
}

// Safe confirmation wrapper with automatic fallback
export function useSafeConfirmation() {
  try {
    return useConfirmation();
  } catch (error) {
    console.warn('Confirmation context failed, using browser confirm fallback:', error);

    // Ultra-safe fallback
    return {
      showConfirmation: async () => true,
      showDeleteConfirmation: async (itemName: string) => {
        return window.confirm(`Delete "${itemName}"?`);
      },
      showBulkDeleteConfirmation: async (count: number) => {
        return window.confirm(`Delete ${count} items?`);
      },
      showWarningConfirmation: async (title: string, message: string) => {
        return window.confirm(message);
      },
      showUnsavedChangesConfirmation: async () => {
        return window.confirm('Leave without saving?');
      },
      isModalOpen: false
    };
  }
}

export default ConfirmationProvider;