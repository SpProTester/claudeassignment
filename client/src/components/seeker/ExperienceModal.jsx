import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { toast } from '../../store/uiStore.js';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function ExperienceModal({ isOpen, entry, onClose }) {
  const isEditing = Boolean(entry);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isOpen) {
      reset(
        entry
          ? {
              company: entry.company,
              title: entry.title,
              location: entry.location ?? '',
              startDate: entry.startDate,
              endDate: entry.endDate ?? '',
              isCurrent: entry.isCurrent,
              description: entry.description ?? '',
            }
          : { company: '', title: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }
      );
    }
  }, [isOpen, entry, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, endDate: data.isCurrent ? null : data.endDate || null };
      return isEditing
        ? seekerService.updateExperience(entry.id, payload)
        : seekerService.addExperience(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'profile'] });
      toast.success(isEditing ? 'Experience updated.' : 'Experience added.');
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit Experience' : 'Add Work Experience'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Job Title *" error={errors.title?.message}>
              <input
                {...register('title', { required: 'Title is required' })}
                className="input-field"
                placeholder="e.g. Frontend Developer"
              />
            </Field>
            <Field label="Company *" error={errors.company?.message}>
              <input
                {...register('company', { required: 'Company is required' })}
                className="input-field"
                placeholder="e.g. Google"
              />
            </Field>
          </div>

          <Field label="Location" error={errors.location?.message}>
            <input
              {...register('location')}
              className="input-field"
              placeholder="e.g. Bengaluru, India"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date *" error={errors.startDate?.message}>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="input-field"
              />
            </Field>
            {!isCurrent && (
              <Field label="End Date" error={errors.endDate?.message}>
                <input type="date" {...register('endDate')} className="input-field" />
              </Field>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isCurrent')}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">I currently work here</span>
          </label>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe your responsibilities and achievements…"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary flex-1"
            >
              {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
