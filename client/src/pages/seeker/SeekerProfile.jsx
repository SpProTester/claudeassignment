import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { useSeekerStore } from '../../store/seekerStore.js';
import { toast } from '../../store/uiStore.js';
import ExperienceModal from '../../components/seeker/ExperienceModal.jsx';
import EducationModal from '../../components/seeker/EducationModal.jsx';
import CertificationModal from '../../components/seeker/CertificationModal.jsx';
import SkillsInput from '../../components/seeker/SkillsInput.jsx';
import { formatDate } from '../../utils/helpers.js';

// ── Accordion section wrapper ─────────────────────────────────────────────────
function Section({ id, title, subtitle, icon, activeSection, onToggle, children }) {
  const isOpen = activeSection === id;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && <div className="border-t border-gray-100 px-6 py-5">{children}</div>}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Experience / Education / Certification entry row ─────────────────────────
function EntryRow({ title, subtitle, dateRange, onEdit, onDelete, isDeleting }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        {dateRange && <p className="text-xs text-gray-400 mt-0.5">{dateRange}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {isDeleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function dateRangeStr(start, end, isCurrent) {
  const s = formatDate(start);
  if (isCurrent) return `${s} — Present`;
  const e = formatDate(end);
  return e ? `${s} — ${e}` : s;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SeekerProfile() {
  const queryClient = useQueryClient();
  const {
    activeSection, setActiveSection,
    isExperienceModalOpen, editingExperience,
    openExperienceModal, closeExperienceModal,
    isEducationModalOpen, editingEducation,
    openEducationModal, closeEducationModal,
    isCertificationModalOpen, editingCertification,
    openCertificationModal, closeCertificationModal,
  } = useSeekerStore();

  const [skills, setSkills] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['seeker', 'profile'],
    queryFn: seekerService.getProfile,
  });

  const profile = data?.profile;
  const seekerProfile = profile?.seekerProfile;
  const experiences  = profile?.experiences  ?? [];
  const educations   = profile?.educations   ?? [];
  const certifications = profile?.certifications ?? [];

  // ── Personal Info form ──────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      headline: '', summary: '', location: '',
      experienceYears: 0, openToWork: true, profileVisibility: 'public',
    },
  });

  // Populate form once data loads
  useEffect(() => {
    if (seekerProfile) {
      reset({
        headline:          seekerProfile.headline          ?? '',
        summary:           seekerProfile.summary           ?? '',
        location:          seekerProfile.location          ?? '',
        experienceYears:   seekerProfile.experienceYears   ?? 0,
        openToWork:        seekerProfile.openToWork        ?? true,
        profileVisibility: seekerProfile.profileVisibility ?? 'public',
      });
    }
  }, [seekerProfile, reset]);

  // Populate skills
  useEffect(() => {
    if (profile?.skills) setSkills(profile.skills);
  }, [profile?.skills]);

  const profileMutation = useMutation({
    mutationFn: (data) => seekerService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'profile'] });
      toast.success('Profile updated.');
    },
    onError: (err) => toast.error(err.message),
  });

  const skillsMutation = useMutation({
    mutationFn: (skillList) =>
      seekerService.updateProfile({
        skills: skillList
          .filter((s) => !s._isNew) // only saved skills have real IDs
          .map((s) => ({
            skillId: s.id,
            proficiencyLevel: s.SeekerSkill?.proficiencyLevel ?? 'intermediate',
            yearsOfExperience: s.SeekerSkill?.yearsOfExperience ?? null,
          })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'profile'] });
      toast.success('Skills saved.');
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Delete mutations ────────────────────────────────────────────────────
  const makeDeleteMutation = (deleteFn, key) =>
    useMutation({
      mutationFn: deleteFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['seeker', 'profile'] });
        toast.success(`${key} deleted.`);
      },
      onError: (err) => toast.error(err.message),
    });

  const deleteExpMutation  = makeDeleteMutation(seekerService.deleteExperience,    'Experience');
  const deleteEduMutation  = makeDeleteMutation(seekerService.deleteEducation,     'Education');
  const deleteCertMutation = makeDeleteMutation(seekerService.deleteCertification, 'Certification');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          A complete profile helps employers find you faster.
        </p>
      </div>

      <div className="space-y-4">
        {/* ── 1. Personal Info ─────────────────────────────────────────── */}
        <Section
          id="personal"
          title="Personal Info"
          subtitle={seekerProfile?.headline || 'Add a professional headline'}
          icon="👤"
          activeSection={activeSection}
          onToggle={setActiveSection}
        >
          <form onSubmit={handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
            <Field label="Headline" error={errors.headline?.message}>
              <input
                {...register('headline', { maxLength: { value: 255, message: 'Max 255 chars' } })}
                className="input-field"
                placeholder="e.g. Senior Frontend Developer · React · TypeScript"
              />
            </Field>
            <Field label="Summary" error={errors.summary?.message}>
              <textarea
                {...register('summary')}
                rows={4}
                className="input-field resize-none"
                placeholder="Tell employers about yourself, your goals, and what makes you unique…"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location" error={errors.location?.message}>
                <input {...register('location')} className="input-field" placeholder="e.g. Bengaluru, India" />
              </Field>
              <Field label="Years of Experience" error={errors.experienceYears?.message}>
                <input
                  type="number"
                  min={0} max={60}
                  {...register('experienceYears', { min: 0, max: 60, valueAsNumber: true })}
                  className="input-field"
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Profile Visibility">
                <select {...register('profileVisibility')} className="input-field">
                  <option value="public">Public</option>
                  <option value="connections">Connections only</option>
                  <option value="private">Private</option>
                </select>
              </Field>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="openToWork"
                  {...register('openToWork')}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="openToWork" className="text-sm text-gray-700 cursor-pointer">
                  Open to work
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isDirty || profileMutation.isPending}
                className="btn-primary"
              >
                {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Section>

        {/* ── 2. Skills ─────────────────────────────────────────────────── */}
        <Section
          id="skills"
          title="Skills"
          subtitle={`${skills.length} skill${skills.length !== 1 ? 's' : ''} added`}
          icon="🛠️"
          activeSection={activeSection}
          onToggle={setActiveSection}
        >
          <SkillsInput skills={skills} onChange={setSkills} />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => skillsMutation.mutate(skills)}
              disabled={skillsMutation.isPending}
              className="btn-primary"
            >
              {skillsMutation.isPending ? 'Saving…' : 'Save Skills'}
            </button>
          </div>
        </Section>

        {/* ── 3. Work Experience ────────────────────────────────────────── */}
        <Section
          id="experience"
          title="Work Experience"
          subtitle={`${experiences.length} entr${experiences.length !== 1 ? 'ies' : 'y'}`}
          icon="💼"
          activeSection={activeSection}
          onToggle={setActiveSection}
        >
          {experiences.length > 0 ? (
            <div>
              {experiences.map((exp) => (
                <EntryRow
                  key={exp.id}
                  title={`${exp.title} · ${exp.company}`}
                  subtitle={exp.location}
                  dateRange={dateRangeStr(exp.startDate, exp.endDate, exp.isCurrent)}
                  onEdit={() => openExperienceModal(exp)}
                  onDelete={() => deleteExpMutation.mutate(exp.id)}
                  isDeleting={deleteExpMutation.isPending && deleteExpMutation.variables === exp.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No experience added yet.</p>
          )}
          <button
            type="button"
            onClick={() => openExperienceModal(null)}
            className="mt-4 btn-outline w-full text-sm"
          >
            + Add Work Experience
          </button>
        </Section>

        {/* ── 4. Education ──────────────────────────────────────────────── */}
        <Section
          id="education"
          title="Education"
          subtitle={`${educations.length} entr${educations.length !== 1 ? 'ies' : 'y'}`}
          icon="🎓"
          activeSection={activeSection}
          onToggle={setActiveSection}
        >
          {educations.length > 0 ? (
            <div>
              {educations.map((edu) => (
                <EntryRow
                  key={edu.id}
                  title={`${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`}
                  subtitle={edu.institution}
                  dateRange={dateRangeStr(edu.startDate, edu.endDate, edu.isCurrent)}
                  onEdit={() => openEducationModal(edu)}
                  onDelete={() => deleteEduMutation.mutate(edu.id)}
                  isDeleting={deleteEduMutation.isPending && deleteEduMutation.variables === edu.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No education added yet.</p>
          )}
          <button
            type="button"
            onClick={() => openEducationModal(null)}
            className="mt-4 btn-outline w-full text-sm"
          >
            + Add Education
          </button>
        </Section>

        {/* ── 5. Certifications ─────────────────────────────────────────── */}
        <Section
          id="certifications"
          title="Certifications"
          subtitle={`${certifications.length} certification${certifications.length !== 1 ? 's' : ''}`}
          icon="🏆"
          activeSection={activeSection}
          onToggle={setActiveSection}
        >
          {certifications.length > 0 ? (
            <div>
              {certifications.map((cert) => (
                <EntryRow
                  key={cert.id}
                  title={cert.name}
                  subtitle={cert.issuingOrganization}
                  dateRange={cert.issueDate ? `Issued ${formatDate(cert.issueDate)}${cert.expiryDate ? ` · Expires ${formatDate(cert.expiryDate)}` : ''}` : undefined}
                  onEdit={() => openCertificationModal(cert)}
                  onDelete={() => deleteCertMutation.mutate(cert.id)}
                  isDeleting={deleteCertMutation.isPending && deleteCertMutation.variables === cert.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No certifications added yet.</p>
          )}
          <button
            type="button"
            onClick={() => openCertificationModal(null)}
            className="mt-4 btn-outline w-full text-sm"
          >
            + Add Certification
          </button>
        </Section>
      </div>

      {/* Modals */}
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        entry={editingExperience}
        onClose={closeExperienceModal}
      />
      <EducationModal
        isOpen={isEducationModalOpen}
        entry={editingEducation}
        onClose={closeEducationModal}
      />
      <CertificationModal
        isOpen={isCertificationModalOpen}
        entry={editingCertification}
        onClose={closeCertificationModal}
      />
    </div>
  );
}
