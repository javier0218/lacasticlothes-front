import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, ListGroup } from 'react-bootstrap';
import ShippingForm from '../components/checkout/ShippingForm';
import RecaptchaCheckbox from '../components/checkout/RecaptchaCheckbox';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatPrice } from '../utils/format';
import { firstErrorMessage, formatShippingCost } from '../utils/shipping';

// Clave pública de reCAPTCHA v2. Si no está configurada, el checkout funciona sin la casilla.
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Busca en el error del servidor qué prendas del carrito ya no están disponibles.
// "details" puede traer el productId, o un "path" del tipo "items.0.productId".
function findUnavailableItems(details, cartItems) {
  const list = Array.isArray(details) ? details : details ? [details] : [];
  const found = [];
  list.forEach((detail) => {
    const id = detail.productId || detail.id;
    let item = id ? cartItems.find((i) => i.id === id) : null;
    const match = !item && typeof detail.path === 'string' ? detail.path.match(/items\.?\[?(\d+)/) : null;
    if (match) item = cartItems[Number(match[1])];
    if (item && !found.includes(item)) found.push(item);
  });
  return found;
}

// Paso 1 del checkout: datos de envío y creación del pedido
export default function Checkout() {
  const { items, total, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [shippingOption, setShippingOption] = useState(null); // envío elegido (para el resumen)
  const recaptchaRef = useRef(null);

  const handleSubmit = async (shipping) => {
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError('Marcá la casilla "No soy un robot" (arriba del formulario) antes de continuar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSending(true);
    setError(null);
    try {
      const order = await createOrder(
        items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shipping,
        { recaptchaToken }
      );
      // El pedido ya reservó las prendas: vaciamos el carrito y pasamos al pago
      clearCart();
      navigate(`/checkout/pago/${order.id}`);
    } catch (err) {
      setSending(false);
      // Cada token de reCAPTCHA sirve una sola vez: hay que volver a marcar la casilla
      recaptchaRef.current?.reset();
      if (err.status === 409 || err.status === 404) {
        const unavailable = findUnavailableItems(err.details, items);
        if (unavailable.length > 0) {
          unavailable.forEach((i) => removeFromCart(i.id));
          const nombres = unavailable.map((i) => `"${i.title}"`).join(', ');
          setError(`Lo sentimos, ${nombres} ya no está disponible y lo quitamos de tu carrito. Revisá el resumen y volvé a confirmar.`);
          return;
        }
      }
      setError(firstErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return (
      <Container className="mt-4">
        {error && <Alert variant="warning">{error}</Alert>}
        <h3>Tu carrito está vacío</h3>
        <Link to="/productos">Ver productos</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-1">Finalizar compra</h2>
      <p className="text-muted">Paso 1 de 2: datos de envío</p>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col lg={7}>
          <RecaptchaCheckbox ref={recaptchaRef} siteKey={RECAPTCHA_SITE_KEY} onChange={setRecaptchaToken} />
          <Card body>
            <ShippingForm
              defaultName={user?.name || ''}
              items={items}
              sending={sending}
              onSubmit={handleSubmit}
              onOptionChange={setShippingOption}
            />
          </Card>
        </Col>
        <Col lg={5}>
          <Card>
            <Card.Header>Resumen</Card.Header>
            <ListGroup variant="flush">
              {items.map((i) => (
                <ListGroup.Item key={i.id} className="d-flex justify-content-between">
                  <span>{i.quantity} x {i.title}</span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </ListGroup.Item>
              ))}
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Envío</span>
                <span className={shippingOption ? undefined : 'text-muted small'}>
                  {shippingOption ? formatShippingCost(shippingOption.cost) : 'Ingresá tu código postal'}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>{formatPrice(total + (shippingOption?.cost ?? 0))}</span>
              </ListGroup.Item>
            </ListGroup>
            <Card.Footer className="small text-muted">
              Al continuar reservamos tus prendas por 30 minutos para que completes el pago.
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
