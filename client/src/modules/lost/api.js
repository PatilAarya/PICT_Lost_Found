// All API calls used by the lost screens.
import { api } from '../../shared/api/client.js';

export const getMyReports = () => api.get('/lost/reports/mine').then((res) => res.data.reports);
export const getReport = (id) => api.get(`/lost/reports/${id}`).then((res) => res.data);
export const createReport = (body) => api.post('/lost/reports', body).then((res) => res.data);
export function uploadLostPhoto(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');
  return api.post('/lost/photos', formData).then((res) => res.data.url);
}
export const closeReport = (id) =>
  api.patch(`/lost/reports/${id}/close`).then((res) => res.data.report);

export const getSavedItems = () => api.get('/lost/saved-items').then((res) => res.data.items);
export const createSavedItem = (body) =>
  api.post('/lost/saved-items', body).then((res) => res.data.item);
export const deleteSavedItem = (id) => api.delete(`/lost/saved-items/${id}`);
