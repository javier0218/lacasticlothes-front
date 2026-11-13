import { useState, useEffect } from 'react';
import { Row, Col, Container, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import Cargando from './Cargando';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { isAbortError } from '../services/api';

const PAGE_SIZE = 12;

/**
 * Lista de productos con búsqueda, filtro por categoría, orden y "Cargar más".
 * Props:
 *  - category: slug de categoría fija (si viene, se oculta el selector de categorías)
 *  - featured: true para mostrar solo destacados
 *  - initialSort: 'newest' | 'price_asc' | 'price_desc'
 */
const ProductList = ({ category = null, featured = false, initialSort = 'newest' }) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState(''); // lo que escribe el usuario
  const [search, setSearch] = useState(''); // lo que se manda a la API (con demora)
  const [sort, setSort] = useState(initialSort);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);

  const categoryFilter = category || selectedCategory;

  // Esperamos 400 ms después de la última tecla antes de buscar en el servidor
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Categorías para el selector (solo si no hay una categoría fija)
  useEffect(() => {
    if (category) return;
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {}); // si falla, simplemente no mostramos el filtro
    return () => controller.abort();
  }, [category]);

  // Traer productos cada vez que cambia un filtro o la página
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const filters = {
      search,
      category: categoryFilter,
      featured: featured ? 'true' : undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    };

    getProducts(filters, controller.signal)
      .then((res) => {
        // Página 1 reemplaza la lista; las siguientes se agregan al final
        setProducts((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setMeta(res.meta);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [search, categoryFilter, featured, sort, page]);

  const changeSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const changeCategory = (value) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const hayMas = meta && meta.page < meta.totalPages;

  return (
    <Container className="mt-4">
      <Row className="mb-3 g-2">
        <Col xs={12} md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Buscar por nombre, marca o descripción"
              aria-label="Buscar productos"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setQuery('')}>
              Limpiar
            </Button>
          </InputGroup>
        </Col>
        {!category && (
          <Col xs={6} md={3}>
            <Form.Select aria-label="Categoría" value={selectedCategory} onChange={(e) => changeCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </Form.Select>
          </Col>
        )}
        <Col xs={6} md={3}>
          <Form.Select aria-label="Ordenar" value={sort} onChange={(e) => changeSort(e.target.value)}>
            <option value="newest">Más nuevos</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </Form.Select>
        </Col>
      </Row>

      {error && <Alert variant="danger">No pudimos cargar los productos: {error}</Alert>}

      {!loading && !error && products.length === 0 && (
        <p>No se encontraron productos{search ? ` para "${search}"` : ''}.</p>
      )}

      <Row>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={6} lg={4} className="mb-4">
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {loading && <Cargando texto="Cargando productos..." />}

      {!loading && hayMas && (
        <div className="text-center mb-4">
          <Button variant="outline-primary" onClick={() => setPage((p) => p + 1)}>
            Cargar más
          </Button>
          <div className="text-muted small mt-1">
            Mostrando {products.length} de {meta.total}
          </div>
        </div>
      )}
    </Container>
  );
};

export default ProductList;
