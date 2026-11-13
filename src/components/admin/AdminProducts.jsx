import { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge } from 'react-bootstrap';
import ProductFormModal from './ProductFormModal';
import Cargando from '../Cargando';
import Paginador from '../Paginador';
import { deleteProduct, getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { isAbortError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import { PLACEHOLDER_IMAGE } from '../../utils/labels';

const SiNo = ({ value }) => (value ? <Badge bg="success">Sí</Badge> : <Badge bg="secondary">No</Badge>);

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [reloadKey, setReloadKey] = useState(0); // al cambiarlo se vuelve a pedir la lista
  // modal: null = cerrado, { product: null } = crear, { product } = editar
  const [modal, setModal] = useState(null);

  const reload = () => setReloadKey((k) => k + 1);

  // Productos (incluye inactivos y agotados)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getProducts({ scope: 'admin', page, limit: 20, sort: 'newest' }, controller.signal)
      .then((res) => {
        setProducts(res.data);
        setMeta(res.meta);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [page, reloadKey]);

  // Categorías para el formulario
  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch((err) => {
        if (!isAbortError(err)) showToast(`No se pudieron cargar las categorías: ${err.message}`, { variant: 'danger' });
      });
    return () => controller.abort();
  }, [showToast]);

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.title}"?`)) return;
    try {
      const result = await deleteProduct(product.id);
      if (result.deleted) {
        showToast('Producto eliminado', { variant: 'success' });
      } else {
        showToast('Este producto ya tiene pedidos: se archivó (quedó inactivo) para conservar el historial.', {
          variant: 'info',
          duration: 6000,
        });
      }
      reload();
    } catch (err) {
      showToast(err.message, { variant: 'danger' });
    }
  };

  return (
    <>
      <Button variant="primary" className="mb-3" onClick={() => setModal({ product: null })}>
        Agregar producto
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Cargando texto="Cargando productos..." />}

      {!loading && !error && (
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Activo</th>
              <th>Destacado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">Todavía no hay productos.</td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.thumbnail || PLACEHOLDER_IMAGE}
                    alt={product.title}
                    loading="lazy"
                    className="rounded"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                  />
                </td>
                <td>{product.title}</td>
                <td>{product.category?.name || '-'}</td>
                <td>{formatPrice(product.price)}</td>
                <td>{product.stock}</td>
                <td><SiNo value={product.active} /></td>
                <td><SiNo value={product.featured} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setModal({ product })}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(product)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Paginador meta={meta} onChange={setPage} />

      {modal && (
        <ProductFormModal
          product={modal.product}
          categories={categories}
          onCategoryCreated={(category) => setCategories((list) => [...list, category])}
          onSaved={reload}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
