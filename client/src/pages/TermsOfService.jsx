export default function TermsOfService() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: `By accessing or using WorkHunt, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.`,
    },
    {
      title: '2. Eligibility',
      body: `You must be at least 18 years old to use WorkHunt. By using the platform, you represent and warrant that you meet this requirement and that all information you provide is accurate and complete.`,
    },
    {
      title: '3. Accounts',
      body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at support@workhunt.com if you suspect any unauthorized use of your account.`,
    },
    {
      title: '4. Job Seekers',
      body: `Job seekers may create profiles, upload resumes, and apply for jobs posted on WorkHunt. You represent that all information in your profile is truthful and accurate. WorkHunt is not responsible for the actions of employers or the outcome of any job application.`,
    },
    {
      title: '5. Employers',
      body: `Employers may post job listings and review applications. Job postings must be for real, legitimate positions. WorkHunt reserves the right to remove any posting that violates our policies, contains false information, or is deemed inappropriate.`,
    },
    {
      title: '6. Prohibited Conduct',
      body: `You agree not to: post false or misleading information; scrape or copy data from the platform without permission; harass other users; attempt to gain unauthorized access to any part of the platform; or use WorkHunt for any unlawful purpose.`,
    },
    {
      title: '7. Intellectual Property',
      body: `All content on WorkHunt — including logos, design, text, and software — is the property of WorkHunt, Inc. and is protected by copyright and other intellectual property laws. You may not reproduce or distribute our content without prior written permission.`,
    },
    {
      title: '8. Disclaimer of Warranties',
      body: `WorkHunt is provided "as is" without warranties of any kind. We do not guarantee that the platform will be error-free or uninterrupted, or that job listings are accurate or suitable for your needs.`,
    },
    {
      title: '9. Limitation of Liability',
      body: `To the fullest extent permitted by law, WorkHunt shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.`,
    },
    {
      title: '10. Termination',
      body: `We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion, with or without notice.`,
    },
    {
      title: '11. Changes to Terms',
      body: `We may update these Terms of Service from time to time. Continued use of WorkHunt after changes are posted constitutes your acceptance of the revised terms.`,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: June 1, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <p className="text-gray-600 leading-relaxed">
            These Terms of Service govern your use of the WorkHunt platform and services. Please read them carefully before using WorkHunt.
          </p>

          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">12. Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Questions about these Terms? Contact us at{' '}
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
