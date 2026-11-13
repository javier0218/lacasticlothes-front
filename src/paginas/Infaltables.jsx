import ProductList from '../components/ProductList';

// Infaltables: las prendas marcadas como "destacadas" desde el panel de administración
const Infaltables = () => {
    return (
        <div className="container mt-3">
            <h1>Productos Infaltables</h1>
            <p className="text-muted">Nuestra selección de prendas destacadas.</p>
            <ProductList featured />
        </div>
    );
}

export default Infaltables;
