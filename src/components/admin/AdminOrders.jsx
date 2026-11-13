import { Fragment, useEffect, useState } from 'react';
import { Table, Button, Alert, Form } from 'react-bootstrap';
import Cargando from '../Cargando';
import Paginador from '../Paginador';
import OrderItemsList from '../OrderItemsList';
import OrderStatusBadge from '../OrderStatusBadge';
import ShippingDetails from '../ShippingDetails';
import TrackingModal from './TrackingModal';
import { getAllOrders, updateOrderStatus, updateTracking } from '../../services/orderService';
import { isAbortError } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, formatPrice } from '../../utils/format';
import { ORDER_STATUS, PICKUP_STATUS, SHIPPING_METHODS } from '../../utils/labels';

// Qué botones mostrar según el estado actual del pedido (con retiro en persona cambian los textos)
function accionesFor(order) {
  const pickup = order.shipping.method === 'PICKUP';
  const acciones = {
    PENDING_PAYMENT: [{ status: 'CANCELLED', label: 'Cancelar', variant: 'outline-danger' }],
    PAID: [
      { status: 'SHIPPED', label: pickup ? 'Listo para retirar' : 'Marcar enviado', variant: 'primary' },
      { status: 'CANCELLED', label: 'Cancelar', variant: 'outline-danger' },
    ],
    SHIPPED: [{ status: 'DELIVERED', label: pickup ? 'Marcar retirado' : 'Marcar entregado', variant: 'success' }],
  };
  return acciones[order.status] || [];
}

const statusLabel = (order, status) => ((order.shipping.method === 'PICKUP' && PICKUP_STATUS[status]) || ORDER_STATUS[status]).label;

// Detalle del pedido: prendas, envío y pagos
function OrderDetail({ order, onEditTracking }) {
  return (
    <div className="p-2">
      <OrderItemsList order={order} />
      <div className="mt-2">
        <ShippingDetails order={order} admin />
        {order.shipping.trackingNumber && ['SHIPPED', 'DELIVERED'].includes(order.status) && (
          <Button size="sm" variant="link" className="p-0 small" onClick={() => onEditTracking(order)}>
            Corregir número de seguimiento
          </Button>
        )}
      </div>
      {order.payments?.length > 0 && (
        <div className="small mt-1">
          <strong>Pagos:</strong>{' '}
          {order.payments.map((p) => `${p.status} (${formatPrice(p.amount)}, ${formatDateTime(p.createdAt)})`).join(' · ')}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null); // pedido con el detalle abierto
  const [updatingId, setUpdatingId] = useState(null);
  const [tracking, setTracking] = useState(null); // { order, editing } con el modal de seguimiento abierto

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getAllOrders({ status, page, limit: 20 }, controller.signal)
      .then((res) => {
        setOrders(res.data);
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
  }, [status, page]);

  const replaceOrder = (updated) => setOrders((list) => list.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));

  const changeStatus = async (order, newStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm('¿Cancelar este pedido?')) return;
    // Despachar por correo pide el número de seguimiento: lo cargamos en el modal
    if (newStatus === 'SHIPPED' && order.shipping.method !== 'PICKUP') {
      setTracking({ order, editing: false });
      return;
    }
    setUpdatingId(order.id);
    try {
      replaceOrder(await updateOrderStatus(order.id, newStatus));
      showToast(`Pedido marcado como "${statusLabel(order, newStatus)}"`, { variant: 'success' });
    } catch (err) {
      showToast(err.message, { variant: 'danger' });
    } finally {
      setUpdatingId(null);
    }
  };

  // Lo llama el modal; si falla, el modal muestra el error y queda abierto
  const saveTracking = async (trackingNumber) => {
    const { order, editing } = tracking;
    const updated = editing ? await updateTracking(order.id, trackingNumber) : await updateOrderStatus(order.id, 'SHIPPED', { trackingNumber });
    replaceOrder(updated);
    setTracking(null);
    showToast(editing ? 'Número de seguimiento actualizado' : 'Pedido marcado como "Enviado"', { variant: 'success' });
  };

  return (
    <>
      <Form.Select
        className="mb-3"
        style={{ maxWidth: 260 }}
        aria-label="Filtrar por estado"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Todos los estados</option>
        {Object.entries(ORDER_STATUS).map(([value, info]) => (
          <option key={value} value={value}>{info.label}</option>
        ))}
      </Form.Select>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Cargando texto="Cargando pedidos..." />}

      {!loading && !error && (
        <Table bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">No hay pedidos.</td>
              </tr>
            )}
            {orders.map((order) => (
              <Fragment key={order.id}>
                <tr>
                  <td>#{order.id.slice(-8).toUpperCase()}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    {order.user?.name}
                    <div className="small text-muted">{order.user?.email}</div>
                  </td>
                  <td>
                    {formatPrice(order.total)}
                    <div className="small text-muted">{SHIPPING_METHODS[order.shipping.method]?.short}</div>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} method={order.shipping.method} />
                    {/* El backend marca problemas de pago (contracargo, doble cobro...): revisar antes de enviar */}
                    {order.paymentIssue && <div className="small text-danger fw-semibold mt-1">⚠️ {order.paymentIssue}</div>}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <Button size="sm" variant="outline-secondary" onClick={() => setOpenId(openId === order.id ? null : order.id)}>
                        {openId === order.id ? 'Ocultar' : 'Detalle'}
                      </Button>
                      {accionesFor(order).map((accion) => (
                        <Button
                          key={accion.status}
                          size="sm"
                          variant={accion.variant}
                          disabled={updatingId === order.id}
                          onClick={() => changeStatus(order, accion.status)}
                        >
                          {accion.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
                {openId === order.id && (
                  <tr>
                    <td colSpan={6}>
                      <OrderDetail order={order} onEditTracking={(o) => setTracking({ order: o, editing: true })} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </Table>
      )}

      <Paginador meta={meta} onChange={setPage} />

      {tracking && (
        <TrackingModal order={tracking.order} editing={tracking.editing} onSubmit={saveTracking} onHide={() => setTracking(null)} />
      )}
    </>
  );
}
