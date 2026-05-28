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

export default function CertificationModal({ isOpen, entry, onClose }) {
  const isEditing = Boolean(entry);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      reset(
        entry
          ? {
              name: entry.name,
              issuingOrganization: entry.issuingOrganization,
              issueDate: entry.issueDate ?? '',
              expiryDate: entry.expiryDate ?? '',
              credentialId: entry.credentialId ?? '',
              credentialUrl: entry.credentialUrl ?? '',
            }
          : {
              name: '', issuingOrganization: '', issueDate: '',
              expiryDate: '', credentialId: '', credentialUrl: '',
            }
      );
    }
  }, [isOpen, entry, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        issueDate: data.issueDate || null,
        expiryDate: data.expiryDate || null,
        credentialUrl: data.credentialUrl || null,
        credentialId: data.credentialId || null,
      };
      return isEditing
        ? seekerService.updateCertification(entry.id, payload)
        : seekerService.addCertification(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'profile'] });
      toast.success(isEditing ? 'Certification updated.' : 'Certification added.');
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
            {isEditing ? 'Edit Certification' : 'Add Certification'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <Field label="Certification Name *" error={errors.name?.message}>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field"
              placeholder="e.g. AWS Certified Solutions Architect"
            />
          </Field>

          <Field label="Issuing Organisation *" error={errors.issuingOrganization?.message}>
            <input
              {...register('issuingOrganization', { required: 'Organisation is required' })}
              className="input-field"
              placeholder="e.g. Amazon Web Services"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Issue Date" error={errors.issueDate?.message}>
              <input type="date" {...register('issueDate')} className="input-field" />
            </Field>
            <Field label="Expiry Date" error={errors.expiryDate?.message}>
              <input type="date" {...register('expiryDate')} className="input-field" />
            </Field>
          </div>

          <Field label="Credential ID" error={errors.credentialId?.message}>
            <input
              {...register('credentialId')}
              className="input-field"
              placeholder="e.g. ABC123XYZ"
            />
          </Field>

          <Field label="Credential URL" error={errors.credentialUrl?.message}>
            <input
              type="url"
              {...register('credentialUrl')}
              className="input-field"
              placeholder="https://www.credly.com/badges/…"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
