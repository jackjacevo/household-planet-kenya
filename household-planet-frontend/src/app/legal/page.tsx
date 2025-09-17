import { Metadata } from 'next';
import Link from 'next/link';
import { DocumentTextIcon, ShieldCheckIcon, TruckIcon, ArrowPathIcon, ExclamationTriangleIcon, UserGroupIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Legal Information - Household Planet Kenya',
  description: 'Access all legal documents, policies, and terms for Household Planet Kenya.',
};

const legalDocuments = [
  {
    title: 'Terms of Service',
    description: 'Comprehensive terms and conditions for using our platform and services.',
    href: '/legal/terms',
    icon: DocumentTextIcon,
    lastUpdated: 'Recently updated',
    category: 'Essential'
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information with GDPR compliance.',
    href: '/privacy',
    icon: ShieldCheckIcon,
    lastUpdated: 'Recently updated',
    category: 'Essential'
  },
  {
    title: 'Cookie Policy',
    description: 'Information about cookies and tracking technologies we use on our website.',
    href: '/legal/cookies',
    icon: LockClosedIcon,
    lastUpdated: 'Recently updated',
    category: 'Privacy'
  },
  {
    title: 'Return & Refund Policy',
    description: 'Detailed information about returns, refunds, and exchange procedures.',
    href: '/legal/returns',
    icon: ArrowPathIcon,
    lastUpdated: 'Recently updated',
    category: 'Shopping'
  },
  {
    title: 'Shipping & Delivery Policy',
    description: 'Shipping options, delivery timeframes, and policies across Kenya.',
    href: '/legal/shipping',
    icon: TruckIcon,
    lastUpdated: 'Recently updated',
    category: 'Shopping'
  },
  {
    title: 'Acceptable Use Policy',
    description: 'Guidelines for acceptable use of our platform and community features.',
    href: '/legal/acceptable-use',
    icon: ExclamationTriangleIcon,
    lastUpdated: 'Recently updated',
    category: 'Community'
  },
  {
    title: 'Customer Data Protection Agreement',
    description: 'Our commitment to protecting your data and your privacy rights.',
    href: '/legal/data-protection',
    icon: UserGroupIcon,
    lastUpdated: 'Recently updated',
    category: 'Privacy'
  }
];

const categories = {
  'Essential': 'bg-red-50 text-red-700 border-red-200',
  'Privacy': 'bg-blue-50 text-blue-700 border-blue-200',
  'Shopping': 'bg-green-50 text-green-700 border-green-200',
  'Community': 'bg-purple-50 text-purple-700 border-purple-200'
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access all our legal documents, policies, and terms. We're committed to transparency and protecting your rights as our customer.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Important Notice</h2>
          <p className="text-blue-800 mb-3">
            All our legal documents have been recently updated to ensure compliance with:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-blue-800">
            <li>General Data Protection Regulation (GDPR)</li>
            <li>Kenya Data Protection Act, 2019</li>
            <li>Consumer Protection Act, 2012</li>
            <li>Electronic Transactions Act</li>
          </ul>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {legalDocuments.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <Link
                key={doc.href}
                href={doc.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {doc.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categories[doc.category as keyof typeof categories]}`}>
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {doc.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.lastUpdated}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Reference</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Rights</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  30-day return policy on most items
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Full refund for defective products
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Free shipping on orders over KES 2,000
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  GDPR data protection rights
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  24/7 customer support
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Protection</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  End-to-end encryption
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Secure payment processing
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  No data selling to third parties
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Right to data deletion
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🔒</span>
                  Regular security audits
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">General Questions</h4>
              <p className="text-sm text-gray-600 mb-2">For questions about our policies</p>
              <p className="text-sm text-gray-900">
                <strong>Email:</strong> legal@householdplanet.co.ke<br />
                <strong>Phone:</strong> +254 700 000 000
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Privacy & Data Protection</h4>
              <p className="text-sm text-gray-600 mb-2">For GDPR requests and privacy concerns</p>
              <p className="text-sm text-gray-900">
                <strong>Email:</strong> dpo@householdplanet.co.ke<br />
                <strong>Response:</strong> Within 48 hours
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Returns & Refunds</h4>
              <p className="text-sm text-gray-600 mb-2">For return and refund assistance</p>
              <p className="text-sm text-gray-900">
                <strong>Email:</strong> returns@householdplanet.co.ke<br />
                <strong>WhatsApp:</strong> +254 700 000 000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Last updated: {new Date().toLocaleDateString()} | 
            All policies are effective immediately upon posting
          </p>
        </div>
      </div>
    </div>
  );
}
