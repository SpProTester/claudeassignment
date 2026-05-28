import { create } from 'zustand';

export const useSeekerStore = create((set) => ({
  // ── Experience modal ──────────────────────────────────────────────────────
  isExperienceModalOpen: false,
  editingExperience: null, // null → adding new; object → editing existing
  openExperienceModal: (entry = null) =>
    set({ isExperienceModalOpen: true, editingExperience: entry }),
  closeExperienceModal: () =>
    set({ isExperienceModalOpen: false, editingExperience: null }),

  // ── Education modal ───────────────────────────────────────────────────────
  isEducationModalOpen: false,
  editingEducation: null,
  openEducationModal: (entry = null) =>
    set({ isEducationModalOpen: true, editingEducation: entry }),
  closeEducationModal: () =>
    set({ isEducationModalOpen: false, editingEducation: null }),

  // ── Certification modal ───────────────────────────────────────────────────
  isCertificationModalOpen: false,
  editingCertification: null,
  openCertificationModal: (entry = null) =>
    set({ isCertificationModalOpen: true, editingCertification: entry }),
  closeCertificationModal: () =>
    set({ isCertificationModalOpen: false, editingCertification: null }),

  // ── Active profile section (accordion) ───────────────────────────────────
  activeSection: 'personal',
  setActiveSection: (section) =>
    set((s) => ({
      activeSection: s.activeSection === section ? null : section,
    })),
}));
