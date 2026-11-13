import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { SHIPPING_METHODS, SHIPPING_ZONES } from '../utils/labels';
import { formatDeliveryTime, formatShippingCost, hasShippingQuote } from '../utils/shipping';
import { formatDateTime } from '../utils/format';

// Número de seguimiento con botón para copiarlo (el sitio de Correo no tiene link directo por número)
function Tracking({ shipping }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shipping.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso para el portapapeles: el número igual queda a la vista
    }
  };

  return (
    <div className="mt-2">
      <strong>Seguimiento Correo Argentino:</strong> <code className="fs-6">{shipping.trackingNumber}</code>{' '}
      <Button size="sm" variant="outline-secondary" className="py-0" onClick={copy}>
        {copied ? '¡Copiado!' : 'Copiar'}
      </Button>
      {shipping.trackingUrl && (
        <div className="small">
          Pegá el número en el{' '}
          <a href={shipping.trackingUrl} target="_blank" rel="noopener noreferrer">
            seguimiento de envíos de Correo Argentino
          </a>
          .
        </div>
      )}
    </div>
  );
}

// Dónde y cómo se entrega un pedido. admin: muestra también teléfono, DNI, zona y notas.
export default function ShippingDetails({ order, admin = false }) {
  const s = order.shipping;
  const method = SHIPPING_METHODS[s.method] ?? SHIPPING_METHODS.HOME;
  const time = formatDeliveryTime(s.minDays, s.maxDays);
  const place = [s.city, s.province].filter(Boolean).join(', ') + (s.postalCode ? ` (${s.postalCode})` : '');

  return (
    <div className="small">
      {hasShippingQuote(order) && (
        <div>
          <strong>{method.label}</strong> · {formatShippingCost(s.cost)}
          {time && <span className="text-muted"> · {time}</span>}
          {admin && s.zone && <span className="text-muted"> · Zona {SHIPPING_ZONES[s.zone]}</span>}
        </div>
      )}

      {s.method === 'PICKUP' ? (
        <div>
          Retira: {s.fullName}
          {s.pickupPoint && <div>Dónde: {s.pickupPoint}</div>}
        </div>
      ) : s.method === 'BRANCH' ? (
        <div>
          Retira {s.fullName} en: {s.pickupPoint} — {place}
        </div>
      ) : (
        <div>
          Envío a: {s.fullName}, {s.address}, {place}
        </div>
      )}

      {admin && (
        <div className="text-muted">
          Tel. {s.phone}
          {s.dni && <> · DNI {s.dni}</>}
          {s.notes && <> · Notas: {s.notes}</>}
        </div>
      )}
      {!admin && s.notes && <div className="text-muted">Notas: {s.notes}</div>}

      {s.trackingNumber && <Tracking shipping={s} />}
      {s.shippedAt && (
        <div className="text-muted mt-1">
          {s.method === 'PICKUP' ? 'Listo para retirar desde' : 'Despachado el'} {formatDateTime(s.shippedAt)}
          {s.deliveredAt && <> · {s.method === 'PICKUP' ? 'Retirado' : 'Entregado'} el {formatDateTime(s.deliveredAt)}</>}
        </div>
      )}
    </div>
  );
}
