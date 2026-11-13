import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import Home from './paginas/Home';
import Productos from './paginas/Productos';
import ProductoDetalle from './paginas/ProductoDetalle';
import Ofertas from './paginas/Ofertas';
import Infaltables from './paginas/Infaltables';
import Carrito from './paginas/Carrito';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import Perfil from './paginas/Perfil';
import Checkout from './paginas/Checkout';
import CheckoutPago from './paginas/CheckoutPago';
import CheckoutResultado from './paginas/CheckoutResultado';
import Admin from './paginas/Admin';
import NoEncontrado from './paginas/NoEncontrado';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:slug" element={<ProductoDetalle />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/infaltables" element={<Infaltables />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas que necesitan sesión */}
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="/checkout" element={<RutaProtegida><Checkout /></RutaProtegida>} />
          <Route path="/checkout/pago/:orderId" element={<RutaProtegida><CheckoutPago /></RutaProtegida>} />
          <Route path="/checkout/resultado/:orderId" element={<RutaProtegida><CheckoutResultado /></RutaProtegida>} />

          {/* Solo administradores */}
          <Route path="/admin" element={<RutaProtegida adminOnly><Admin /></RutaProtegida>} />

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
