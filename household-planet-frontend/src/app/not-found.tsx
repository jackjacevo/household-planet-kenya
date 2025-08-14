import Link from 'next/link';
import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata({
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found. Browse our products or return to the homepage.',
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Go to Homepage
          </Link>

          <div className="flex space-x-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FaSearch className="mr-2" />
              Browse Products
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link href="/support" className="text-blue-600 hover:underline">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}