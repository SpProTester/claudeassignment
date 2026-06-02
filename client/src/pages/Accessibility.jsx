export default function Accessibility() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Accessibility Statement</h1>
          <p className="text-sm text-gray-400">Last updated: June 1, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">

          <p className="text-gray-600 leading-relaxed">
            WorkHunt is committed to ensuring our platform is accessible to everyone, including people with disabilities. We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
          </p>

          {[
            {
              title: 'Our Commitment',
              body: 'We believe everyone deserves equal access to job opportunities. We continuously work to improve the accessibility of WorkHunt so that all users can search for jobs, create profiles, and apply with ease.',
            },
            {
              title: 'Measures We Take',
              body: 'We use semantic HTML to support screen readers, ensure sufficient color contrast across the platform, provide keyboard navigation for all interactive elements, include descriptive alt text for images, and test regularly with assistive technologies.',
            },
            {
              title: 'Known Limitations',
              body: 'While we work hard to meet accessibility standards, some older content or third-party components may not fully comply. We are actively working to address these gaps.',
            },
            {
              title: 'Feedback & Assistance',
              body: 'If you encounter an accessibility barrier on WorkHunt or need assistance using any part of the platform, please contact us. We aim to respond to accessibility feedback within 2 business days.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <section className="bg-primary-50 border border-primary-100 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-2">Contact Us</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              If you need accessibility assistance or want to report an issue:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📧 Email: <a href="mailto:accessibility@workhunt.com" className="text-primary-600 hover:underline font-medium">accessibility@workhunt.com</a></li>
              <li>⏱️ Response time: within 2 business days</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
