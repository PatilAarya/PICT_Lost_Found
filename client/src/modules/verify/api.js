// Every call the verify screens make to /api/verify, in one place.
// Each function returns the useful part of the response (not the whole axios object),
// so pages can simply write: const claim = await getClaim(id).
import { api } from '../../shared/api/client.js';

// --- Claimant ---
export const getItemPreview = (foundItemId) =>
  api.get(`/verify/items/${foundItemId}`).then((res) => res.data.item);
export const startClaim = (foundItemId, lostReportId) =>
  api.post('/verify/claims', { foundItemId, lostReportId }).then((res) => res.data.claim);
export const getMyClaims = () => api.get('/verify/claims/mine').then((res) => res.data);
export const getClaim = (id) => api.get(`/verify/claims/${id}`).then((res) => res.data.claim);
export const sendAnswers = (id, answers) =>
  api.post(`/verify/claims/${id}/answer`, { answers }).then((res) => res.data);
export const revealCode = (id) => api.get(`/verify/claims/${id}/code`).then((res) => res.data);
export const confirmHandover = (claimId) =>
  api.post('/verify/handover/confirm', { claimId }).then((res) => res.data.claim);

// --- Desk (handlers and admins) ---
export const getDeskQueue = () => api.get('/verify/desk/queue').then((res) => res.data.claims);
export const getApproved = () => api.get('/verify/desk/approved').then((res) => res.data.claims);
export const decideClaim = (id, decision, note) =>
  api.patch(`/verify/claims/${id}/decision`, { decision, note }).then((res) => res.data);
export const releaseItem = (claimId, code) =>
  api.post('/verify/handover', { claimId, code, idChecked: true }).then((res) => res.data);
export const getIncoming = () => api.get('/verify/incoming').then((res) => res.data.items);
export const receiveItem = (itemId) =>
  api.patch(`/verify/incoming/${itemId}/receive`).then((res) => res.data.item);

// --- Admin ---
export const getAnalytics = (from, to) =>
  api
    .get('/verify/analytics', { params: { from: from || undefined, to: to || undefined } })
    .then((res) => res.data);
export const runIntegrityCheck = () => api.get('/verify/custody/verify').then((res) => res.data);
export const getFlags = () => api.get('/verify/flags').then((res) => res.data.flags);
export const reviewFlag = (id, action) =>
  api.patch(`/verify/flags/${id}`, { action }).then((res) => res.data.flag);
