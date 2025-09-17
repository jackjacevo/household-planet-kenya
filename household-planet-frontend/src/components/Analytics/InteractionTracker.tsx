'use client'

import { useEffect, useRef } from 'react'
import { analytics } from '@/lib/analytics'

export function InteractionTracker() {
  const startTime = useRef(Date.now())

  useEffect(() => {
    // Track outbound links
    const handleOutboundClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.href && !target.href.includes(window.location.hostname)) {
        analytics.customEvent('outbound_click', {
          url: target.href,
          text: target.textContent
        })
      }
    }

    // Track file downloads
    const handleDownload = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.href) {
        const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar']
        const hasFileExtension = fileExtensions.some(ext => target.href.toLowerCase().includes(ext))
        
        if (hasFileExtension) {
          analytics.customEvent('file_download', {
            file_url: target.href,
            file_name: target.download || target.textContent
          })
        }
      }
    }

    // Track form submissions
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement
      const formName = form.name || form.id || 'unnamed_form'
      
      analytics.customEvent('form_submit', {
        form_name: formName,
        form_action: form.action
      })
    }

    // Track phone clicks
    const handlePhoneClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.href.startsWith('tel:')) {
        analytics.customEvent('phone_call', {
          phone_number: target.href.replace('tel:', '')
        })
      }
    }

    // Track WhatsApp clicks
    const handleWhatsAppClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-whatsapp]')) {
        analytics.customEvent('whatsapp_click', {
          source: target.closest('[data-whatsapp]')?.getAttribute('data-whatsapp') || 'unknown'
        })
      }
    }

    // Track time on page
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000)
      analytics.customEvent('time_on_page', {
        duration: timeOnPage,
        page_path: window.location.pathname
      })
    }

    document.addEventListener('click', handleOutboundClick)
    document.addEventListener('click', handleDownload)
    document.addEventListener('click', handlePhoneClick)
    document.addEventListener('click', handleWhatsAppClick)
    document.addEventListener('submit', handleFormSubmit)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleOutboundClick)
      document.removeEventListener('click', handleDownload)
      document.removeEventListener('click', handlePhoneClick)
      document.removeEventListener('click', handleWhatsAppClick)
      document.removeEventListener('submit', handleFormSubmit)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
