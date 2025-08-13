'use client';

import { useEffect, useState } from 'react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
}

export default function AccessibilityAudit() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const auditAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.getAttribute('alt')) {
          foundIssues.push({
            type: 'error',
            message: `Image missing alt text`,
            element: `img[${index}]`
          });
        }
      });

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (!id && !ariaLabel && !ariaLabelledBy) {
          foundIssues.push({
            type: 'error',
            message: `Form input missing label`,
            element: `${input.tagName.toLowerCase()}[${index}]`
          });
        } else if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label && !ariaLabel && !ariaLabelledBy) {
            foundIssues.push({
              type: 'warning',
              message: `Form input has ID but no associated label`,
              element: `${input.tagName.toLowerCase()}#${id}`
            });
          }
        }
      });

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastLevel + 1) {
          foundIssues.push({
            type: 'warning',
            message: `Heading level skipped (h${lastLevel} to h${level})`,
            element: heading.tagName.toLowerCase()
          });
        }
        lastLevel = level;
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');
        
        if (!text && !ariaLabel && !ariaLabelledBy) {
          foundIssues.push({
            type: 'error',
            message: `Button missing accessible name`,
            element: `button[${index}]`
          });
        }
      });

      // Check for links without accessible names
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');
        
        if (!text && !ariaLabel && !title) {
          foundIssues.push({
            type: 'error',
            message: `Link missing accessible name`,
            element: `a[${index}]`
          });
        }
      });

      setIssues(foundIssues);
    };

    // Run audit after DOM is loaded
    const timer = setTimeout(auditAccessibility, 1000);
    
    // Re-run audit when DOM changes
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      setTimeout(auditAccessibility, 500);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Accessibility issues found: ${issues.length}`}
      >
        <span className="sr-only">Accessibility Audit</span>
        ♿ {issues.length}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-16 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Accessibility Issues ({issues.length})
            </h3>
            <p className="text-sm text-gray-600">Development mode only</p>
          </div>
          
          <div className="p-4 space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border-l-4 ${
                  issue.type === 'error'
                    ? 'bg-red-50 border-red-400'
                    : issue.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        issue.type === 'error'
                          ? 'bg-red-400'
                          : issue.type === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {issue.message}
                    </p>
                    {issue.element && (
                      <p className="text-xs text-gray-500 mt-1">
                        Element: {issue.element}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              This audit checks basic accessibility issues. For comprehensive testing, use tools like axe-core or WAVE.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}