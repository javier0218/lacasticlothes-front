import { Spinner } from 'react-bootstrap';

// Indicador de carga reutilizable
export default function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-4 text-muted">
      <Spinner animation="border" size="sm" role="status" />
      <span>{texto}</span>
    </div>
  );
}
