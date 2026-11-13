import { useState } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { deleteProductImage, reorderProductImages } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

// Fotos ya guardadas de un producto (solo al editar): borrar o elegir portada
export default function ExistingImages({ product, onProductChange }) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const images = product.images || [];

  if (images.length === 0) return <p className="text-muted small">Este producto todavía no tiene fotos.</p>;

  // Ejecuta una acción contra la API y actualiza el producto con la respuesta
  const run = async (action) => {
    setBusy(true);
    try {
      const updated = await action();
      onProductChange(updated);
    } catch (err) {
      showToast(err.message, { variant: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (image) => {
    if (!window.confirm('¿Borrar esta foto?')) return;
    run(() => deleteProductImage(product.id, image.id));
  };

  // La portada es la primera imagen de la lista
  const makeCover = (image) => {
    const ids = [image.id, ...images.filter((i) => i.id !== image.id).map((i) => i.id)];
    run(() => reorderProductImages(product.id, ids));
  };

  return (
    <div className="d-flex flex-wrap gap-3 mb-3">
      {images.map((image, index) => (
        <div key={image.id} className="text-center" style={{ width: 110 }}>
          <img
            src={image.thumbnailUrl || image.url}
            alt=""
            loading="lazy"
            className={`rounded border ${index === 0 ? 'border-primary border-2' : ''}`}
            style={{ width: 110, height: 110, objectFit: 'cover' }}
          />
          {index === 0 ? (
            <Badge bg="primary" className="d-block mt-1">Portada</Badge>
          ) : (
            <Button size="sm" variant="outline-primary" className="w-100 mt-1" disabled={busy} onClick={() => makeCover(image)}>
              Hacer portada
            </Button>
          )}
          <Button size="sm" variant="outline-danger" className="w-100 mt-1" disabled={busy} onClick={() => handleDelete(image)}>
            Borrar
          </Button>
        </div>
      ))}
    </div>
  );
}
