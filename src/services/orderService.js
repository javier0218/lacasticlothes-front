import { apiFetch } from './api';

// items: [{ productId, quantity }], shipping: { fullName, phone, address, ... }
// recaptchaToken: token de la casilla "No soy un robot" (si el sitio tiene reCAPTCHA configurado)
export function createOrder(items, shipping, { recaptchaToken } = {}) {
  const headers = recaptchaToken ? { 'X-Recaptcha-Token': recaptchaToken } : undefined;
  return apiFetch('/orders', { method: 'POST', body: { items, shipping }, headers });
}

export function getMyOrders(signal) {
  return apiFetch('/orders/mine', { signal });
}

export function getOrder(id, signal) {
  return apiFetch(`/orders/${id}`, { signal });
}

// --- Solo administradores ---

// filters: { status, page, limit }
export function getAllOrders(filters = {}, signal) {
  return apiFetch('/orders', { query: filters, signal });
}

// trackingNumber: obligatorio al marcar como enviado un pedido que va por correo
export function updateOrderStatus(id, status, { trackingNumber } = {}) {
  return apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: { status, trackingNumber } });
}

// Corrige el número de seguimiento de un pedido ya enviado
export function updateTracking(id, trackingNumber) {
  return apiFetch(`/orders/${id}/tracking`, { method: 'PATCH', body: { trackingNumber } });
}
