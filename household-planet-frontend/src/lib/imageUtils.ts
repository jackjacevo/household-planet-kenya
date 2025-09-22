/**
 * Utility function to get the correct image URL
 * Handles both local uploads and external URLs
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  console.log('🖼️ getImageUrl called with:', imagePath);
  // Return placeholder if no image path or empty string
  if (!imagePath || imagePath.trim() === '') {
    console.log('❌ No image path, using placeholder');
    return '/images/products/placeholder.svg';
  }

  // Ensure imagePath is a string and trim whitespace
  let cleanPath = String(imagePath).trim();
  
  // Handle malformed JSON strings like "[" or incomplete arrays
  if (cleanPath.startsWith('[') || cleanPath.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleanPath);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleanPath = String(parsed[0]).trim();
      } else {
        return '/images/products/placeholder.svg';
      }
    } catch {
      return '/images/products/placeholder.svg';
    }
  }
  
  // Return placeholder if still empty after cleaning
  if (!cleanPath || cleanPath === 'null' || cleanPath === 'undefined') {
    return '/images/products/placeholder.svg';
  }

  // If it's already a full URL (starts with http) or base64 data, return as is
  if (cleanPath.startsWith('http') || cleanPath.startsWith('data:')) {
    return cleanPath;
  }

  // Get API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Handle product images - check if it's a UUID-based filename
  if (cleanPath.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif)$/i)) {
    return `${apiUrl}/uploads/products/${cleanPath}`;
  }

  // Handle category images with proper endpoint
  if (cleanPath.includes('category-') && cleanPath.includes('.jpeg')) {
    return `${apiUrl}/uploads/categories/${cleanPath.split('/').pop()}`;
  }

  // If it starts with /uploads/, prepend the API URL
  if (cleanPath.startsWith('/uploads/')) {
    return `${apiUrl}${cleanPath}`;
  }

  // If it's a relative path starting with uploads/, prepend API URL with slash
  if (cleanPath.startsWith('uploads/')) {
    return `${apiUrl}/${cleanPath}`;
  }

  // For other paths (like /images/), treat as frontend static assets
  return cleanPath;
}
