export class SlugUtil {
  /**
   * Generate a URL-friendly slug from a string
   */
  static generateSlug(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a unique slug by appending a number if needed
   */
  static async generateUniqueSlug(
    baseText: string,
    checkExistence: (slug: string) => Promise<boolean>,
    maxAttempts: number = 100
  ): Promise<string> {
    let baseSlug = this.generateSlug(baseText);
    
    if (!baseSlug) {
      baseSlug = 'product';
    }

    // Check if base slug is available
    if (!(await checkExistence(baseSlug))) {
      return baseSlug;
    }

    // Try with numbers appended
    for (let i = 1; i <= maxAttempts; i++) {
      const candidateSlug = `${baseSlug}-${i}`;
      if (!(await checkExistence(candidateSlug))) {
        return candidateSlug;
      }
    }

    // Fallback with timestamp
    return `${baseSlug}-${Date.now()}`;
  }
}
