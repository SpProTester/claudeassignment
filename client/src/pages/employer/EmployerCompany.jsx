import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { toast } from '../../store/uiStore.js';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
  'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Logistics',
  'Government', 'Non-profit', 'Other',
];

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function EmployerCompany() {
  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['employer', 'company'],
    queryFn: employerService.getMyCompany,
    retry: false,
  });

  const company = data?.data?.company;
  const notFound = fetchError?.message?.includes('No company') || fetchError?.message?.includes('not found');

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      companyName: '',
      companySlug: '',
      industry: '',
      companySize: '',
      websiteUrl: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (company) {
      reset({
        companyName:  company.companyName  ?? '',
        companySlug:  company.companySlug  ?? '',
        industry:     company.industry     ?? '',
        companySize:  company.companySize  ?? '',
        websiteUrl:   company.websiteUrl   ?? '',
        logoUrl:      company.logoUrl      ?? '',
      });
    }
  }, [company, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      company
        ? employerService.updateCompany(company.id, payload)
        : employerService.createCompany(payload),
    onSuccess: () => {
      toast.success(company ? 'Profile updated!' : 'Company profile created!');
      qc.invalidateQueries(['employer', 'company']);
      setIsCreating(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    if (!payload.websiteUrl) delete payload.websiteUrl;
    if (!payload.logoUrl)    delete payload.logoUrl;
    if (!payload.companySize) delete payload.companySize;
    if (!payload.industry)   delete payload.industry;
    updateMutation.mutate(payload);
  };

  const logoUrl = watch('logoUrl');
  const companyName = watch('companyName');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="w-6 h-6 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // No company yet — prompt to create
  if (notFound && !isCreating) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up your company so candidates can learn about you.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No company profile yet</h2>
          <p className="text-sm text-gray-500 mb-6">Create your company profile to start posting jobs and attracting top talent.</p>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            Create Company Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {company ? 'Update your company information.' : 'Set up your company profile.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo preview + URL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Company Branding</h2>
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-20 h-20 rounded-xl object-contain border border-gray-200 bg-gray-50"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-300">
                  {companyName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Field
                label="Logo URL"
                hint="Paste the URL of your company logo (PNG, JPG, or SVG)"
                error={errors.logoUrl?.message}
              >
                <input
                  className="input-field"
                  placeholder="https://yourcompany.com/logo.png"
                  {...register('logoUrl', {
                    validate: (v) =>
                      !v || /^https?:\/\/.+/.test(v) || 'Must be a valid URL (https://…)',
                  })}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>

          <Field label="Company Name" required error={errors.companyName?.message}>
            <input
              className={`input-field ${errors.companyName ? 'border-red-400' : ''}`}
              placeholder="Acme Corporation"
              {...register('companyName', {
                required: 'Company name is required.',
                minLength: { value: 2, message: 'At least 2 characters.' },
                maxLength: { value: 200, message: 'Max 200 characters.' },
              })}
            />
          </Field>

          <Field
            label="Company Slug"
            required
            hint="URL-friendly identifier (auto-generated from name). Used in public profile URL."
            error={errors.companySlug?.message}
          >
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-xs text-gray-400">
                /companies/
              </span>
              <input
                className={`input-field rounded-l-none ${errors.companySlug ? 'border-red-400' : ''}`}
                placeholder="acme-corporation"
                {...register('companySlug', {
                  required: 'Slug is required.',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Only lowercase letters, numbers, and hyphens.',
                  },
                })}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry" error={errors.industry?.message}>
              <select className="input-field" {...register('industry')}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>

            <Field label="Company Size" error={errors.companySize?.message}>
              <select className="input-field" {...register('companySize')}>
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Website"
            hint="Your company's public website"
            error={errors.websiteUrl?.message}
          >
            <input
              className="input-field"
              placeholder="https://www.yourcompany.com"
              {...register('websiteUrl', {
                validate: (v) =>
                  !v || /^https?:\/\/.+/.test(v) || 'Must be a valid URL.',
              })}
            />
          </Field>
        </div>

        {/* Verification badge */}
        {company && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            company.isVerified
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            {company.isVerified ? (
              <>
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span className="text-sm font-medium">Verified company</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-sm font-medium">Pending verification — contact support to verify your company.</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {isDirty ? 'Unsaved changes' : company ? 'All changes saved' : ''}
          </p>
          <button
            type="submit"
            disabled={updateMutation.isPending || (!isDirty && !isCreating)}
            className="btn-primary flex items-center gap-2"
          >
            {updateMutation.isPending && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {updateMutation.isPending ? 'Saving…' : company ? 'Save Changes' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
