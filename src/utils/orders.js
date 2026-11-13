// Funciones de ayuda para pedidos

// ¿Ya venció la reserva de stock del pedido?
export function isReservationExpired(order) {
  return Boolean(order.expiresAt) && new Date(order.expiresAt).getTime() < Date.now();
}

// Se puede pagar si sigue pendiente de pago y la reserva no venció
export function canPay(order) {
  return order.status === 'PENDING_PAYMENT' && !isReservationExpired(order);
}

// Resultado del pago para mostrar al usuario: approved | pending | rejected | cancelled | unpaid
export function getPaymentOutcome(order) {
  if (['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)) return 'approved';
  if (order.status === 'CANCELLED') return 'cancelled';

  // Tomamos el pago más reciente
  const payments = [...(order.payments || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const last = payments[0];
  if (!last) return 'unpaid';
  if (last.status === 'APPROVED') return 'approved';
  if (last.status === 'PENDING' || last.status === 'IN_PROCESS') return 'pending';
  return 'rejected';
}
