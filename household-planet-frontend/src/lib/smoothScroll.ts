/**
 * Optimized smooth scroll utilities - compatible with Next.js
 */

export const smoothScrollTo = (elementId: string, offset: number = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
};

export const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

export const smoothScrollToElement = (element: HTMLElement) => {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  });
};