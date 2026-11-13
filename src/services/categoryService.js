import { apiFetch } from './api';

export function getCategories(signal) {
  return apiFetch('/categories', { signal });
}

// Solo administradores
export function createCategory(name) {
  return apiFetch('/categories', { method: 'POST', body: { name } });
}
