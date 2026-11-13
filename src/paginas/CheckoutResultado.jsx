import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import Cargando from '../components/Cargando';
import OrderItemsList from '../components/OrderItemsList';
import { getOrder } from '../services/orderService';
import { isAbortError } from '../services/api';
import { canPay, getPaymentOutcome } from '../utils/orders';

const MENSAJES = {
  approved: { variant: 'success', titulo: '¡Pago aprobado!', texto: 'Gracias por tu compra. Te vamos a avisar cuando enviemos tu pedido.' },
  pending: { variant: 'info', titulo: 'Pago en proceso', texto: 'Tu pago se está procesando. Cuando se acredite, el pedido pasa a "Pagado".' },
  rejected: { variant: 'danger', titulo: 'Pago rechazado', texto: 'No pudimos cobrar el pago. Podés intentar de nuevo con otro medio de pago.' },
  cancelled: { variant: 'secondary', titulo: 'Pedido cancelado', texto: 'Este pedido fue cancelado.' },
  unpaid: { variant: 'warning', titulo: 'Pago pendiente', texto: 'Todavía no registramos un pago para este pedido.' },
};

export default function CheckoutResultado() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Siempre consultamos el pedido al servidor: es la fuente de verdad
  useEffect(() => {
    const controller = new AbortController();
    getOrder(orderId, controller.signal)
      .then(setOrder)
      .catch((err) => {
        if (!isAbortError(err)) setError(err.message);
      });
    return () => controller.abort();
  }, [orderId]);

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!order) return <Cargando texto="Consultando el estado del pago..." />;

  const outcome = getPaymentOutcome(order);
  const mensaje = MENSAJES[outcome];
  const puedeReintentar = outcome !== 'approved' && canPay(order);

  return (
    <Container className="mt-4 mb-5" style={{ maxWidth: 720 }}>
      <Alert variant={mensaje.variant}>
        <Alert.Heading>{mensaje.titulo}</Alert.Heading>
        <p className="mb-0">{mensaje.texto}</p>
      </Alert>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {puedeReintentar && (
          <Button as={Link} to={`/checkout/pago/${order.id}`} variant="primary">
            Reintentar pago
          </Button>
        )}
        <Button as={Link} to="/perfil" variant="outline-primary">Ver mis pedidos</Button>
        <Button as={Link} to="/productos" variant="outline-secondary">Seguir comprando</Button>
      </div>

      <Card>
        <Card.Header>Pedido #{order.id.slice(-8).toUpperCase()}</Card.Header>
        <Card.Body>
          <OrderItemsList order={order} />
        </Card.Body>
      </Card>
    </Container>
  );
}
