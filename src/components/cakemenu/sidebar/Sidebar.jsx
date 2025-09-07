"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { IoMdArrowForward } from "react-icons/io";
import { FiTrash2 } from "react-icons/fi";

import CartItem from "../cartItem/CartItem";
import { SidebarContext } from "../../../../contexts/SidebarContext";
import { CartContext } from "../../../../contexts/CartContext";

const Sidebar = () => {
  const { isOpen, handleClose } = useContext(SidebarContext);
  const { cart, clearCart, itemAmount, total } = useContext(CartContext);

  const [mounted, setMounted] = useState(false);

  // ensure this runs only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // prevent background scroll
  useEffect(() => {
    if (!mounted) return;
    const el = document.documentElement;
    if (isOpen) {
      const prev = el.style.overflow;
      el.style.overflow = "hidden";
      return () => {
        el.style.overflow = prev || "";
      };
    }
  }, [isOpen, mounted]);

  if (!mounted) return null;

  // ✅ total savings = (original - discounted) × qty
  const totalSavings = cart.reduce(
    (acc, item) =>
      acc +
      ((item.originalPrice || 0) - (item.discountedPrice || 0)) *
        (item.amount || 1),
    0
  );

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[9998] ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 bg-white shadow-xl z-[9999]
        w-screen max-w-[95vw] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[420px]
        transition-transform duration-300 ease-in-out rounded-xs
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="shrink-0 sticky top-0 bg-white border-b border-gray-400 mx-4">
            <div className="flex items-center justify-between py-5 px-4 md:px-6">
              <div className="uppercase text-sm font-semibold tracking-wide">
                Shopping Bag ({itemAmount})
              </div>
              <button
                onClick={handleClose}
                aria-label="Close cart"
                className="w-8 h-8 flex justify-center items-center hover:bg-gray-100 rounded-xs transition"
              >
                <IoMdArrowForward className="text-2xl" />
              </button>
            </div>
          </header>

          {/* Items */}
          <main className="grow overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="px-4 md:px-6 py-4 border-b border-gray-400 mx-4">
              {cart.length > 0 ? (
                <div className="flex flex-col gap-y-3">
                  {cart.map((item, idx) => (
                    <CartItem
                      key={`${item._id || item.id}-${
                        item.selectedWeight
                      }-${idx}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12 text-lg">
                  Your cart is empty 🛒
                </p>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="shrink-0 sticky bottom-0 bg-white border-t border-gray-400 mx-4">
            <div className="px-4 md:px-6 py-4 space-y-4">
              {/* Subtotal + clear button */}
              <div className="flex w-full justify-between items-center text-base">
                <div className="font-semibold">
                  <span className="mr-2">Subtotal:</span>
                  <span>Rs {Number(total || 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={clearCart}
                  className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 flex justify-center items-center text-xl rounded-xs shadow transition"
                  aria-label="Clear cart"
                >
                  <FiTrash2 />
                </button>
              </div>

              {/* ✅ Savings */}
              {totalSavings > 0 && (
                <div className="text-green-600 font-medium text-sm">
                  You saved Rs {Number(totalSavings).toFixed(2)} 🎉
                </div>
              )}

              {/* Actions */}
              <Link
                href="/cart"
                className="bg-gray-200 hover:bg-gray-300 flex p-3 justify-center items-center text-black w-full font-medium rounded-xs transition"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                className="bg-purple-950 hover:bg-gray-900 flex p-3 justify-center items-center text-white w-full font-medium rounded-xs transition"
              >
                Checkout
              </Link>
            </div>
          </footer>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default Sidebar;
