import { useEffect, useState } from 'react';
import { Table, Form, Button, Alert, Card, Row, Col, InputGroup } from 'react-bootstrap';
import Cargando from '../Cargando';
import { getShippingSettings, saveShippingSettings } from '../../services/shippingService';
import { isAbortError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SHIPPING_METHODS, SHIPPING_ZONES } from '../../utils/labels';
import { firstErrorMessage } from '../../utils/shipping';
import { formatDateTime } from '../../utils/format';

// Los inputs trabajan con texto; al guardar se convierten a números
const toForm = (settings) => ({
  ...settings,
  freeShippingEnabled: settings.freeShippingFrom !== null,
  freeShippingFrom: settings.freeShippingFrom === null ? '' : String(settings.freeShippingFrom),
  pickupArea: settings.pickupArea || '',
  pickupAddress: settings.pickupAddress || '',
  pickupInstructions: settings.pickupInstructions || '',
  rates: settings.rates.map((r) => ({ ...r, price: String(r.price), minDays: String(r.minDays), maxDays: String(r.maxDays) })),
});

const toPayload = (form) => ({
  freeShippingFrom: form.freeShippingEnabled ? Number(form.freeShippingFrom) : null,
  pickupEnabled: form.pickupEnabled,
  pickupArea: form.pickupArea,
  pickupAddress: form.pickupAddress,
  pickupInstructions: form.pickupInstructions,
  rates: form.rates.map((r) => ({ ...r, price: Number(r.price), minDays: Number(r.minDays), maxDays: Number(r.maxDays) })),
});

// Configuración de envíos: tarifas de Correo Argentino por zona, envío gratis y retiro en persona
export default function AdminShipping() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getShippingSettings(controller.signal)
      .then((settings) => {
        setForm(toForm(settings));
        setUpdatedAt(settings.updatedAt);
      })
      .catch((err) => {
        if (!isAbortError(err)) setLoadError(err.message);
      });
    return () => controller.abort();
  }, []);

  if (loadError) return <Alert variant="danger">{loadError}</Alert>;
  if (!form) return <Cargando texto="Cargando configuración de envíos..." />;

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const setRate = (index, name, value) =>
    setForm((f) => ({ ...f, rates: f.rates.map((r, i) => (i === index ? { ...r, [name]: value } : r)) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await saveShippingSettings(toPayload(form));
      setForm(toForm(saved));
      setUpdatedAt(saved.updatedAt);
      showToast('Configuración de envíos guardada', { variant: 'success' });
    } catch (err) {
      setSaveError(firstErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <p className="text-muted">
        Precios que paga el cliente por enviar con <strong>Correo Argentino</strong>. Revisalos cada vez que el correo actualice
        sus tarifas (las podés cotizar en MiCorreo). La zona se calcula con la provincia y el código postal del cliente.
      </p>
      {saveError && <Alert variant="danger">{saveError}</Alert>}

      <Table bordered responsive size="sm" className="align-middle">
        <thead>
          <tr>
            <th>Zona</th>
            <th>Modalidad</th>
            <th style={{ minWidth: 140 }}>Precio</th>
            <th style={{ minWidth: 170 }}>Demora (días hábiles)</th>
            <th>Activa</th>
          </tr>
        </thead>
        <tbody>
          {form.rates.map((rate, index) => (
            <tr key={`${rate.zone}-${rate.method}`} className={rate.active ? undefined : 'text-muted'}>
              <td>{SHIPPING_ZONES[rate.zone]}</td>
              <td>{SHIPPING_METHODS[rate.method].short}</td>
              <td>
                <InputGroup size="sm">
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label={`Precio ${rate.zone} ${rate.method}`}
                    value={rate.price}
                    onChange={(e) => setRate(index, 'price', e.target.value)}
                    required
                  />
                </InputGroup>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1">
                  <Form.Control size="sm" type="number" min="0" max="60" aria-label="Mínimo" value={rate.minDays} onChange={(e) => setRate(index, 'minDays', e.target.value)} required />
                  <span>a</span>
                  <Form.Control size="sm" type="number" min="0" max="90" aria-label="Máximo" value={rate.maxDays} onChange={(e) => setRate(index, 'maxDays', e.target.value)} required />
                </div>
              </td>
              <td>
                <Form.Check
                  type="switch"
                  id={`activa-${rate.zone}-${rate.method}`}
                  aria-label="Activa"
                  checked={rate.active}
                  onChange={(e) => setRate(index, 'active', e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="g-3">
        <Col lg={5}>
          <Card body className="h-100">
            <Form.Check
              type="switch"
              id="envioGratis"
              label={<strong>Envío gratis desde un monto</strong>}
              checked={form.freeShippingEnabled}
              onChange={(e) => setField('freeShippingEnabled', e.target.checked)}
            />
            {form.freeShippingEnabled && (
              <Form.Group controlId="envioGratisMonto" className="mt-2">
                <Form.Label className="small">Compras desde (sin contar el envío)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control type="number" min="1" step="0.01" value={form.freeShippingFrom} onChange={(e) => setField('freeShippingFrom', e.target.value)} required />
                </InputGroup>
                <Form.Text>Aplica a domicilio y a sucursal, en todas las zonas activas.</Form.Text>
              </Form.Group>
            )}
          </Card>
        </Col>
        <Col lg={7}>
          <Card body className="h-100">
            <Form.Check
              type="switch"
              id="retiroPersona"
              label={<strong>Retiro en persona (gratis)</strong>}
              checked={form.pickupEnabled}
              onChange={(e) => setField('pickupEnabled', e.target.checked)}
            />
            {form.pickupEnabled && (
              <Row className="g-2 mt-1">
                <Col md={5}>
                  <Form.Group controlId="retiroZona">
                    <Form.Label className="small">Zona (la ve todo el mundo)</Form.Label>
                    <Form.Control value={form.pickupArea} onChange={(e) => setField('pickupArea', e.target.value)} placeholder="Palermo, CABA" maxLength={100} required />
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group controlId="retiroDireccion">
                    <Form.Label className="small">Dirección exacta (solo quien compra)</Form.Label>
                    <Form.Control value={form.pickupAddress} onChange={(e) => setField('pickupAddress', e.target.value)} maxLength={200} required />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group controlId="retiroIndicaciones">
                    <Form.Label className="small">Días, horarios e indicaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={form.pickupInstructions}
                      onChange={(e) => setField('pickupInstructions', e.target.value)}
                      placeholder="Lunes a viernes de 10 a 18. Avisanos por WhatsApp antes de venir."
                      maxLength={500}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>

      <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        {updatedAt && <span className="small text-muted">Última modificación: {formatDateTime(updatedAt)}</span>}
      </div>
    </Form>
  );
}
