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

  // If it starts with /uploads/, prepend the API URL
  if (imagePath.startsWith('/uploads/')) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    console.log('Generated image URL:', url);
    return url;
  }

  // If it's a relative path starting with uploads/, prepend API URL with slash
  if (imagePath.startsWith('uploads/')) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`;
    console.log('Generated image URL:', url);
    return url;
  }

  // For other paths (like /images/), treat as frontend static assets
  return imagePath;
}