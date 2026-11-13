import { apiFetch } from './api';

// filters: { search, category, featured, sort, page, limit, scope }
export function getProducts(filters = {}, signal) {
  return apiFetch('/products', { query: filters, signal });
}

export function getProduct(idOrSlug, signal) {
  return apiFetch(`/products/${encodeURIComponent(idOrSlug)}`, { signal });
}

// --- Solo administradores ---

// formData: FormData con los campos de texto y las imágenes (campo "images")
export function createProduct(formData) {
  return apiFetch('/products', { method: 'POST', body: formData });
}

export function updateProduct(id, fields) {
  return apiFetch(`/products/${id}`, { method: 'PATCH', body: fields });
}

export function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

export function uploadProductImages(id, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return apiFetch(`/products/${id}/images`, { method: 'POST', body: formData });
}

export function deleteProductImage(id, imageId) {
  return apiFetch(`/products/${id}/images/${imageId}`, { method: 'DELETE' });
}

// La primera imagen de la lista queda como portada
export function reorderProductImages(id, imageIds) {
  return apiFetch(`/products/${id}/images/order`, { method: 'PATCH', body: { imageIds } });
}
