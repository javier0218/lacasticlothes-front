import { Badge } from 'react-bootstrap';
import { ORDER_STATUS, PICKUP_STATUS } from '../utils/labels';

// Muestra el estado del pedido en castellano y con color.
// method: modalidad de envío (con retiro en persona, "Enviado" se muestra como "Listo para retirar")
export default function OrderStatusBadge({ status, method }) {
  const info = (method === 'PICKUP' && PICKUP_STATUS[status]) || ORDER_STATUS[status] || { label: status, bg: 'secondary' };
  return (
    <Badge bg={info.bg} text={info.bg === 'warning' || info.bg === 'info' ? 'dark' : undefined}>
      {info.label}
    </Badge>
  );
}
