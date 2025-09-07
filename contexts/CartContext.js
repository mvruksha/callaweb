"use client";

import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  const [itemAmount, setItemAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Update totals and save to localStorage whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce(
      (acc, item) => acc + item.discountedPrice * item.amount,
      0
    );
    setTotal(newTotal);

    const newAmount = cart.reduce((acc, item) => acc + item.amount, 0);
    setItemAmount(newAmount);

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add product with weight support
  const addToCart = (product, id, selectedWeight) => {
    const priceObj = product.prices?.[selectedWeight] || {
      originalPrice: 0,
      discountedPrice: 0,
    };

    const newItem = {
      ...product,
      id,
      selectedWeight,
      originalPrice: priceObj.originalPrice,
      discountedPrice: priceObj.discountedPrice,
      amount: 1,
    };

    const existingItem = cart.find(
      (item) => item.id === id && item.selectedWeight === selectedWeight
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === id && item.selectedWeight === selectedWeight
            ? { ...item, amount: item.amount + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (id, selectedWeight) => {
    setCart(
      cart.filter(
        (item) => !(item.id === id && item.selectedWeight === selectedWeight)
      )
    );
  };

  const clearCart = () => setCart([]);

  const increaseAmount = (id, selectedWeight) => {
    setCart(
      cart.map((item) =>
        item.id === id && item.selectedWeight === selectedWeight
          ? { ...item, amount: item.amount + 1 }
          : item
      )
    );
  };

  const decreaseAmount = (id, selectedWeight) => {
    const item = cart.find(
      (i) => i.id === id && i.selectedWeight === selectedWeight
    );
    if (!item) return;

    if (item.amount > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === id && cartItem.selectedWeight === selectedWeight
            ? { ...cartItem, amount: cartItem.amount - 1 }
            : cartItem
        )
      );
    } else {
      removeFromCart(id, selectedWeight);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemAmount,
        total,
        addToCart,
        removeFromCart,
        clearCart,
        increaseAmount,
        decreaseAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
