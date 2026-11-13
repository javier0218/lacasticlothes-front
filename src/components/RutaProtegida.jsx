import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Cargando from './Cargando';

// Envuelve páginas que necesitan sesión. Con adminOnly, además exige rol ADMIN.
export default function RutaProtegida({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Mientras validamos el token guardado, no redirigimos
  if (loading) return <Cargando texto="Verificando sesión..." />;

  if (!isAuthenticated) {
    // Guardamos a dónde quería ir para volver después del login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">No tenés permisos para ver esta página.</Alert>
      </Container>
    );
  }

  return children;
}
