import { apiFetch } from './api';

// Envío gratis desde, retiro en persona y links de Correo Argentino
export function getShippingConfig(signal) {
  return apiFetch('/shipping/config', { signal });
}

// Opciones y precios para un destino. items: [{ productId, quantity }] (para el envío gratis)
export function quoteShipping({ province, postalCode, items = [] }, signal) {
  return apiFetch('/shipping/quote', { method: 'POST', body: { province, postalCode, items }, signal });
}

// --- Solo administradores ---

export function getShippingSettings(signal) {
  return apiFetch('/shipping/settings', { signal });
}

export function saveShippingSettings(settings) {
  return apiFetch('/shipping/settings', { method: 'PUT', body: settings });
}
