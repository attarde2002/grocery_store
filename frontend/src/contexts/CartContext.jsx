import React, { createContext, useContext, useState, useEffect } from "react";
import orderService from "../services/orderService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial cart/pending order from backend on load
  const fetchCart = async () => {
    try {
      setLoading(true);
      // Replace with your actual backend cart or pending order endpoint
      const response = await orderService.getCart(); 
      const items = response?.items || response || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.warn("Could not fetch cart from server, using local fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.id ?? item.productId) === (product.id ?? product.productId)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevItems, { ...product, quantity }];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const id = item.id ?? item.productId ?? item._id;
        return id === itemId ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) =>
      prev.filter((item) => (item.id ?? item.productId ?? item._id) !== itemId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (Number(item.quantity) || 1),
    0
  );

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        totalItemsCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);