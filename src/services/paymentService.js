import { apiFetch } from './api';

// Devuelve { provider: 'mercadopago' | 'fake', publicKey, currency }
export function getPaymentConfig(signal) {
  return apiFetch('/payments/config', { signal });
}

// formData: lo que entrega el Payment Brick de Mercado Pago (o el formulario de prueba)
export function payOrder(orderId, formData) {
  return apiFetch(`/payments/orders/${orderId}`, { method: 'POST', body: formData });
}
