// The one axios instance every module uses to call the server: api.get('/meta/desks').
// withCredentials sends the httpOnly login cookie. In development it also adds the
// x-dev-user header chosen in the DevUserSwitcher. Frozen after Phase 0.
import axios from 'axios';
import { getDevUser } from '../auth/devUser.js';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Before every request, add the dev user header if one is chosen (dev only).
api.interceptors.request.use((request) => {
  const devEmail = getDevUser();
  if (import.meta.env.DEV && devEmail) {
    request.headers['x-dev-user'] = devEmail;
  }
  return request;
});

// Get a message to show people from a failed request ({ error: { message } } from the server).
export function errorMessage(err) {
  const serverError = err && err.response && err.response.data && err.response.data.error;
  if (serverError && serverError.message) {
    return serverError.message;
  }
  return 'Could not reach the server. Check your connection and try again.';
}
