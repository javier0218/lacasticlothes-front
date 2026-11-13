import { apiFetch } from './api';

export function loginRequest(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}

export function registerRequest(name, email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function getMe(signal) {
  return apiFetch('/auth/me', { signal });
}
