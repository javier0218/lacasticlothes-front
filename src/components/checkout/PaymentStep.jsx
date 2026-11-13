import { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import Cargando from '../Cargando';
import MercadoPagoPayment from './MercadoPagoPayment';
import FakePayment from './FakePayment';
import { getPaymentConfig } from '../../services/paymentService';
import { isAbortError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Pregunta al backend qué medio de pago usar y muestra el formulario correspondiente
export default function PaymentStep({ order, onPaid }) {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getPaymentConfig(controller.signal)
      .then(setConfig)
      .catch((err) => {
        if (!isAbortError(err)) setError(err.message);
      });
    return () => controller.abort();
  }, []);

  if (error) return <Alert variant="danger">No pudimos cargar los medios de pago: {error}</Alert>;
  if (!config) return <Cargando texto="Cargando medios de pago..." />;

  if (config.provider === 'mercadopago' && config.publicKey) {
    return <MercadoPagoPayment publicKey={config.publicKey} order={order} email={user.email} onPaid={onPaid} />;
  }

  if (config.provider === 'fake') {
    return <FakePayment order={order} email={user.email} onPaid={onPaid} />;
  }

  return <Alert variant="warning">Los pagos no están configurados en este momento.</Alert>;
}
