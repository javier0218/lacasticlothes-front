import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import Cargando from '../Cargando';
import { payOrder } from '../../services/paymentService';

// Inicializamos el SDK una sola vez por clave pública
let initializedKey = null;
function initSdk(publicKey) {
  if (initializedKey === publicKey) return;
  initMercadoPago(publicKey, { locale: 'es-AR' });
  initializedKey = publicKey;
}

const customization = {
  paymentMethods: { creditCard: 'all', debitCard: 'all', prepaidCard: 'all' },
};

// Formulario oficial de Mercado Pago (Payment Brick).
// Importante: el Brick se vuelve a dibujar si cambian sus props, por eso usamos useMemo/useCallback.
export default function MercadoPagoPayment({ publicKey, order, email, onPaid }) {
  initSdk(publicKey);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const initialization = useMemo(
    () => ({ amount: order.total, payer: { email } }),
    [order.total, email]
  );

  // El Brick espera que devolvamos una Promise: si se rechaza, muestra el error
  const handleSubmit = useCallback(
    ({ formData }) => {
      setError(null);
      return payOrder(order.id, formData)
        .then(onPaid)
        .catch((err) => {
          setError(err.message);
          throw err;
        });
    },
    [order.id, onPaid]
  );

  const handleReady = useCallback(() => setReady(true), []);

  const handleError = useCallback((brickError) => {
    console.error('Error en el Brick de Mercado Pago:', brickError);
    if (brickError?.type === 'critical') {
      setError('No pudimos cargar el formulario de pago. Recargá la página e intentá de nuevo.');
    }
  }, []);

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {!ready && <Cargando texto="Cargando Mercado Pago..." />}
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={handleSubmit}
        onReady={handleReady}
        onError={handleError}
      />
    </>
  );
}
