import { Tabs, Tab } from 'react-bootstrap';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminShipping from '../components/admin/AdminShipping';

// Panel de administración: productos, pedidos y envíos en pestañas
const Admin = () => {
  return (
    <div className="container mt-4 mb-5">
      <h2>Panel de administración</h2>
      <p>Creá, editá y eliminá productos, gestioná los pedidos y configurá los envíos.</p>
      <Tabs defaultActiveKey="productos" className="mb-3" mountOnEnter>
        <Tab eventKey="productos" title="Productos">
          <AdminProducts />
        </Tab>
        <Tab eventKey="pedidos" title="Pedidos">
          <AdminOrders />
        </Tab>
        <Tab eventKey="envios" title="Envíos">
          <AdminShipping />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Admin;
