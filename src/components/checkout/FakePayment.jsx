import { useState } from 'react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';
import { payOrder } from '../../services/paymentService';
import { formatPrice } from '../../utils/format';

// Pago simulado: solo aparece cuando el backend está en modo "fake" (desarrollo)
export default function FakePayment({ order, email, onPaid }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setSending(true);
    setError(null);
    try {
      const result = await payOrder(order.id, {
        token: 'fake',
        payment_method_id: 'visa',
        installments: 1,
        payer: { email },
      });
      onPaid(result);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <Card border="warning">
      <Card.Header className="bg-warning-subtle">
        <Badge bg="warning" text="dark" className="me-2">Modo de prueba</Badge>
        No se cobra dinero real
      </Card.Header>
      <Card.Body>
        <p>
          La tienda está en modo de prueba. Al tocar el botón se simula un pago con tarjeta
          por <strong>{formatPrice(order.total)}</strong>.
        </p>
        <p className="small text-muted">
          El pago se aprueba siempre, salvo que el email de tu cuenta empiece con "reject" (rechazado)
          o con "pending" (en proceso). Email usado: {email}
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="success" size="lg" className="w-100" onClick={handlePay} disabled={sending}>
          {sending ? 'Procesando...' : 'Pagar (simulado)'}
        </Button>
      </Card.Body>
    </Card>
  );
}
