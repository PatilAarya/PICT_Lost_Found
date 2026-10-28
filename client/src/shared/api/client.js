// The shared axios instance used to call the server.
import axios from 'axios';
import { getDevUser } from '../auth/devUser.js';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((request) => {
  const devEmail = getDevUser();
  if (import.meta.env.DEV && devEmail) {
    request.headers['x-dev-user'] = devEmail;
  }
  return request;
});

export function errorMessage(err) {
  const serverError = err && err.response && err.response.data && err.response.data.error;
  if (serverError && serverError.message) {
    return serverError.message;
  }
  return 'Could not reach the server. Check your connection and try again.';
}
