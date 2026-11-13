import ProductList from '../components/ProductList';

// Ofertas: todas las prendas ordenadas de menor a mayor precio
const Ofertas = () => {
    return (
        <div className="container mt-3">
            <h1>Ofertas</h1>
            <p className="text-muted">Las prendas más económicas primero.</p>
            <ProductList initialSort="price_asc" />
        </div>
    );
}

export default Ofertas;
