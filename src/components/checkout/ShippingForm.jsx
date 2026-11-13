import { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { quoteShipping } from '../../services/shippingService';
import { isAbortError } from '../../services/api';
import { PROVINCIAS, SHIPPING_METHODS } from '../../utils/labels';
import { firstErrorMessage, formatDeliveryTime, formatShippingCost, isPostalCodeComplete, normalizePostalCode } from '../../utils/shipping';
import { formatPrice } from '../../utils/format';

// Una opción de envío (radio) con su precio y demora
function ShippingOption({ option, checked, onSelect }) {
  const time = formatDeliveryTime(option.minDays, option.maxDays);
  return (
    <Form.Check type="radio" id={`envio-${option.method}`} className="border rounded p-3 ps-5 mb-2">
      <Form.Check.Input type="radio" name="shippingMethod" checked={checked} onChange={() => onSelect(option.method)} />
      <Form.Check.Label className="w-100">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <div className="fw-semibold">{SHIPPING_METHODS[option.method].label}</div>
            <div className="small text-muted">
              {option.method === 'PICKUP'
                ? `Retirás en ${option.pickupArea}. Te pasamos la dirección exacta al confirmar la compra.`
                : `Llega en ${time} después de despachado`}
            </div>
          </div>
          <div className="text-end">
            {option.free && <div className="small text-muted text-decoration-line-through">{formatPrice(option.regularCost)}</div>}
            <span className={option.cost === 0 ? 'fw-semibold text-success' : 'fw-semibold'}>{formatShippingCost(option.cost)}</span>
          </div>
        </div>
      </Form.Check.Label>
    </Form.Check>
  );
}

// Formulario de envío: destino → opciones con precio → datos según la modalidad.
// items: prendas del carrito (para el envío gratis). onOptionChange(opción | null) avisa qué envío está elegido.
export default function ShippingForm({ defaultName = '', items, sending = false, onSubmit, onOptionChange }) {
  const [form, setForm] = useState({
    method: '',
    fullName: defaultName,
    phone: '',
    dni: '',
    province: '',
    postalCode: '',
    city: '',
    street: '',
    number: '',
    floor: '',
    apartment: '',
    pickupPoint: '',
    notes: '',
  });
  const [quote, setQuote] = useState({ loading: false, data: null, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'postalCode' ? normalizePostalCode(value) : value }));
  };

  // Clave estable de las prendas: así no volvemos a cotizar en cada render
  const itemsKey = useMemo(() => JSON.stringify(items.map((i) => ({ productId: i.id, quantity: i.quantity }))), [items]);
  const canQuote = Boolean(form.province) && isPostalCodeComplete(form.postalCode);

  // Cotizamos cuando hay provincia y código postal completos (con una pequeña espera mientras escribe)
  useEffect(() => {
    if (!canQuote) {
      setQuote({ loading: false, data: null, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setQuote((q) => ({ ...q, loading: true, error: null }));
    const timer = setTimeout(() => {
      quoteShipping({ province: form.province, postalCode: form.postalCode, items: JSON.parse(itemsKey) }, controller.signal)
        .then((data) => {
          setQuote({ loading: false, data, error: null });
          // Si la modalidad elegida no existe para este destino, elegimos la primera disponible
          setForm((f) => (data.options.some((o) => o.method === f.method) ? f : { ...f, method: data.options[0]?.method ?? '' }));
        })
        .catch((err) => {
          if (!isAbortError(err)) setQuote({ loading: false, data: null, error: firstErrorMessage(err) });
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canQuote, form.province, form.postalCode, itemsKey]);

  const selected = quote.data?.options.find((o) => o.method === form.method) ?? null;

  useEffect(() => {
    onOptionChange?.(quote.loading ? null : selected);
  }, [selected, quote.loading, onOptionChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    const base = {
      method: form.method,
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      notes: form.notes.trim() || null,
    };
    if (form.method === 'HOME') {
      onSubmit({ ...base, dni: form.dni, street: form.street, number: form.number, floor: form.floor.trim() || null, apartment: form.apartment.trim() || null });
    } else if (form.method === 'BRANCH') {
      onSubmit({ ...base, dni: form.dni, pickupPoint: form.pickupPoint });
    } else {
      onSubmit({ ...base, dni: form.dni.trim() || null });
    }
  };

  const isPickup = form.method === 'PICKUP';

  return (
    <Form onSubmit={handleSubmit}>
      <h5 className="mb-3">1. ¿A dónde va tu pedido?</h5>
      <Row className="g-3">
        <Col md={5}>
          <Form.Group controlId="envioProvincia">
            <Form.Label>Provincia</Form.Label>
            <Form.Select name="province" autoComplete="address-level1" value={form.province} onChange={handleChange} required>
              <option value="">Elegí una provincia</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="envioCP">
            <Form.Label>Código postal</Form.Label>
            <Form.Control name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={handleChange} maxLength={8} placeholder="1425" required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="envioCiudad">
            <Form.Label>Ciudad / Localidad</Form.Label>
            <Form.Control name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} required={!isPickup} />
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mt-4 mb-3">2. Elegí cómo recibirlo</h5>
      {!canQuote && <p className="text-muted small">Completá la provincia y el código postal para ver las opciones y precios de envío.</p>}
      {quote.loading && (
        <p className="text-muted small">
          <Spinner animation="border" size="sm" className="me-2" />
          Calculando el envío...
        </p>
      )}
      {quote.error && <Alert variant="warning">{quote.error}</Alert>}
      {!quote.loading && quote.data && quote.data.options.length === 0 && (
        <Alert variant="warning">Por ahora no tenemos envíos disponibles para ese destino. Escribinos y lo coordinamos.</Alert>
      )}
      {!quote.loading &&
        quote.data?.options.map((option) => (
          <ShippingOption key={option.method} option={option} checked={form.method === option.method} onSelect={(method) => setForm((f) => ({ ...f, method }))} />
        ))}
      {!quote.loading && quote.data?.freeShippingFrom && quote.data.options.some((o) => o.method !== 'PICKUP' && !o.free) && (
        <p className="small text-muted">
          Envío gratis en compras desde {formatPrice(quote.data.freeShippingFrom)}.
        </p>
      )}

      {selected && (
        <>
          <h5 className="mt-4 mb-3">3. {isPickup ? 'Quién retira' : 'Datos de entrega'}</h5>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="envioNombre">
                <Form.Label>Nombre y apellido</Form.Label>
                <Form.Control name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="envioTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="envioDni">
                <Form.Label>DNI{isPickup && ' (opcional)'}</Form.Label>
                <Form.Control name="dni" inputMode="numeric" value={form.dni} onChange={handleChange} required={!isPickup} placeholder="30123456" />
              </Form.Group>
            </Col>

            {form.method === 'HOME' && (
              <>
                <Col md={6}>
                  <Form.Group controlId="envioCalle">
                    <Form.Label>Calle</Form.Label>
                    <Form.Control name="street" autoComplete="address-line1" value={form.street} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group controlId="envioNumero">
                    <Form.Label>Número</Form.Label>
                    <Form.Control name="number" value={form.number} onChange={handleChange} maxLength={10} required />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group controlId="envioPiso">
                    <Form.Label>Piso</Form.Label>
                    <Form.Control name="floor" value={form.floor} onChange={handleChange} maxLength={10} />
                  </Form.Group>
                </Col>
                <Col xs={4} md={2}>
                  <Form.Group controlId="envioDepto">
                    <Form.Label>Depto</Form.Label>
                    <Form.Control name="apartment" value={form.apartment} onChange={handleChange} maxLength={10} />
                  </Form.Group>
                </Col>
              </>
            )}

            {form.method === 'BRANCH' && (
              <Col xs={12}>
                <Form.Group controlId="envioSucursal">
                  <Form.Label>Sucursal de Correo Argentino donde querés retirar</Form.Label>
                  <Form.Control name="pickupPoint" value={form.pickupPoint} onChange={handleChange} maxLength={200} placeholder="Ej: Sucursal Palermo, Av. Santa Fe 3500" required />
                  <Form.Text>
                    ¿No sabés cuál te queda cerca?{' '}
                    <a href={quote.data.carrier.branchFinderUrl} target="_blank" rel="noopener noreferrer">
                      Buscala en el sitio de Correo Argentino
                    </a>
                    . Para retirar vas a necesitar tu DNI.
                  </Form.Text>
                </Form.Group>
              </Col>
            )}

            <Col xs={12}>
              <Form.Group controlId="envioNotas">
                <Form.Label>{isPickup ? 'Comentarios (opcional)' : 'Notas para la entrega (opcional)'}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder={isPickup ? 'Ej: paso a retirar el sábado' : 'Ej: timbre 2B, entregar por la tarde'}
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      )}

      <Button type="submit" size="lg" className="w-100 mt-4" disabled={sending || !selected}>
        {sending ? 'Reservando tus prendas...' : 'Continuar al pago'}
      </Button>
    </Form>
  );
}
