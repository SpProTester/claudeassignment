import { create } from 'zustand';

let toastId = 0;

export const useUIStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => get().removeToast(id), duration);
    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers (call outside of React components too)
export const toast = {
  success: (message) =>
    useUIStore.getState().addToast({ type: 'success', message }),
  error: (message) =>
    useUIStore.getState().addToast({ type: 'error', message }),
  info: (message) =>
    useUIStore.getState().addToast({ type: 'info', message }),
};
