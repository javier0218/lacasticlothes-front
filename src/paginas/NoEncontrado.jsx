import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function NoEncontrado() {
  return (
    <Container className="mt-4">
      <h2>404 - Página no encontrada</h2>
      <Link to="/">Volver al inicio</Link>
    </Container>
  );
}
