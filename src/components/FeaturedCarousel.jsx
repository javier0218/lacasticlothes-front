import { useEffect, useState } from 'react';
import { Carousel, Row, Col, Container, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import Cargando from './Cargando';
import { getProducts } from '../services/productService';
import { isAbortError } from '../services/api';

// Trae los destacados; si no hay ninguno, muestra los más nuevos
async function fetchCarouselProducts(signal) {
  const featured = await getProducts({ featured: 'true', limit: 12 }, signal);
  if (featured.data.length > 0) return featured.data;
  const newest = await getProducts({ sort: 'newest', limit: 12 }, signal);
  return newest.data;
}

const FeaturedCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perPage, setPerPage] = useState(3);

  // Ajustar número de items por slide según ancho de ventana
  useEffect(() => {
    const updatePerPage = () => {
      const w = window.innerWidth;
      if (w < 576) setPerPage(1); // xs
      else if (w < 992) setPerPage(2); // md
      else setPerPage(3); // lg+
    };
    updatePerPage();
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCarouselProducts(controller.signal)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) return <Cargando texto="Cargando destacados..." />;
  if (error) return <Alert variant="danger">No pudimos cargar los destacados: {error}</Alert>;
  if (products.length === 0) return <p>Todavía no hay productos publicados.</p>;

  // Agrupar productos según perPage
  const slides = [];
  for (let i = 0; i < products.length; i += perPage) {
    slides.push(products.slice(i, i + perPage));
  }

  // Iconos SVG personalizados para controles
  const prevIcon = (
    <span aria-hidden="true" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18l-6-6 6-6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const nextIcon = (
    <span aria-hidden="true" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6l6 6-6 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  return (
    <Container>
      <Carousel variant="dark" interval={4000} pause="hover" nextIcon={nextIcon} prevIcon={prevIcon} indicators>
        {slides.map((group, idx) => (
          <Carousel.Item key={idx}>
            <Row className="gx-3">
              {group.map(product => (
                <Col key={product.id} xs={Math.floor(12 / perPage)} className="mb-3">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
}

export default FeaturedCarousel;
