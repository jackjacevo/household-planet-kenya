'use client';

export default function CriticalCSS() {
  return (
    <style jsx>{`
      /* Critical above-the-fold styles */
      .critical-nav {
        position: sticky;
        top: 0;
        z-index: 40;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #e5e7eb;
      }
      
      .critical-hero {
        min-height: 60vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .critical-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 1rem;
      }
      
      .critical-card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s ease;
      }
      
      .critical-button {
        background: #3b82f6;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
        min-height: 44px;
      }
      
      .critical-button:hover {
        background: #2563eb;
      }
      
      @media (max-width: 768px) {
        .critical-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 0.5rem;
        }
        
        .critical-hero {
          min-height: 50vh;
        }
      }
    `}</style>
  );
}