'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity?: number, color?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const freeShippingThreshold = 2999;

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('hnf_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Failed to parse saved cart:', e);
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hnf_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cart]);

  const saveToLocalStorage = (updatedCart: CartItem[]) => {
    try {
      localStorage.setItem('hnf_cart', JSON.stringify(updatedCart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  };

  const addToCart = (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity = 1, color?: string) => {
    setCart((prev) => {
      const selectedColor = color || product.variants.find((v) => v.size === size)?.color || 'Default';
      const existingIdx = prev.findIndex(
        (item) => (item.product.id === product.id || item.product._id === product._id) && item.selectedSize === size
      );

      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
      } else {
        updated = [...prev, { product, selectedSize: size, selectedColor, quantity }];
      }

      saveToLocalStorage(updated);
      return updated;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => {
      const updated = prev.filter(
        (item) => !( (item.product.id === productId || item.product._id === productId) && item.selectedSize === size )
      );
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => {
        if ((item.product.id === productId || item.product._id === productId) && item.selectedSize === size) {
          return { ...item, quantity };
        }
        return item;
      });
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    saveToLocalStorage([]);
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cart.reduce((total, item) => total + item.product.pricing.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
