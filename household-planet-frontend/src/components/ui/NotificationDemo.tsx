'use client'

import { useToast } from '@/contexts/ToastContext'
import { Button } from './Button'

export function NotificationDemo() {
  const { showToast } = useToast()

  const showSuccess = () => {
    showToast({
      title: 'Success!',
      description: 'Your action was completed successfully.',
      variant: 'success'
    })
  }

  const showError = () => {
    showToast({
      title: 'Error occurred',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive'
    })
  }

  const showInfo = () => {
    showToast({
      title: 'Information',
      description: 'This is an informational message.',
      variant: 'info'
    })
  }

  return (
    <div className="flex gap-4 p-4">
      <Button onClick={showSuccess} variant="default">
        Show Success
      </Button>
      <Button onClick={showError} variant="destructive">
        Show Error
      </Button>
      <Button onClick={showInfo} variant="outline">
        Show Info
      </Button>
    </div>
  )
}
