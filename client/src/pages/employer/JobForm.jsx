import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerService } from '../../services/employer.service.js';
import { toast } from '../../store/uiStore.js';
import { formatSalary } from '../../utils/helpers.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const JOB_TYPES     = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const WORK_MODES    = ['onsite', 'remote', 'hybrid'];
const EXP_LEVELS    = ['entry', 'mid', 'senior', 'lead', 'executive'];

const STEP_FIELDS = [
  ['title', 'jobType', 'workMode', 'experienceLevel'],
  ['description'],
  [],   // skills — optional
  [],   // preview/publish — submit only
];

const STEPS = [
  { label: 'Basic Info',          short: '1' },
  { label: 'Details & Salary',    short: '2' },
  { label: 'Skills',              short: '3' },
  { label: 'Preview & Publish',   short: '4' },
];

// ── Field components ──────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ label, required, error, children, ...props }) {
  return (
    <Field label={label} required={required} error={error}>
      <select
        className={`input-field appearance-none ${error ? 'border-red-400 focus:ring-red-500' : ''}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

// ── Step components ───────────────────────────────────────────────────────────
function Step1({ register, errors }) {
  return (
    <div className="space-y-5">
      <Field label="Job Title" required error={errors.title?.message}>
        <input
          className={`input-field ${errors.title ? 'border-red-400 focus:ring-red-500' : ''}`}
          placeholder="e.g. Senior React Developer"
          {...register('title', {
            required: 'Title is required.',
            minLength: { value: 5, message: 'Title must be at least 5 characters.' },
            maxLength: { value: 200, message: 'Title must be under 200 characters.' },
          })}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField
          label="Job Type" required
          error={errors.jobType?.message}
          {...register('jobType', { required: 'Job type is required.' })}
        >
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('-', ' ')}</option>
          ))}
        </SelectField>

        <SelectField
          label="Work Mode" required
          error={errors.workMode?.message}
          {...register('workMode', { required: 'Work mode is required.' })}
        >
          {WORK_MODES.map((m) => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </SelectField>

        <SelectField
          label="Experience Level" required
          error={errors.experienceLevel?.message}
          {...register('experienceLevel', { required: 'Experience level is required.' })}
        >
          {EXP_LEVELS.map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </SelectField>
      </div>
    </div>
  );
}

function Step2({ register, errors, watch }) {
  const salaryMin = watch('salaryMin');
  const salaryMax = watch('salaryMax');

  return (
    <div className="space-y-5">
      <Field label="Job Description" required error={errors.description?.message}>
        <textarea
          rows={6}
          placeholder="Describe the role, responsibilities, and what you're looking for…"
          className={`input-field resize-none ${errors.description ? 'border-red-400 focus:ring-red-500' : ''}`}
          {...register('description', { required: 'Description is required.' })}
        />
      </Field>

      <Field label="Location" error={errors.location?.message}>
        <input
          className="input-field"
          placeholder="e.g. Mumbai, India or Remote"
          {...register('location')}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Salary Min (₹/yr)" error={errors.salaryMin?.message}>
          <input
            type="number"
            min="0"
            className={`input-field ${errors.salaryMin ? 'border-red-400' : ''}`}
            placeholder="e.g. 500000"
            {...register('salaryMin', {
              min: { value: 0, message: 'Must be positive.' },
              valueAsNumber: true,
            })}
          />
        </Field>
        <Field label="Salary Max (₹/yr)" error={errors.salaryMax?.message}>
          <input
            type="number"
            min="0"
            className={`input-field ${errors.salaryMax ? 'border-red-400' : ''}`}
            placeholder="e.g. 1200000"
            {...register('salaryMax', {
              min: { value: 0, message: 'Must be positive.' },
              valueAsNumber: true,
              validate: (v) =>
                !v || !salaryMin || v >= salaryMin || 'Max must be ≥ min.',
            })}
          />
        </Field>
      </div>
      {(salaryMin > 0 || salaryMax > 0) && (
        <p className="text-xs text-gray-400">
          Preview: {formatSalary(salaryMin || null, salaryMax || null)}
        </p>
      )}

      <Field label="Application Deadline" error={errors.expiresAt?.message}>
        <input
          type="date"
          className="input-field"
          min={new Date().toISOString().split('T')[0]}
          {...register('expiresAt')}
        />
      </Field>
    </div>
  );
}

function Step3({ skills, setSkills }) {
  const [input, setInput] = useState('');

  const addSkill = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setInput('');
  }, [input, skills, setSkills]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
    if (e.key === 'Backspace' && !input && skills.length) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1.5">Required Skills</p>
        <p className="text-xs text-gray-400 mb-3">
          Type a skill and press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs">,</kbd> to add.
        </p>

        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[80px] focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                className="hover:text-primary-900 ml-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addSkill}
            className="flex-1 min-w-[120px] outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder={skills.length === 0 ? 'React, Node.js, PostgreSQL…' : ''}
          />
        </div>
        {skills.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">{skills.length} skill{skills.length !== 1 ? 's' : ''} added</p>
        )}
      </div>

      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-100">
        <strong>Note:</strong> Skill tags are displayed on the job listing. Backend skill-ID linking requires a skills management endpoint (coming soon).
      </p>
    </div>
  );
}

function Step4({ watch, skills, isEdit }) {
  const values = watch();

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Review your job listing before publishing.</p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{values.title || <span className="text-gray-400 italic">No title</span>}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {values.jobType && <span className="badge bg-blue-100 text-blue-700">{values.jobType}</span>}
            {values.workMode && <span className="badge bg-cyan-100 text-cyan-700">{values.workMode}</span>}
            {values.experienceLevel && <span className="badge bg-purple-100 text-purple-700">{values.experienceLevel}</span>}
          </div>
        </div>

        {values.location && (
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {values.location}
          </p>
        )}

        {(values.salaryMin > 0 || values.salaryMax > 0) && (
          <p className="text-sm font-medium text-green-700">
            {formatSalary(values.salaryMin || null, values.salaryMax || null)}
          </p>
        )}

        {values.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">{values.description}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {values.expiresAt && (
          <p className="text-xs text-gray-400">
            Expires: {new Date(values.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Status selection */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Publish Status</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'draft', label: 'Save as Draft', desc: 'Not visible to job seekers yet.', color: 'gray' },
            { value: 'active', label: 'Publish Now', desc: 'Immediately visible to all seekers.', color: 'green' },
          ].map(({ value, label, desc, color }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" className="sr-only" value={value} {...(watch('status') === value ? { defaultChecked: true } : {})} name="_statusPreview" readOnly />
              <div className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                watch('status') === value
                  ? `border-${color}-400 bg-${color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState([]);

  const { register, control, handleSubmit, trigger, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      jobType: 'full-time',
      workMode: 'onsite',
      experienceLevel: 'mid',
      description: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      expiresAt: '',
      status: 'draft',
    },
  });

  // Load existing job for edit mode
  const { isLoading: loadingJob } = useQuery({
    queryKey: ['employer', 'job', id],
    queryFn: () => employerService.getJob(id),
    enabled: isEdit,
    onSuccess: (data) => {
      const job = data?.data?.job;
      if (job) {
        reset({
          title:           job.title ?? '',
          jobType:         job.jobType ?? 'full-time',
          workMode:        job.workMode ?? 'onsite',
          experienceLevel: job.experienceLevel ?? 'mid',
          description:     job.description ?? '',
          location:        job.location ?? '',
          salaryMin:       job.salaryMin ?? '',
          salaryMax:       job.salaryMax ?? '',
          expiresAt:       job.expiresAt ? job.expiresAt.split('T')[0] : '',
          status:          job.status ?? 'draft',
        });
        if (job.skills?.length) {
          setSkills(job.skills.map((s) => s.name ?? s));
        }
      }
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? employerService.updateJob(id, payload) : employerService.createJob(payload),
    onSuccess: (data) => {
      toast.success(isEdit ? 'Job updated!' : 'Job posted!');
      qc.invalidateQueries(['employer', 'jobs']);
      const jobId = data?.data?.job?.id;
      navigate(jobId ? `/employer/jobs/${jobId}/applicants` : '/employer/jobs');
    },
    onError: (e) => toast.error(e.message),
  });

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 || await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = (values) => {
    const salaryMin = values.salaryMin ? parseInt(values.salaryMin, 10) : null;
    const salaryMax = values.salaryMax ? parseInt(values.salaryMax, 10) : null;
    mutation.mutate({
      ...values,
      salaryMin,
      salaryMax,
      expiresAt: values.expiresAt || null,
      skillIds: [],  // wire up when /api/skills endpoint is available
    });
  };

  if (isEdit && loadingJob) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="w-6 h-6 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Step {step + 1} of {STEPS.length} — {STEPS[step].label}
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex flex-col items-center gap-1 group ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step  ? 'bg-primary-600 text-white' :
                i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                             'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s.short}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-6">
          {step === 0 && <Step1 register={register} errors={errors} />}
          {step === 1 && <Step2 register={register} errors={errors} watch={watch} />}
          {step === 2 && <Step3 skills={skills} setSkills={setSkills} />}
          {step === 3 && <Step4 watch={watch} skills={skills} isEdit={isEdit} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => step === 0 ? navigate(-1) : setStep((s) => s - 1)}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2 text-sm">
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2 text-sm">
              {mutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Job'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
