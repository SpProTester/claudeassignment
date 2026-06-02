export default function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: `We collect information you provide directly to us — such as your name, email address, resume, and job preferences — when you create an account, apply for jobs, or contact us. We also collect information automatically when you use our services, including log data, device information, and cookies.`,
    },
    {
      title: '2. How We Use Your Information',
      body: `We use the information we collect to operate and improve WorkHunt, match you with relevant job opportunities, send you job alerts and notifications you've opted into, communicate with you about your account, and comply with legal obligations.`,
    },
    {
      title: '3. Sharing Your Information',
      body: `We share your information with employers when you apply for a job or make your profile visible to recruiters. We do not sell your personal information to third parties. We may share data with service providers who assist us in operating the platform under strict confidentiality agreements.`,
    },
    {
      title: '4. Data Retention',
      body: `We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting support@workhunt.com.`,
    },
    {
      title: '5. Security',
      body: `We implement industry-standard security measures including encryption in transit (TLS), hashed passwords, and access controls to protect your personal information. No method of transmission over the internet is 100% secure, but we take all reasonable steps to protect your data.`,
    },
    {
      title: '6. Cookies',
      body: `We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how you use WorkHunt. You can control cookies through your browser settings, though disabling them may affect some features.`,
    },
    {
      title: '7. Your Rights',
      body: `Depending on your location, you may have the right to access, correct, or delete your personal data; object to or restrict processing; and data portability. To exercise any of these rights, please contact us at support@workhunt.com.`,
    },
    {
      title: '8. Changes to This Policy',
      body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or via a notice on the platform. Your continued use of WorkHunt after such changes constitutes your acceptance of the updated policy.`,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: June 1, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <p className="text-gray-600 leading-relaxed">
            At WorkHunt, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform. Please read this policy carefully.
          </p>

          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">9. Contact Us</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:support@workhunt.com" className="text-primary-600 hover:underline font-medium">
                support@workhunt.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
