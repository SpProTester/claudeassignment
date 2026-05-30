import api from './api.js';

export const paymentsService = {
  getPlans:       ()      => api.get('/payments/plans'),
  getBilling:     ()      => api.get('/payments/billing'),
  createCheckout: (plan)  => api.post('/payments/create-checkout', { plan }),
  cancel:         ()      => api.post('/payments/cancel'),
};
