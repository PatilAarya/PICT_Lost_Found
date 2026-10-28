// Every call the lost screens make to /api/lost, in one place.
// Each function returns the useful part of the response, so pages can simply write
// const reports = await getMyReports();
import { api } from '../../shared/api/client.js';

export const getMyReports = () => api.get('/lost/reports/mine').then((res) => res.data.reports);
export const getReport = (id) => api.get(`/lost/reports/${id}`).then((res) => res.data);
export const createReport = (body) => api.post('/lost/reports', body).then((res) => res.data);
// Upload the optional photo (a Blob) as a form; returns the URL to save on the report.
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
