export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="text-gray-600">Last updated: January 1, 2025</p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit our website. They help us provide you with a better browsing experience.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Types of Cookies We Use</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-lg">Necessary Cookies</h3>
            <p className="text-gray-700">Essential for website functionality and security. These cannot be disabled.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><code>session_id</code> - Maintains your session while browsing</li>
              <li><code>csrf_token</code> - Protects against security attacks</li>
              <li><code>auth_token</code> - Keeps you logged in</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg">Analytics Cookies</h3>
            <p className="text-gray-700">Help us understand how visitors use our website.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><code>_ga</code> - Google Analytics visitor identification</li>
              <li><code>_gid</code> - Google Analytics session identification</li>
              <li><code>analytics_session</code> - Our internal analytics tracking</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg">Marketing Cookies</h3>
            <p className="text-gray-700">Used to deliver personalized advertisements.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><code>marketing_id</code> - Tracks marketing campaign effectiveness</li>
              <li><code>ad_preferences</code> - Stores your advertising preferences</li>
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-lg">Preference Cookies</h3>
            <p className="text-gray-700">Remember your settings and preferences.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><code>theme</code> - Your preferred color theme</li>
              <li><code>language</code> - Your language preference</li>
              <li><code>currency</code> - Your preferred currency</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. How We Use Cookies</h2>
        <p>We use cookies to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Keep you logged in to your account</li>
          <li>Remember items in your shopping cart</li>
          <li>Understand how you use our website</li>
          <li>Show you relevant advertisements</li>
          <li>Improve our website performance</li>
          <li>Provide customer support</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Third-Party Cookies</h2>
        <p>We may use third-party services that set their own cookies:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Google Analytics:</strong> Website usage analytics</li>
          <li><strong>Stripe:</strong> Secure payment processing</li>
          <li><strong>Facebook Pixel:</strong> Social media advertising</li>
          <li><strong>WhatsApp Business:</strong> Customer communication</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Managing Your Cookie Preferences</h2>
        <p>You can control cookies through:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Our cookie consent banner (appears on first visit)</li>
          <li>Your browser settings</li>
          <li>Your account privacy settings</li>
        </ul>
        
        <div className="bg-blue-50 p-4 rounded mt-4">
          <p className="font-medium">Update Your Cookie Preferences</p>
          <p className="text-sm text-gray-600 mt-1">
            You can change your cookie preferences at any time by clicking the "Cookie Settings" link in our footer.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Browser Cookie Settings</h2>
        <p>Most browsers allow you to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>View and delete cookies</li>
          <li>Block cookies from specific websites</li>
          <li>Block all cookies</li>
          <li>Delete cookies when you close your browser</li>
        </ul>
        
        <div className="bg-yellow-50 p-4 rounded mt-4">
          <p className="font-medium">⚠️ Important Note</p>
          <p className="text-sm text-gray-600 mt-1">
            Disabling necessary cookies may prevent you from using certain features of our website, including making purchases.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Cookie Retention</h2>
        <p>Different cookies have different lifespans:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
          <li><strong>Our cookies typically expire:</strong> 1-24 months after being set</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Updates to This Policy</h2>
        <p>We may update this cookie policy from time to time. We'll notify you of any significant changes by updating the "Last updated" date at the top of this page.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Contact Us</h2>
        <p>If you have questions about our use of cookies, please contact us:</p>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Email:</strong> privacy@householdplanet.co.ke</p>
          <p><strong>Phone:</strong> +254-XXX-XXXX-XXX</p>
          <p><strong>Address:</strong> Nairobi, Kenya</p>
        </div>
      </section>
    </div>
  );
}