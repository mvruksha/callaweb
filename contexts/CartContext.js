"use client";

import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  const [itemAmount, setItemAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Update totals and storage
  useEffect(() => {
    const newTotal = cart.reduce(
      (acc, item) => acc + item.price * item.amount,
      0
    );
    setTotal(newTotal);

    const newAmount = cart.reduce((acc, item) => acc + item.amount, 0);
    setItemAmount(newAmount);

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // --- ADD TO CART ---
  const addToCart = (product, id) => {
    // Ensure we store the 'variants' array so we can switch them later in the cart
    const newItem = { ...product, amount: 1 };

    const cartItem = cart.find((item) => {
      return (
        item.id === id &&
        item.selectedWeight === product.selectedWeight &&
        item.selectedFlavor === product.selectedFlavor
      );
    });

    if (cartItem) {
      const newCart = [...cart].map((item) => {
        if (
          item.id === id &&
          item.selectedWeight === product.selectedWeight &&
          item.selectedFlavor === product.selectedFlavor
        ) {
          return { ...item, amount: cartItem.amount + 1 };
        }
        return item;
      });
      setCart(newCart);
    } else {
      setCart([...cart, newItem]);
    }
  };

  // --- REMOVE FROM CART ---
  const removeFromCart = (id, selectedWeight, selectedFlavor) => {
    const newCart = cart.filter((item) => {
      return !(
        item.id === id &&
        item.selectedWeight === selectedWeight &&
        item.selectedFlavor === selectedFlavor
      );
    });
    setCart(newCart);
  };

  // --- CLEAR CART ---
  const clearCart = () => setCart([]);

  // --- INCREASE AMOUNT ---
  const increaseAmount = (id, selectedWeight, selectedFlavor) => {
    const newCart = cart.map((item) => {
      if (
        item.id === id &&
        item.selectedWeight === selectedWeight &&
        item.selectedFlavor === selectedFlavor
      ) {
        return { ...item, amount: item.amount + 1 };
      }
      return item;
    });
    setCart(newCart);
  };

  // --- DECREASE AMOUNT ---
  const decreaseAmount = (id, selectedWeight, selectedFlavor) => {
    const cartItem = cart.find(
      (item) =>
        item.id === id &&
        item.selectedWeight === selectedWeight &&
        item.selectedFlavor === selectedFlavor
    );

    if (cartItem) {
      if (cartItem.amount > 1) {
        const newCart = cart.map((item) => {
          if (
            item.id === id &&
            item.selectedWeight === selectedWeight &&
            item.selectedFlavor === selectedFlavor
          ) {
            return { ...item, amount: item.amount - 1 };
          }
          return item;
        });
        setCart(newCart);
      } else {
        removeFromCart(id, selectedWeight, selectedFlavor);
      }
    }
  };

  // --- [NEW] UPDATE VARIANT (WEIGHT/FLAVOR) ---
  const updateItemVariant = (
    id,
    oldWeight,
    oldFlavor,
    newWeight,
    newFlavor,
    newPrice
  ) => {
    // 1. Check if an item with the NEW configuration already exists
    const existingTargetItem = cart.find(
      (item) =>
        item.id === id &&
        item.selectedWeight === newWeight &&
        item.selectedFlavor === newFlavor
    );

    const currentItem = cart.find(
      (item) =>
        item.id === id &&
        item.selectedWeight === oldWeight &&
        item.selectedFlavor === oldFlavor
    );

    if (!currentItem) return;

    if (existingTargetItem) {
      // SCENARIO: User changes "500g" to "1kg", but "1kg" is already in cart.
      // ACTION: Merge amounts (add current amount to target) and remove the old one.
      const newCart = cart
        .map((item) => {
          if (
            item.id === id &&
            item.selectedWeight === newWeight &&
            item.selectedFlavor === newFlavor
          ) {
            return { ...item, amount: item.amount + currentItem.amount };
          }
          return item;
        })
        .filter(
          (item) =>
            !(
              item.id === id &&
              item.selectedWeight === oldWeight &&
              item.selectedFlavor === oldFlavor
            )
        );
      setCart(newCart);
    } else {
      // SCENARIO: Target config doesn't exist.
      // ACTION: Just update the properties of the current item.
      const newCart = cart.map((item) => {
        if (
          item.id === id &&
          item.selectedWeight === oldWeight &&
          item.selectedFlavor === oldFlavor
        ) {
          return {
            ...item,
            selectedWeight: newWeight,
            selectedFlavor: newFlavor,
            price: newPrice, // Update the price!
          };
        }
        return item;
      });
      setCart(newCart);
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
        updateItemVariant, // Exporting new function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
