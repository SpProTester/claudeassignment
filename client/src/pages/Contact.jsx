import { useState } from 'react';
import api from '../services/api.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type = 'text', placeholder = '') => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        required
        className="input-field"
      />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Have a question or need help? We're here for you. Our support team usually responds within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Contact info */}
          <div className="space-y-6">
            {[
              { icon: '📧', title: 'Email',   value: 'support@workhunt.com' },
              { icon: '💬', title: 'Live Chat', value: 'Available Mon–Fri, 9 am–6 pm IST' },
              { icon: '🏢', title: 'Office',  value: 'Bengaluru, Karnataka, India' },
            ].map(({ icon, title, value }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{title}</p>
                  <p className="text-sm text-gray-500">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 text-sm">Thanks for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Send us a message</h2>
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {field('name',  'Your Name',  'text',  'John Doe')}
                    {field('email', 'Email Address', 'email', 'john@example.com')}
                  </div>
                  {field('subject', 'Subject', 'text', 'How can we help?')}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                      placeholder="Tell us what's on your mind…"
                      className="input-field resize-none"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
