import { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import ImagePicker from './ImagePicker';
import ExistingImages from './ExistingImages';
import CategoryQuickCreate from './CategoryQuickCreate';
import { createProduct, updateProduct, uploadProductImages } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { CONDITION_LABELS } from '../../utils/labels';

const MAX_IMAGES_PER_PRODUCT = 10;
const MAX_IMAGES_PER_UPLOAD = 8;

// Pasa un producto de la API a los valores del formulario
const toFormValues = (product) => ({
  title: product?.title || '',
  description: product?.description || '',
  price: product?.price ?? '',
  stock: product?.stock ?? 1,
  size: product?.size || '',
  brand: product?.brand || '',
  condition: product?.condition || 'VERY_GOOD',
  categoryId: product?.category?.id || '',
  featured: product?.featured ?? false,
  active: product?.active ?? true,
});

// Datos para PATCH (JSON). Los campos vacíos se mandan como null.
const toJsonBody = (form) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  price: Number(form.price),
  stock: Number(form.stock),
  size: form.size.trim() || null,
  brand: form.brand.trim() || null,
  condition: form.condition,
  categoryId: form.categoryId || null,
  featured: form.featured,
  active: form.active,
});

// Datos para POST (multipart/form-data): todo viaja como texto + las imágenes
const toFormData = (form, files) => {
  const data = new FormData();
  data.append('title', form.title.trim());
  data.append('price', form.price);
  data.append('stock', form.stock);
  data.append('condition', form.condition);
  data.append('featured', String(form.featured));
  data.append('active', String(form.active));
  if (form.description.trim()) data.append('description', form.description.trim());
  if (form.size.trim()) data.append('size', form.size.trim());
  if (form.brand.trim()) data.append('brand', form.brand.trim());
  if (form.categoryId) data.append('categoryId', form.categoryId);
  files.forEach((file) => data.append('images', file));
  return data;
};

/**
 * Modal para crear (product = null) o editar un producto.
 * onSaved se llama cada vez que algo cambió en el servidor (para recargar la tabla).
 */
export default function ProductFormModal({ product, categories, onCategoryCreated, onSaved, onClose }) {
  const { showToast } = useToast();
  const [current, setCurrent] = useState(product); // producto actualizado (cambia al tocar las fotos)
  const [form, setForm] = useState(() => toFormValues(product));
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = Boolean(current);
  const existingCount = current?.images?.length || 0;
  const maxNewFiles = Math.min(MAX_IMAGES_PER_UPLOAD, MAX_IMAGES_PER_PRODUCT - existingCount);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImagesChanged = (updatedProduct) => {
    setCurrent(updatedProduct);
    onSaved();
  };

  const handleCategoryCreated = (category) => {
    onCategoryCreated(category);
    setForm({ ...form, categoryId: category.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateProduct(current.id, toJsonBody(form));
        if (newFiles.length > 0) await uploadProductImages(current.id, newFiles);
      } else {
        await createProduct(toFormData(form, newFiles));
      }
      showToast(isEdit ? 'Producto actualizado' : 'Producto creado', { variant: 'success' });
      onSaved();
      onClose();
    } catch (err) {
      setError(err);
      showToast(err.message, { variant: 'danger' });
      setSaving(false);
    }
  };

  return (
    <Modal show onHide={saving ? undefined : onClose} size="lg" backdrop={saving ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{isEdit ? 'Editar producto' : 'Agregar producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              {error.message}
              {Array.isArray(error.details) && (
                <ul className="mb-0 mt-1 small">
                  {error.details.map((d, i) => (
                    <li key={i}>{d.path ? `${d.path}: ` : ''}{d.message}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="productoTitulo">
            <Form.Label>Título *</Form.Label>
            <Form.Control name="title" value={form.title} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="productoDescripcion">
            <Form.Label>Descripción</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col xs={6} md={3}>
              <Form.Group controlId="productoPrecio">
                <Form.Label>Precio (ARS) *</Form.Label>
                <Form.Control type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group controlId="productoStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" min="0" step="1" name="stock" value={form.stock} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group controlId="productoTalle">
                <Form.Label>Talle</Form.Label>
                <Form.Control name="size" value={form.size} onChange={handleChange} placeholder="M, 42, Única..." />
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group controlId="productoMarca">
                <Form.Label>Marca</Form.Label>
                <Form.Control name="brand" value={form.brand} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group controlId="productoEstado">
                <Form.Label>Estado de la prenda</Form.Label>
                <Form.Select name="condition" value={form.condition} onChange={handleChange}>
                  {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="productoCategoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select name="categoryId" value={form.categoryId} onChange={handleChange}>
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <CategoryQuickCreate onCreated={handleCategoryCreated} />
            </Col>
          </Row>

          <div className="d-flex gap-4 mb-3">
            <Form.Check type="switch" id="productoDestacado" name="featured" label="Destacado" checked={form.featured} onChange={handleChange} />
            <Form.Check type="switch" id="productoActivo" name="active" label="Activo (visible en la tienda)" checked={form.active} onChange={handleChange} />
          </div>

          {isEdit && (
            <>
              <h6>Fotos actuales</h6>
              <ExistingImages product={current} onProductChange={handleImagesChanged} />
            </>
          )}

          <ImagePicker files={newFiles} onChange={setNewFiles} maxFiles={maxNewFiles} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {newFiles.length > 0 ? `Subiendo ${newFiles.length} foto(s)...` : 'Guardando...'}
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
