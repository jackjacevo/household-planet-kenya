const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with a slash, it's a relative path from the backend
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's a relative path and prepend the API URL
  return `${API_BASE_URL}/${imagePath}`;
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.target as HTMLImageElement;
  if (target.src !== '/images/placeholder.jpg') {
    target.src = '/images/placeholder.jpg';
  }
}
