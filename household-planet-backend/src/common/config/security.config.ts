export const SecurityConfig = {
  // File upload security
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    uploadPath: './uploads',
    secureUploadPath: './secure-uploads'
  },

  // Query parameter limits
  query: {
    maxSearchLength: 100,
    maxPageSize: 100,
    maxStringLength: 255
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    uploadMax: 10 // limit file uploads to 10 per windowMs
  },

  // Input validation patterns
  validation: {
    filename: /^[a-zA-Z0-9._-]+$/,
    slug: /^[a-z0-9-]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]+$/
  },

  // Blocked patterns for security
  blockedPatterns: {
    noSqlInjection: [
      /\$where/i,
      /\$ne/i,
      /\$gt/i,
      /\$lt/i,
      /\$regex/i,
      /\$or/i,
      /\$and/i,
      /\$in/i,
      /\$nin/i,
      /javascript:/i,
      /eval\(/i,
      /function\(/i
    ],
    pathTraversal: [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
      /\.\.%2f/i,
      /\.\.%5c/i
    ],
    xss: [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]
  }
};
