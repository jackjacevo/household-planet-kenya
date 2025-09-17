import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Household Planet Kenya',
  description: 'Guidelines for acceptable use of our platform and services.',
};

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Acceptable Use Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purpose</h2>
              <p className="text-gray-700 mb-4">
                This Acceptable Use Policy outlines the rules and guidelines for using Household Planet Kenya's platform, services, and community features. By using our services, you agree to comply with these guidelines to ensure a safe and positive experience for all users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You may use our platform to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Browse and purchase household items and related products</li>
                <li>Create and manage your user account</li>
                <li>Write honest product reviews and ratings</li>
                <li>Participate in community discussions and forums</li>
                <li>Contact customer support for assistance</li>
                <li>Share product recommendations with friends and family</li>
                <li>Use our mobile app and website features as intended</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-900 mb-2">🚫 Illegal Activities</h3>
                  <ul className="list-disc pl-6 space-y-1 text-red-800">
                    <li>Using the platform for any illegal purposes</li>
                    <li>Violating any local, national, or international laws</li>
                    <li>Engaging in fraudulent activities or transactions</li>
                    <li>Money laundering or financing illegal activities</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-orange-900 mb-2">⚠️ Harmful Content</h3>
                  <ul className="list-disc pl-6 space-y-1 text-orange-800">
                    <li>Posting offensive, abusive, or discriminatory content</li>
                    <li>Sharing content that promotes violence or hatred</li>
                    <li>Uploading inappropriate images or videos</li>
                    <li>Spreading false or misleading information</li>
                    <li>Posting spam or unsolicited promotional content</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-900 mb-2">🔒 Security Violations</h3>
                  <ul className="list-disc pl-6 space-y-1 text-yellow-800">
                    <li>Attempting to hack or breach our security systems</li>
                    <li>Using automated tools to scrape our website</li>
                    <li>Sharing your account credentials with others</li>
                    <li>Creating multiple accounts to circumvent restrictions</li>
                    <li>Interfering with the platform's normal operation</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">📝 Content Misuse</h3>
                  <ul className="list-disc pl-6 space-y-1 text-purple-800">
                    <li>Posting fake or misleading product reviews</li>
                    <li>Copying content from other websites without permission</li>
                    <li>Infringing on intellectual property rights</li>
                    <li>Impersonating other users or businesses</li>
                    <li>Manipulating ratings or review systems</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User-Generated Content</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Content Guidelines</h3>
                <p className="text-gray-700 mb-4">When posting reviews, comments, or other content:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Be honest and accurate in your reviews and ratings</li>
                  <li>Use respectful language and tone</li>
                  <li>Focus on the product or service, not personal attacks</li>
                  <li>Avoid sharing personal information about yourself or others</li>
                  <li>Respect copyright and intellectual property rights</li>
                  <li>Don't post content that violates privacy rights</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Content Ownership</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>You retain ownership of content you create and post</li>
                  <li>You grant us a license to use your content for platform operations</li>
                  <li>We may remove content that violates these guidelines</li>
                  <li>You're responsible for ensuring you have rights to posted content</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Responsibilities</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Security</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Use a strong, unique password for your account</li>
                  <li>Enable two-factor authentication when available</li>
                  <li>Log out from shared or public devices</li>
                  <li>Report suspicious account activity immediately</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Update your profile when information changes</li>
                  <li>Don't create accounts using false information</li>
                  <li>Maintain only one personal account</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Commercial Use Restrictions</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">Business Accounts</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Business use requires a separate business account</li>
                  <li>Commercial activities must comply with our seller terms</li>
                  <li>Bulk purchasing may require special arrangements</li>
                  <li>Reselling requires proper business registration</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Prohibited Commercial Activities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Using personal accounts for business purposes</li>
                  <li>Unauthorized reselling of our products</li>
                  <li>Price manipulation or market interference</li>
                  <li>Creating fake demand through multiple accounts</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy and Data Protection</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Respect other users' privacy and personal information</li>
                <li>Don't collect or harvest user data without permission</li>
                <li>Report privacy violations to our support team</li>
                <li>Follow our Privacy Policy when handling personal data</li>
                <li>Don't share sensitive information in public areas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Violations</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">How to Report</h3>
                <p className="text-blue-800 mb-2">If you encounter content or behavior that violates this policy:</p>
                <ul className="list-disc pl-6 space-y-1 text-blue-800">
                  <li>Use the "Report" button on the specific content</li>
                  <li>Email us at abuse@householdplanet.co.ke</li>
                  <li>Contact customer support with details</li>
                  <li>Provide screenshots or evidence when possible</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enforcement Actions</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Warning System</h3>
                <p className="text-gray-700 mb-2">For minor violations, we may:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Send a warning notification</li>
                  <li>Remove the violating content</li>
                  <li>Temporarily restrict certain features</li>
                  <li>Require acknowledgment of policy terms</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">Serious Violations</h3>
                <p className="text-gray-700 mb-2">For serious or repeated violations, we may:</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Temporarily suspend your account</li>
                  <li>Permanently ban your account</li>
                  <li>Report illegal activities to authorities</li>
                  <li>Take legal action if necessary</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Appeals Process</h2>
              <p className="text-gray-700 mb-4">
                If you believe your account was restricted or content was removed in error:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Submit an appeal through our support system</li>
                <li>Provide detailed explanation and evidence</li>
                <li>Wait for our review team to investigate</li>
                <li>Receive a decision within 5-10 business days</li>
                <li>If unsatisfied, escalate to senior management</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 mb-4">
                We may update this Acceptable Use Policy from time to time. When we do:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We'll notify you via email or platform notification</li>
                <li>The updated policy will be posted on this page</li>
                <li>Continued use constitutes acceptance of changes</li>
                <li>You can review the change history upon request</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-2 text-gray-700">
                <p>For questions about this Acceptable Use Policy:</p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> policy@householdplanet.co.ke</li>
                  <li><strong>Abuse Reports:</strong> abuse@householdplanet.co.ke</li>
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
