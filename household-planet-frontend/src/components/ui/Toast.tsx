'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const variantStyles = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  destructive: 'bg-red-50 border-red-200 text-red-900'
}

const variantIcons = {
  default: AlertCircle,
  success: CheckCircle,
  destructive: XCircle
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = variantIcons[toast.variant || 'default']

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className={`
      relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
      animate-in slide-in-from-right-full duration-300
      ${variantStyles[toast.variant || 'default']}
    `}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-medium text-sm">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90 mt-1">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToasterProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}