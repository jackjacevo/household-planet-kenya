export function ensureStringUserId(userId: string | number | undefined): string {
  if (userId === undefined || userId === null) {
    throw new Error('UserId is required');
  }
  return String(userId);
}

export function ensureNumberUserId(userId: string | number | undefined): number {
  if (userId === undefined || userId === null) {
    throw new Error('UserId is required');
  }
  const numericId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  if (isNaN(numericId)) {
    throw new Error('Invalid userId format');
  }
  return numericId;
}