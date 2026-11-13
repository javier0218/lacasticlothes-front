import { Navbar, Container, Nav, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import LogoLacasti from './LogoCasti';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Ícono del carrito con la cantidad de prendas
function CartLink({ count }) {
  return (
    <Nav.Link as={Link} to="/carrito" className="text-white px-2 me-2 position-relative" aria-label={`Carrito (${count})`}>
      <FontAwesomeIcon icon={faShoppingCart} size="lg" />
      {count > 0 && (
        <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
          {count}
        </Badge>
      )}
    </Nav.Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="navbar-glass" sticky="top">
      <Container fluid className="px-2 px-md-3">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center flex-shrink-0">
          <span className="me-2 d-inline-flex align-items-center">
            <LogoLacasti size={32} />
          </span>
          <span className="fw-semibold d-none d-sm-inline" style={{ fontSize: '0.95rem' }}>LACASTI CLOTHES</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="me-2" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* grupo izquierdo: links principales */}
          <Nav className="me-auto align-items-center nav-left">
            <Nav.Link as={Link} to="/" className="px-2">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/productos" className="px-2">Productos</Nav.Link>
            <Nav.Link as={Link} to="/ofertas" className="px-2">Ofertas</Nav.Link>
            <Nav.Link as={Link} to="/infaltables" className="px-2">Infaltables</Nav.Link>

            {isAuthenticated && (
              <Nav.Link as={Link} to="/perfil" className="px-2 d-block d-md-inline">Perfil</Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin" className="px-2 d-block d-md-inline">Admin</Nav.Link>
            )}
          </Nav>

          {/* grupo derecho: carrito + login/logout */}
          <Nav className="d-flex align-items-center nav-right">
            <CartLink count={itemCount} />
            {isAuthenticated ? (
              <>
                {/* usuario logueado: nombre con link al perfil */}
                <Nav.Link as={Link} to="/perfil" className="text-white px-2 me-2 d-flex align-items-center" title={user.email}>
                  <FontAwesomeIcon icon={faUserCircle} size="lg" className="me-2" />
                  <span className="text-truncate" style={{ maxWidth: '12rem' }}>Hola, {user.name}</span>
                </Nav.Link>
                <Button variant="outline-light" onClick={cerrarSesion} size="sm">Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="px-2">Ingresar</Nav.Link>
                <Nav.Link as={Link} to="/registro" className="px-2">Crear cuenta</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
