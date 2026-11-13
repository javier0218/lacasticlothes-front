import { Toast, ToastContainer } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';

const ToastMessage = () => {
  const { toasts, hideToast } = useToast();

  return (
    <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 1060 }}>
      {toasts.map((t) => (
        <Toast key={t.id} onClose={() => hideToast(t.id)} show bg={t.variant}>
          <Toast.Header>
            <strong className="me-auto">{t.variant === 'danger' ? 'Error' : 'Notificación'}</strong>
          </Toast.Header>
          <Toast.Body className={t.variant === 'danger' ? 'text-white' : ''}>{t.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default ToastMessage;
