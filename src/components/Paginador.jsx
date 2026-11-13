import { Pagination } from 'react-bootstrap';

// Botones Anterior / Siguiente usando el "meta" que devuelve la API
export default function Paginador({ meta, onChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <Pagination className="justify-content-center align-items-center gap-2">
      <Pagination.Prev disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        Anterior
      </Pagination.Prev>
      <span className="small text-muted">
        Página {meta.page} de {meta.totalPages}
      </span>
      <Pagination.Next disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)}>
        Siguiente
      </Pagination.Next>
    </Pagination>
  );
}
