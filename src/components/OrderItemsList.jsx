import { ListGroup, Image } from 'react-bootstrap';
import { formatPrice } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../utils/labels';
import { formatShippingCost, hasShippingQuote } from '../utils/shipping';

// Lista de prendas de un pedido con el envío y el total
export default function OrderItemsList({ order }) {
  return (
    <ListGroup variant="flush">
      {order.items.map((item) => (
        <ListGroup.Item key={item.id} className="d-flex align-items-center gap-2 px-0">
          <Image
            src={item.imageUrl || PLACEHOLDER_IMAGE}
            alt={item.title}
            loading="lazy"
            rounded
            style={{ width: 48, height: 48, objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <div>{item.title}</div>
            <div className="text-muted small">
              {item.quantity} x {formatPrice(item.unitPrice)}
            </div>
          </div>
          <strong>{formatPrice(item.subtotal)}</strong>
        </ListGroup.Item>
      ))}
      {hasShippingQuote(order) && (
        <ListGroup.Item className="d-flex justify-content-between px-0">
          <span>Envío</span>
          <span>{formatShippingCost(order.shipping.cost)}</span>
        </ListGroup.Item>
      )}
      <ListGroup.Item className="d-flex justify-content-between px-0">
        <strong>Total</strong>
        <strong>{formatPrice(order.total)}</strong>
      </ListGroup.Item>
    </ListGroup>
  );
}
