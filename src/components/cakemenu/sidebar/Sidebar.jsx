"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { IoMdArrowForward, IoMdClose } from "react-icons/io";
import { FiTrash2, FiShoppingBag, FiTruck } from "react-icons/fi";

// Make sure these paths are correct for your project structure

import { SidebarContext } from "../../../../contexts/SidebarContext";
import { CartContext } from "../../../../contexts/CartContext";
import CartItem from "../cartItem/CartItem";

const Sidebar = () => {
  const { isOpen, handleClose } = useContext(SidebarContext);
  const { cart, clearCart, itemAmount, total } = useContext(CartContext);
  const [mounted, setMounted] = useState(false);

  // --- CONFIGURATION ---
  const FREE_SHIPPING_THRESHOLD = 2000;

  // --- CALCULATIONS ---
  const subTotal = parseFloat(total || 0);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subTotal;
  const progressPercentage = Math.min(
    (subTotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );

  // --- EFFECTS ---

  // 1. Hydration check
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Prevent background scroll when open
  useEffect(() => {
    if (!mounted) return;
    const el = document.documentElement;
    if (isOpen) {
      const prev = el.style.overflow;
      el.style.overflow = "hidden"; // Lock scroll
      return () => {
        el.style.overflow = prev || ""; // Unlock scroll
      };
    }
  }, [isOpen, mounted]);

  // 3. ✅ AUTO-CLOSE if cart becomes empty
  useEffect(() => {
    if (isOpen && cart.length === 0) {
      // Small delay to let the user see the item disappear before closing
      const timer = setTimeout(() => {
        handleClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length, isOpen, handleClose]);

  if (!mounted) return null;

  // Calculate Savings
  const totalSavings = cart.reduce((acc, item) => {
    // Handle logic if item has original price in different locations based on your data structure
    const regular = item.originalPrice || item.price;
    const selling = item.price;
    return acc + (regular - selling) * (item.amount || 1);
  }, 0);

  return createPortal(
    <>
      {/* --- OVERLAY --- */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-opacity duration-300 z-[9998] ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* --- SIDEBAR DRAWER --- */}
      <aside
        className={`fixed inset-y-0 right-0 z-[9999]
        bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        /* Responsive Widths: 85% on mobile (leaving space), fixed width on desktop */
        w-[85vw] sm:w-[450px]
        flex flex-col h-full
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 1. HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-800 tracking-tight">
              My Cart
            </span>
            <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {itemAmount} items
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* 2. FREE SHIPPING BAR (Upsell) */}
        {cart.length > 0 && (
          <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100">
            <div className="flex items-center gap-2 text-sm font-medium text-purple-900 mb-2">
              <FiTruck />
              {amountToFreeShipping > 0 ? (
                <span>
                  Add{" "}
                  <span className="font-bold">
                    ₹{amountToFreeShipping.toFixed(0)}
                  </span>{" "}
                  for{" "}
                  <span className="text-green-600 font-bold">
                    Free Shipping
                  </span>
                </span>
              ) : (
                <span className="text-green-600">
                  You've unlocked Free Shipping! 🎉
                </span>
              )}
            </div>
            <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. CART ITEMS (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {cart.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              {cart.map((item, idx) => (
                // Reusing your advanced CartItem component
                <div
                  key={`${item._id || item.id}-${item.selectedWeight}-${
                    item.selectedFlavor
                  }-${idx}`}
                  className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <CartItem item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Your bag is empty
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Looks like you haven't added any sweets yet.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* 4. FOOTER (Sticky) */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            {/* Totals Row */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-500 font-medium">Subtotal</div>
              <div className="text-xl font-extrabold text-gray-900">
                ₹{subTotal.toFixed(2)}
              </div>
            </div>

            {/* Savings Badge */}
            {totalSavings > 0 && (
              <div className="mb-4 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg text-center border border-green-100">
                You are saving ₹{totalSavings.toFixed(2)} on this order!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Clear Cart (Icon only for space efficiency) */}
              <button
                onClick={clearCart}
                className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                title="Clear Cart"
              >
                <FiTrash2 size={18} />
              </button>

              <Link
                href="/cart"
                onClick={handleClose}
                className="flex-1 flex items-center justify-center bg-gray-100 text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                View Cart
              </Link>

              <Link
                href="/checkout"
                onClick={handleClose}
                className="flex-[2] flex items-center justify-center gap-2 bg-purple-900 text-white font-semibold py-3.5 rounded-xl hover:bg-purple-800 transition-colors shadow-lg shadow-purple-200"
              >
                Checkout <IoMdArrowForward />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
};

export default Sidebar;
