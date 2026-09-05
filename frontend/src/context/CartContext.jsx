import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();
const GUEST_CART_KEY = 'peep-guest-cart';
const emptyCart = { items: [], totalPrice: 0 };

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || JSON.stringify(emptyCart));
  } catch {
    return emptyCart;
  }
};

const saveGuestCart = (nextCart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(nextCart));
  return nextCart;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart(readGuestCart());
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      const guestCart = readGuestCart();
      let nextCart = res.data.data;
      for (const item of guestCart.items) {
        await api.post('/cart/add', { productId: item.product._id, quantity: item.quantity });
      }
      if (guestCart.items.length) {
        const merged = await api.get('/cart');
        nextCart = merged.data.data;
        saveGuestCart(emptyCart);
      }
      setCart(nextCart);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCart();
    else setCart(readGuestCart());
  }, [user]);

  const addToCart = async (productId, quantity = 1, product = null) => {
    if (!user) {
      const nextCart = readGuestCart();
      const existingItem = nextCart.items.find((item) => item.product._id === productId);
      if (existingItem) existingItem.quantity += quantity;
      else nextCart.items.push({ product, quantity, price: Number(product?.price || 0) });
      nextCart.totalPrice = nextCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      setCart(saveGuestCart(nextCart));
      toast.success('Added to cart');
      return;
    }
    try {
      const res = await api.post('/cart/add', { productId, quantity });
      setCart(res.data.data);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!user) {
      const nextCart = readGuestCart();
      const item = nextCart.items.find((cartItem) => cartItem.product._id === productId);
      if (item) item.quantity = quantity;
      nextCart.totalPrice = nextCart.items.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0);
      setCart(saveGuestCart(nextCart));
      return;
    }
    try {
      const res = await api.put(`/cart/item/${productId}`, { quantity });
      setCart(res.data.data);
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) {
      const nextCart = readGuestCart();
      nextCart.items = nextCart.items.filter((item) => item.product._id !== productId);
      nextCart.totalPrice = nextCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      setCart(saveGuestCart(nextCart));
      toast.success('Removed from cart');
      return;
    }
    try {
      const res = await api.delete(`/cart/item/${productId}`);
      setCart(res.data.data);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart(saveGuestCart(emptyCart));
      return;
    }
    try {
      await api.delete('/cart');
      setCart({ items: [], totalPrice: 0 });
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    cart,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);