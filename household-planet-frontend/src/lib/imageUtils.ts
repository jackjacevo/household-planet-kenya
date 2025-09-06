/**
 * Utility function to get the correct image URL
 * Handles both local uploads and external URLs
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  // Return placeholder if no image path
  if (!imagePath) {
    return '/images/products/placeholder.svg';
  }

  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Get API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // If it starts with /uploads/, prepend the API URL
  if (imagePath.startsWith('/uploads/')) {
    return `${apiUrl}${imagePath}`;
  }

  // If it's a relative path starting with uploads/, prepend API URL with slash
  if (imagePath.startsWith('uploads/')) {
    return `${apiUrl}/${imagePath}`;
  }

  // For other paths (like /images/), treat as frontend static assets
  return imagePath;
}