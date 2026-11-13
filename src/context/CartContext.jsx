import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

// Guardamos solo lo necesario de cada producto
const toCartItem = (product) => ({
  id: product.id,
  slug: product.slug,
  title: product.title,
  price: Number(product.price),
  thumbnail: product.thumbnail || product.image || null,
  stock: Number(product.stock) || 0,
  quantity: 1,
});

const cartReducer = (items, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;
      const existing = items.find((i) => i.id === product.id);
      if (!existing) return [...items, toCartItem(product)];
      // No se puede superar el stock disponible
      if (existing.quantity >= existing.stock) return items;
      return items.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    }
    case 'REMOVE_ITEM':
      return items.filter((i) => i.id !== action.payload);
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      return items.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) } : i
      );
    }
    case 'CLEAR_CART':
      return [];
    default:
      return items;
  }
};

// Lee el carrito guardado en el navegador (si existe y es válido)
const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  // Cada vez que cambia el carrito, lo guardamos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const getQuantity = (id) => items.find((i) => i.id === id)?.quantity || 0;

  // Devuelve true si se pudo agregar, false si ya no hay más stock
  const addToCart = (product) => {
    if (getQuantity(product.id) >= product.stock) return false;
    dispatch({ type: 'ADD_ITEM', payload: product });
    return true;
  };

  const value = {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    getQuantity,
    addToCart,
    removeFromCart: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
