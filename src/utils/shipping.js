// Funciones de ayuda para envíos
import { formatPrice } from './format';

// "c 1425 abc" -> "C1425ABC"
export const normalizePostalCode = (value) => value.toUpperCase().replace(/\s+/g, '');

// ¿Ya está completo para poder cotizar? 4 números (1425) o formato largo (C1425ABC)
export const isPostalCodeComplete = (postalCode) => /^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/.test(postalCode);

export function formatDeliveryTime(minDays, maxDays) {
  if (minDays == null) return '';
  return minDays === maxDays ? `${minDays} días hábiles` : `${minDays} a ${maxDays} días hábiles`;
}

export const formatShippingCost = (cost) => (cost === 0 ? 'Gratis' : formatPrice(cost));

// Los pedidos anteriores al módulo de envíos no tienen correo ni costo calculado: no mostramos "Gratis"
export const hasShippingQuote = (order) => Boolean(order.shipping?.carrier) || order.shipping?.method === 'PICKUP';

// Los errores de validación del servidor traen el detalle por campo: mostramos el primero
export const firstErrorMessage = (err) => err.details?.[0]?.message || err.message;
