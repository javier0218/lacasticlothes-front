// Textos en castellano para los valores que manda el backend

export const CONDITION_LABELS = {
  NEW_WITH_TAGS: 'Nuevo con etiqueta',
  LIKE_NEW: 'Como nuevo',
  VERY_GOOD: 'Muy bueno',
  GOOD: 'Bueno',
};

// label: texto a mostrar, bg: color del Badge de Bootstrap
export const ORDER_STATUS = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', bg: 'warning' },
  PAID: { label: 'Pagado', bg: 'success' },
  SHIPPED: { label: 'Enviado', bg: 'info' },
  DELIVERED: { label: 'Entregado', bg: 'primary' },
  CANCELLED: { label: 'Cancelado', bg: 'secondary' },
};

// Con retiro en persona, "enviado" significa que ya se puede pasar a buscar
export const PICKUP_STATUS = {
  SHIPPED: { label: 'Listo para retirar', bg: 'info' },
  DELIVERED: { label: 'Retirado', bg: 'primary' },
};

export const SHIPPING_METHODS = {
  HOME: { label: 'Envío a domicilio', short: 'A domicilio' },
  BRANCH: { label: 'Retiro en sucursal de Correo Argentino', short: 'A sucursal' },
  PICKUP: { label: 'Retiro en persona', short: 'Retiro en persona' },
};

export const SHIPPING_ZONES = {
  CABA: 'CABA',
  AMBA: 'AMBA (conurbano y La Plata)',
  INTERIOR: 'Interior',
  PATAGONIA: 'Patagonia',
};

export const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

// Imagen gris para productos sin foto
export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<rect width="400" height="400" fill="#e9ecef"/>' +
      '<text x="200" y="210" font-family="Arial" font-size="24" fill="#6c757d" text-anchor="middle">Sin foto</text>' +
      '</svg>'
  );
