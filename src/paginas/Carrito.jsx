import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Image, Button, Table, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { getShippingConfig } from '../services/shippingService';
import { formatPrice } from '../utils/format';
import { PLACEHOLDER_IMAGE } from '../utils/labels';

// Selector de cantidad: si hay una sola unidad mostramos un texto en lugar del input
function CantidadInput({ item, onChange }) {
  if (item.stock <= 1) return <span className="text-muted small">Única unidad</span>;
  return (
    <Form.Control
      type="number"
      min={1}
      max={item.stock}
      value={item.quantity}
      onChange={(e) => onChange(item.id, parseInt(e.target.value, 10) || 1)}
      aria-label={`Cantidad de ${item.title}`}
    />
  );
}

// El envío se calcula en el checkout; acá avisamos cuánto falta para el envío gratis (si está activo)
function AvisoEnvio({ total }) {
  const [freeFrom, setFreeFrom] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getShippingConfig(controller.signal)
      .then((config) => setFreeFrom(config.freeShippingFrom))
      .catch(() => {}); // si falla, mostramos solo el texto general
    return () => controller.abort();
  }, []);

  let mensaje = 'El envío se calcula en el siguiente paso con tu código postal.';
  if (freeFrom && total >= freeFrom) mensaje = '¡Tu compra tiene envío gratis!';
  else if (freeFrom) mensaje = `Te faltan ${formatPrice(freeFrom - total)} para el envío gratis.`;

  return <p className={`small mb-2 ${freeFrom && total >= freeFrom ? 'text-success fw-semibold' : 'text-muted'}`}>{mensaje}</p>;
}

const Carrito = () => {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container className="mt-4 mb-4" style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>Tu carrito está vacío</h3>
        <Link to="/productos">Ver productos</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-4" style={{ padding: '1rem', maxWidth: '100%' }}>
      <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>Carrito de compras</h3>
      <Table responsive bordered hover className="mt-3 align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="d-flex align-items-center">
                  <Image
                    src={item.thumbnail || PLACEHOLDER_IMAGE}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: 64, height: 64, objectFit: 'cover' }}
                    rounded
                  />
                  <Link to={`/productos/${item.slug}`} className="ms-2">{item.title}</Link>
                </div>
              </td>
              <td>{formatPrice(item.price)}</td>
              <td style={{ maxWidth: 140 }}>
                <CantidadInput item={item} onChange={updateQuantity} />
              </td>
              <td>{formatPrice(item.price * item.quantity)}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <Button variant="outline-danger" onClick={clearCart}>Vaciar carrito</Button>
        <div className="text-end">
          <h5 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>Subtotal: {formatPrice(total)}</h5>
          <AvisoEnvio total={total} />
          <Button variant="primary" onClick={() => navigate('/checkout')}>Ir a pagar</Button>
        </div>
      </div>
    </Container>
  );
};

export default Carrito;
