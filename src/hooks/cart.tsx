import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

const storageCartName = '@GoMarket:cart';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const result = await AsyncStorage.getItem(storageCartName);
      if (result !== null) setProducts(JSON.parse(result));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const idx = products.findIndex(item => item.id === product.id);
      if (idx >= 0) {
        const result = [...products];
        result[idx].quantity += 1;
        setProducts(result);
        await AsyncStorage.setItem(storageCartName, JSON.stringify(result));
      } else {
        const result = [...products, { ...product, quantity: 1 }];
        setProducts(result);
        await AsyncStorage.setItem(storageCartName, JSON.stringify(result));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const idx = products.findIndex(item => item.id === id);
      if (idx >= 0) {
        const result = [...products];
        result[idx].quantity += 1;
        setProducts(result);
        await AsyncStorage.setItem(storageCartName, JSON.stringify(result));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const idx = products.findIndex(item => item.id === id);
      if (idx >= 0) {
        if (products[idx].quantity > 1) {
          const result = [...products];
          result[idx].quantity -= 1;
          setProducts(result);
          await AsyncStorage.setItem(storageCartName, JSON.stringify(result));
        } else {
          const result = products.filter(item => item.id !== id);
          setProducts(result);
          await AsyncStorage.setItem(storageCartName, JSON.stringify(result));
        }
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
