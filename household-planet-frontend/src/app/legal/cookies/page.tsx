import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Household Planet Kenya',
  description: 'Learn about how we use cookies and similar technologies on our website.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies are necessary for the website to function properly:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Authentication cookies to keep you logged in</li>
                    <li>Shopping cart cookies to remember your items</li>
                    <li>Security cookies to protect against fraud</li>
                    <li>Session cookies for basic site functionality</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies help us understand how visitors interact with our website:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Google Analytics cookies for website analytics</li>
                    <li>Page load time measurement cookies</li>
                    <li>Error tracking cookies for site improvement</li>
                    <li>User behavior analysis cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies enhance your experience by remembering your choices:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Language preference cookies</li>
                    <li>Currency selection cookies</li>
                    <li>Theme preference cookies (light/dark mode)</li>
                    <li>Recently viewed products cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies are used to deliver relevant advertisements:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Facebook Pixel for social media advertising</li>
                    <li>Google Ads cookies for targeted advertising</li>
                    <li>Retargeting cookies to show relevant ads</li>
                    <li>Email marketing tracking cookies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">We also use third-party services that may set cookies:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Facebook:</strong> For social media integration and advertising</li>
                <li><strong>Payment Processors:</strong> For secure payment processing</li>
                <li><strong>Customer Support:</strong> For live chat and support services</li>
                <li><strong>Content Delivery Networks:</strong> For faster content delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Duration</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Session Cookies</h3>
                  <p className="text-gray-700">These are temporary cookies that expire when you close your browser.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Persistent Cookies</h3>
                  <p className="text-gray-700">These cookies remain on your device for a set period or until you delete them:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                    <li>Authentication cookies: 30 days</li>
                    <li>Preference cookies: 1 year</li>
                    <li>Analytics cookies: 2 years</li>
                    <li>Marketing cookies: 90 days</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">Cookie Consent Banner</h3>
                <p>When you first visit our website, you'll see a cookie consent banner where you can:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your cookie preferences</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Browser Settings</h3>
                <p>You can also manage cookies through your browser settings:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete existing cookies</li>
                  <li>Set up notifications when cookies are being set</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Privacy Dashboard</h3>
                <p>Registered users can manage their cookie preferences through our Privacy Dashboard in their account settings.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                If you choose to disable cookies, some features of our website may not function properly:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You may need to log in repeatedly</li>
                <li>Your shopping cart may not remember items</li>
                <li>Personalized recommendations may not work</li>
                <li>Some pages may load more slowly</li>
                <li>You may see less relevant advertisements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time. When we do, we will post the updated policy on this page and update the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-2 text-gray-700">
                <p>If you have questions about our use of cookies, please contact us:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> privacy@householdplanet.co.ke</li>
                  <li><strong>Phone:</strong> +254 700 000 000</li>
                  <li><strong>Address:</strong> Nairobi, Kenya</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}