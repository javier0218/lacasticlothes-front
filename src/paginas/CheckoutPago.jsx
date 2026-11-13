import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import Cargando from '../components/Cargando';
import OrderItemsList from '../components/OrderItemsList';
import OrderStatusBadge from '../components/OrderStatusBadge';
import ShippingDetails from '../components/ShippingDetails';
import PaymentStep from '../components/checkout/PaymentStep';
import { getOrder } from '../services/orderService';
import { isAbortError } from '../services/api';
import { formatDateTime } from '../utils/format';
import { canPay, isReservationExpired } from '../utils/orders';

// Paso 2 del checkout: pagar un pedido ya creado
export default function CheckoutPago() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getOrder(orderId, controller.signal)
      .then(setOrder)
      .catch((err) => {
        if (!isAbortError(err)) setError(err.message);
      });
    return () => controller.abort();
  }, [orderId]);

  // Cuando el servidor responde (aprobado, rechazado o en proceso), vamos a la página de resultado.
  // Esa página vuelve a consultar el pedido, así que no hace falta pasarle la respuesta.
  const handlePaid = useCallback(() => {
    navigate(`/checkout/resultado/${orderId}`);
  }, [navigate, orderId]);

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!order) return <Cargando texto="Cargando tu pedido..." />;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-1">Finalizar compra</h2>
      <p className="text-muted">Paso 2 de 2: pago</p>

      <Row className="g-4">
        <Col lg={7}>
          {canPay(order) ? (
            <>
              {order.expiresAt && (
                <Alert variant="info">
                  Reservamos tus prendas hasta el <strong>{formatDateTime(order.expiresAt)}</strong>.
                  Si no completás el pago antes, vuelven a estar disponibles para otros compradores.
                </Alert>
              )}
              <PaymentStep order={order} onPaid={handlePaid} />
            </>
          ) : (
            <Alert variant="warning">
              {order.status === 'PENDING_PAYMENT' && isReservationExpired(order)
                ? 'La reserva de este pedido venció. Volvé a armar tu carrito para comprar.'
                : 'Este pedido ya no se puede pagar.'}{' '}
              <Link to="/perfil">Ver mis pedidos</Link>
            </Alert>
          )}
        </Col>
        <Col lg={5}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Tu pedido</span>
              <OrderStatusBadge status={order.status} method={order.shipping.method} />
            </Card.Header>
            <Card.Body>
              <OrderItemsList order={order} />
              <div className="mt-2">
                <ShippingDetails order={order} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
