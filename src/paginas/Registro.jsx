import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Registro = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await register(form.name, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Crear cuenta</h2>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="registroNombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="registroEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="registroPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" name="password" autoComplete="new-password" minLength={8} value={form.password} onChange={handleChange} required />
                  <Form.Text>Mínimo 8 caracteres.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="registroConfirm">
                  <Form.Label>Repetir contraseña</Form.Label>
                  <Form.Control type="password" name="confirm" autoComplete="new-password" minLength={8} value={form.confirm} onChange={handleChange} required />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={sending}>
                  {sending ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </Form>
              <p className="text-center mt-3 mb-0">
                ¿Ya tenés cuenta? <Link to="/login" state={location.state}>Iniciá sesión</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Registro;
