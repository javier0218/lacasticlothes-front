import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { firstErrorMessage } from '../../utils/shipping';

// Pide el número de seguimiento de Correo Argentino al despachar un pedido (o para corregirlo).
// onSubmit(trackingNumber) debe devolver una promesa; si falla, el error se muestra en el modal.
// Se monta solo cuando está abierto, así cada vez arranca con el número actual del pedido.
export default function TrackingModal({ order, editing = false, onSubmit, onHide }) {
  const [trackingNumber, setTrackingNumber] = useState(order.shipping.trackingNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(trackingNumber);
    } catch (err) {
      setError(firstErrorMessage(err));
      setSaving(false);
    }
  };

  const s = order.shipping;
  return (
    <Modal show onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title className="h5">
            {editing ? 'Corregir seguimiento' : 'Marcar como enviado'} · #{order.id.slice(-8).toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">
            {s.method === 'BRANCH' ? `A sucursal: ${s.pickupPoint}` : `A domicilio: ${s.address}, ${s.city}`} · {s.fullName}
            {s.dni && `, DNI ${s.dni}`}
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="trackingNumber">
            <Form.Label>Número de seguimiento de Correo Argentino</Form.Label>
            <Form.Control
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ej: HC123456789AR"
              autoFocus
              required
            />
            <Form.Text>Lo encontrás en la etiqueta o en el comprobante de MiCorreo. El cliente lo va a ver en su perfil.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !trackingNumber.trim()}>
            {saving ? 'Guardando...' : editing ? 'Guardar' : 'Marcar enviado'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
