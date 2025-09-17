import { z } from 'zod'

// Kenyan phone number validation regex
export const KENYAN_PHONE_REGEX = /^(\+254|254|07|7)[0-9]{8,9}$/

// Shared phone validation schema
export const phoneSchema = z.string()
  .min(9, 'Phone number must be at least 9 digits')
  .regex(KENYAN_PHONE_REGEX, 'Please enter a valid Kenyan phone number (e.g., +254700123456, 0700123456, 254700123456, or 700123456)')

// Optional phone validation
export const optionalPhoneSchema = z.string()
  .optional()
  .refine((val) => !val || KENYAN_PHONE_REGEX.test(val), {
    message: 'Please enter a valid Kenyan phone number (e.g., +254700123456, 0700123456, 254700123456, or 700123456)'
  })

// Validation helper function
export const validateKenyanPhone = (phone: string): boolean => {
  return KENYAN_PHONE_REGEX.test(phone)
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (digits.startsWith('254')) {
    return `+${digits}`
  } else if (digits.startsWith('0')) {
    return `+254${digits.slice(1)}`
  } else if (digits.length === 9) {
    return `+254${digits}`
  }
  
  return phone
}
