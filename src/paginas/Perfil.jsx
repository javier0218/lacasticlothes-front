import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Accordion, Alert, Button } from 'react-bootstrap';
import Cargando from '../components/Cargando';
import OrderItemsList from '../components/OrderItemsList';
import OrderStatusBadge from '../components/OrderStatusBadge';
import ShippingDetails from '../components/ShippingDetails';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { isAbortError } from '../services/api';
import { formatDateTime, formatPrice } from '../utils/format';
import { canPay } from '../utils/orders';

// Un pedido dentro del acordeón
function PedidoItem({ order }) {
  return (
    <Accordion.Item eventKey={order.id}>
      <Accordion.Header>
        <div className="d-flex flex-wrap gap-2 align-items-center w-100 me-2">
          <span className="fw-semibold">#{order.id.slice(-8).toUpperCase()}</span>
          <span className="text-muted small">{formatDateTime(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} method={order.shipping.method} />          <span className="ms-auto">{formatPrice(order.total)}</span>
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <OrderItemsList order={order} />
        <div className="mt-2 mb-2">
          <ShippingDetails order={order} />
        </div>
        {canPay(order) && (
          <Button as={Link} to={`/checkout/pago/${order.id}`} size="sm">
            Pagar ahora (reservado hasta {formatDateTime(order.expiresAt)})
          </Button>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default function Perfil() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getMyOrders(controller.signal)
      .then(setOrders)
      .catch((err) => {
        if (!isAbortError(err)) setError(err.message);
      });
    return () => controller.abort();
  }, []);

  return (
    <Container className="mt-4 mb-5">
      <h2>Mi perfil</h2>
      <Card body className="mb-4">
        <div><strong>Nombre:</strong> {user.name}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Cliente desde:</strong> {formatDateTime(user.createdAt)}</div>
      </Card>

      <h3 className="h4">Mis pedidos</h3>
      {error && <Alert variant="danger">No pudimos cargar tus pedidos: {error}</Alert>}
      {!error && !orders && <Cargando texto="Cargando pedidos..." />}
      {orders && orders.length === 0 && (
        <p>Todavía no hiciste ninguna compra. <Link to="/productos">Ver productos</Link></p>
      )}
      {orders && orders.length > 0 && (
        <Accordion>
          {orders.map((order) => (
            <PedidoItem key={order.id} order={order} />
          ))}
        </Accordion>
      )}
    </Container>
  );
}
