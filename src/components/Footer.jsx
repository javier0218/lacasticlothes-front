import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

const REDES = [
  { nombre: 'Facebook', url: 'https://www.facebook.com', icono: faFacebookF },
  { nombre: 'X (Twitter)', url: 'https://www.twitter.com', icono: faXTwitter },
  { nombre: 'Instagram', url: 'https://www.instagram.com', icono: faInstagram },
];

export default function Footer() {
  return (
    <footer className="p-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-3 mt-auto" style={{ width: '100%' }}>
      <Container fluid>
        <Row className="align-items-center g-3">
          <Col xs={12} md={6}>
            <p className="mb-2 text-center fw-semibold">LACASTI CLOTHES ONLINE.</p>
            <p className="mb-0 text-center fw-semibold">Seguinos a través de nuestras redes sociales</p>
          </Col>
          <Col xs={12} md={6} className="text-center">
            {REDES.map((red) => (
              <a key={red.nombre} href={red.url} className="text-primary-emphasis mx-2" target="_blank" rel="noopener noreferrer" aria-label={red.nombre}>
                <FontAwesomeIcon icon={red.icono} size="2x" />
              </a>
            ))}
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
