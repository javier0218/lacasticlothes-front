import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';
import { CONDITION_LABELS, PLACEHOLDER_IMAGE } from '../utils/labels';

const ProductCard = ({ product }) => {
  const { addToCart, getQuantity } = useCart();
  const { showToast } = useToast();

  const agotado = product.stock <= 0;
  const yaEnCarrito = !agotado && getQuantity(product.id) >= product.stock;
  const linkDetalle = `/productos/${product.slug}`;

  const handleAdd = () => {
    if (addToCart(product)) {
      showToast(`"${product.title}" se agregó al carrito`);
    } else {
      showToast('No hay más unidades disponibles de esta prenda', { variant: 'warning' });
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Link to={linkDetalle}>
        <Card.Img
          variant="top"
          src={product.thumbnail || PLACEHOLDER_IMAGE}
          alt={product.title}
          loading="lazy"
          style={{ height: 'clamp(180px, 28vw, 260px)', objectFit: 'cover' }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>
          <Link to={linkDetalle} className="text-reset text-decoration-none">{product.title}</Link>
        </Card.Title>

        <div className="d-flex flex-wrap gap-1 mb-2">
          {product.size && <Badge bg="dark">Talle {product.size}</Badge>}
          {CONDITION_LABELS[product.condition] && (
            <Badge bg="info" text="dark">{CONDITION_LABELS[product.condition]}</Badge>
          )}
          {product.stock === 1 && <Badge bg="light" text="dark" className="border">Única unidad</Badge>}
        </div>

        <Card.Text className="mt-auto mb-0">
          <strong style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>{formatPrice(product.price)}</strong>
        </Card.Text>
        <Button variant="primary" onClick={handleAdd} disabled={agotado || yaEnCarrito} className="mt-2" style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
          {agotado ? 'Agotado' : yaEnCarrito ? 'Ya está en tu carrito' : 'Agregar al carrito'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
