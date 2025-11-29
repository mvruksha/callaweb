"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { CartContext } from "../../../contexts/CartContext"; // Check this path
import CartItem from "@/components/cakemenu/cartItem/CartItem"; // Check this path
import Titletag from "@/components/titletag/Titletag"; // Check this path
import {
  FiTrash2,
  FiArrowLeft,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiGift,
  FiTag, // Replaced TbDiscount2 with FiTag
} from "react-icons/fi";

const Cart = () => {
  const { cart, clearCart, itemAmount, total } = useContext(CartContext);
  const [mounted, setMounted] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  // Prevent Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- CONFIGURATION ---
  const FREE_SHIPPING_THRESHOLD = 2000;
  const SHIPPING_COST = 99;
  const TAX_RATE = 0.05;

  // --- CALCULATIONS ---
  const subTotal = parseFloat(total || 0);
  const tax = subTotal * TAX_RATE;

  const currentShipping =
    subTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subTotal;
  const progressPercentage = Math.min(
    (subTotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );

  const finalTotal = subTotal + tax + currentShipping;

  if (!mounted) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* NOTE: If Titletag causes an error, confirm it is exported as 'export default Titletag' 
         in its file. If it is 'export const Titletag', change this import to:
         import { Titletag } from "@/components/titletag/Titletag";
      */}
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="Home"
        title="Shopping Cart"
      />

      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {cart.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* LEFT COLUMN - Cart Items */}
            <div className="w-full lg:w-2/3 space-y-6">
              {/* 1. Free Shipping Progress */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <FiTruck className="text-purple-600 w-5 h-5" />
                  <h3 className="font-semibold text-gray-800">
                    {amountToFreeShipping > 0
                      ? `Add Rs ${amountToFreeShipping.toFixed(
                          0
                        )} more for Free Shipping`
                      : "🎉 You have unlocked Free Shipping!"}
                  </h3>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* 2. Items Header (Desktop only) */}
              <div className="hidden md:flex items-center justify-between px-6 pb-2 text-sm font-medium text-gray-500 border-b border-gray-200">
                <span>Product</span>
                <div className="flex gap-16 pr-12">
                  <span>Quantity</span>
                  <span>Total</span>
                </div>
              </div>

              {/* 3. Cart Items List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {cart.map((item) => (
                  <CartItem
                    key={`${item._id || item.id}-${item.selectedWeight}-${
                      item.selectedFlavor
                    }`}
                    item={item}
                  />
                ))}
              </div>

              {/* 4. Actions Row */}
              <div className="flex justify-between items-center pt-4">
                <Link
                  href="/cakes"
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-700 font-medium transition-colors"
                >
                  <FiArrowLeft /> Continue Shopping
                </Link>

                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              {/* 5. Special Instructions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                  <FiGift className="text-purple-600" />
                  <span>Add a note to your order</span>
                </div>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Message on cake, special delivery instructions, etc..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Summary (Sticky) */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-24 space-y-6">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-50/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-gray-600 text-sm mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal ({itemAmount} items)</span>
                      <span className="font-medium text-gray-900">
                        Rs {subTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-medium text-gray-900">
                        Rs {tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      {currentShipping === 0 ? (
                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full">
                          Free
                        </span>
                      ) : (
                        <span className="font-medium text-gray-900">
                          Rs {currentShipping.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coupon Input */}
                  <div className="relative flex items-center mb-6">
                    <div className="absolute left-3 text-gray-400">
                      <FiTag size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Promo Code"
                      className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button className="absolute right-1 top-1 bottom-1 px-3 bg-white text-purple-700 text-xs font-bold rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                      APPLY
                    </button>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-4 mb-6">
                    <span className="font-bold text-gray-900 text-lg">
                      Total
                    </span>
                    <span className="font-extrabold text-2xl text-purple-700">
                      Rs {finalTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded text-xs text-gray-500 gap-1 text-center">
                      <FiShield className="text-green-600" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded text-xs text-gray-500 gap-1 text-center">
                      <FiCheckCircle className="text-blue-600" />
                      <span>Freshness Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-center px-4">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <FiGift className="w-10 h-10 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              Looks like you haven't added any sweet treats yet. Explore our
              best sellers and find something delicious!
            </p>
            <Link
              href="/cakes"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg shadow-purple-200 transition-all transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Cart;
