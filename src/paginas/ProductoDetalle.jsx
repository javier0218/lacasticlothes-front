import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import ImageGallery from '../components/ImageGallery';
import Cargando from '../components/Cargando';
import { getProduct } from '../services/productService';
import { isAbortError } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { CONDITION_LABELS } from '../utils/labels';

export default function ProductoDetalle() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, getQuantity } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getProduct(slug, controller.signal)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.status === 404 ? 'Esta prenda no existe o ya no está disponible.' : err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [slug]);

  if (loading) return <Cargando texto="Cargando prenda..." />;

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">{error}</Alert>
        <Link to="/productos">Volver a productos</Link>
      </Container>
    );
  }

  const agotado = product.stock <= 0;
  const yaEnCarrito = !agotado && getQuantity(product.id) >= product.stock;

  const handleAdd = () => {
    if (addToCart(product)) showToast(`"${product.title}" se agregó al carrito`);
  };

  return (
    <Container className="mt-4 mb-5">
      <Link to="/productos" className="d-inline-block mb-3">&larr; Volver a productos</Link>
      <Row className="g-4">
        <Col md={7}>
          <ImageGallery images={product.images} title={product.title} />
        </Col>
        <Col md={5}>
          {product.category && <div className="text-muted small mb-1">{product.category.name}</div>}
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{product.title}</h1>
          <p className="fs-3 fw-bold mb-3">{formatPrice(product.price)}</p>

          <ul className="list-unstyled mb-3">
            {product.size && <li><strong>Talle:</strong> {product.size}</li>}
            {product.brand && <li><strong>Marca:</strong> {product.brand}</li>}
            <li><strong>Estado:</strong> {CONDITION_LABELS[product.condition] || product.condition}</li>
            <li>
              <strong>Disponibilidad:</strong>{' '}
              {agotado ? (
                <Badge bg="secondary">Agotado</Badge>
              ) : product.stock === 1 ? (
                <Badge bg="light" text="dark" className="border">Única unidad</Badge>
              ) : (
                `${product.stock} unidades`
              )}
            </li>
          </ul>

          <Button size="lg" className="w-100 mb-3" onClick={handleAdd} disabled={agotado || yaEnCarrito}>
            {agotado ? 'Agotado' : yaEnCarrito ? 'Ya está en tu carrito' : 'Agregar al carrito'}
          </Button>
          {yaEnCarrito && <Link to="/carrito">Ir al carrito</Link>}

          {product.description && (
            <>
              <h2 className="h5 mt-3">Descripción</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}
