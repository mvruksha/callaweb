"use client";

import React, { useContext } from "react";
import CartItem from "@/components/cakemenu/cartItem/CartItem";
import Titletag from "@/components/titletag/Titletag";
import { CartContext } from "../../../contexts/CartContext";
import { FiTrash2 } from "react-icons/fi";
import Link from "next/link";

const Cart = () => {
  const { cart, clearCart, itemAmount, total } = useContext(CartContext);

  // ✅ calculate total savings
  const totalSavings = cart.reduce(
    (acc, item) =>
      acc +
      ((item.price || 0) - (item.discountedPrice || item.price || 0)) *
        (item.amount || 1),
    0
  );

  return (
    <>
      {/* Banner */}
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Shopping Cart"
      />

      {/* Cart Content */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <CartItem key={item._id || item.id} item={item} />
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white shadow-xl rounded-lg p-6 space-y-6 border border-gray-200">
              <h2 className="text-lg font-semibold border-b pb-3">
                Order Summary
              </h2>

              <div className="flex justify-between text-base">
                <span>Items ({itemAmount})</span>
                <span>Rs {Number(total || 0).toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="text-green-600 text-sm font-medium">
                  🎉 You saved Rs {Number(totalSavings).toFixed(2)}
                </div>
              )}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow transition w-full justify-center"
              >
                <FiTrash2 />
                Clear Cart
              </button>

              {/* Checkout Actions */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="bg-purple-950 hover:bg-purple-900 text-white block text-center py-3 rounded-md font-medium transition"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cakes"
                  className="bg-gray-200 hover:bg-gray-300 text-black block text-center py-3 rounded-md font-medium transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-20 text-xl">
            Your cart is empty 🛒
          </p>
        )}
      </section>
    </>
  );
};

export default Cart;
