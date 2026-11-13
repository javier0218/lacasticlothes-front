// Formateadores para mostrar precios y fechas al estilo argentino

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

// formatPrice(15000) -> "$ 15.000,00"
export function formatPrice(value) {
  return priceFormatter.format(Number(value) || 0);
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export function formatDateTime(isoString) {
  if (!isoString) return '';
  return dateTimeFormatter.format(new Date(isoString));
}
