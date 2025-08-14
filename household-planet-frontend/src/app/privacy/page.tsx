export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-gray-600">Last updated: January 1, 2025</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p>We collect information you provide directly to us, such as when you:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create an account</li>
            <li>Make a purchase</li>
            <li>Contact customer support</li>
            <li>Subscribe to our newsletter</li>
          </ul>
          
          <h3 className="text-lg font-medium">Automatically Collected Information</h3>
          <p>We automatically collect certain information when you use our services:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage information (pages visited, time spent, clicks)</li>
            <li>Location information (general geographic location)</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Process and fulfill your orders</li>
          <li>Provide customer support</li>
          <li>Send you important updates about your account or orders</li>
          <li>Improve our products and services</li>
          <li>Prevent fraud and ensure security</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>With service providers who help us operate our business</li>
          <li>When required by law or to protect our rights</li>
          <li>In connection with a business transfer or merger</li>
          <li>With your explicit consent</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Your Rights (GDPR)</h2>
        <p>If you are a resident of the European Union, you have the following rights:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
          <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
          <li><strong>Right to Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
          <li><strong>Right to Restrict:</strong> Restrict processing of your personal data</li>
        </ul>
        <p className="mt-4">
          To exercise these rights, please visit your{' '}
          <a href="/dashboard/privacy" className="text-blue-600 underline">
            Privacy Dashboard
          </a>{' '}
          or contact us at privacy@householdplanet.co.ke
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Data Retention</h2>
        <p>We retain your personal information for as long as necessary to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide our services to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
          <li>Enforce our agreements</li>
        </ul>
        <p className="mt-4">
          Inactive accounts are automatically deleted after 2 years of inactivity.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Remember your preferences</li>
          <li>Analyze website usage</li>
          <li>Provide personalized content</li>
          <li>Ensure website security</li>
        </ul>
        <p className="mt-4">
          You can manage your cookie preferences through our cookie consent banner or in your browser settings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments</li>
          <li>Access controls and authentication</li>
          <li>Employee training on data protection</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. International Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. 
          We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
        <p>
          Our services are not intended for children under 16 years of age. 
          We do not knowingly collect personal information from children under 16.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. 
          We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us:</p>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Email:</strong> privacy@householdplanet.co.ke</p>
          <p><strong>Phone:</strong> +254-XXX-XXXX-XXX</p>
          <p><strong>Address:</strong> Nairobi, Kenya</p>
        </div>
      </section>
    </div>
  );
}