"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoMdClose,
  IoMdStar,
  IoMdCart,
  IoMdHeartEmpty,
  IoMdHeart,
} from "react-icons/io";
import { FiMinus, FiPlus, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import { CartContext } from "../../../contexts/CartContext";

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [mounted, setMounted] = useState(false);

  // --- STATE ---
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Handle Hydration & Scroll Lock
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // --- 1. EXTRACT VARIANTS ---
  const { weightOptions, flavorOptions, variantMap } = useMemo(() => {
    if (!product || !product.variants)
      return { weightOptions: [], flavorOptions: [], variantMap: [] };

    // Regex for parsing
    const weightRegex = /(kg|gm|lb|pound)/i;

    const weights = product.variants.filter(
      (v) => v.label && weightRegex.test(v.label)
    );
    const flavors = product.variants.filter(
      (v) => v.label && !weightRegex.test(v.label)
    );

    return {
      weightOptions: [...new Set(weights.map((v) => v.label))],
      flavorOptions: [...new Set(flavors.map((v) => v.label))],
      variantMap: product.variants, // Keep ref to full objects
    };
  }, [product]);

  // --- 2. INTELLIGENT DEFAULTS (The Fix) ---
  useEffect(() => {
    if (isOpen && product) {
      // A. Set Default Weight (First available)
      if (weightOptions.length > 0) {
        setSelectedWeight(weightOptions[0]);
      }

      // B. Set Default Flavor (Lowest Price Logic)
      if (flavorOptions.length > 0) {
        // Find the flavor with the LOWEST discounted price to show as "Start Price"
        const sortedFlavors = [...flavorOptions].sort((a, b) => {
          const varA = variantMap.find((v) => v.label === a);
          const varB = variantMap.find((v) => v.label === b);
          const priceA = varA?.price?.discountedPrice || 0;
          const priceB = varB?.price?.discountedPrice || 0;
          return priceA - priceB;
        });

        // Select the cheapest one (e.g., "Regular" @ 0 extra cost)
        setSelectedFlavor(sortedFlavors[0]);
      }

      setQuantity(1);
    }
  }, [isOpen, product, weightOptions, flavorOptions, variantMap]);

  // --- 3. PRICE CALCULATION ENGINE ---
  const priceData = useMemo(() => {
    if (!product) return { discountedPrice: 0, originalPrice: 0 };

    let dPrice = 0;
    let oPrice = 0;

    // A. Weight Price (Base)
    if (selectedWeight) {
      const v = product.variants.find((v) => v.label === selectedWeight);
      if (v?.price) {
        dPrice += v.price.discountedPrice || 0;
        oPrice += v.price.originalPrice || 0;
      }
    } else {
      // Fallback
      dPrice =
        typeof product.price === "object"
          ? product.price.discountedPrice
          : product.price || 0;
      oPrice =
        typeof product.price === "object"
          ? product.price.originalPrice
          : product.price || 0;
    }

    // B. Flavor Surcharge
    if (selectedFlavor) {
      const f = product.variants.find((v) => v.label === selectedFlavor);
      if (f?.price) {
        dPrice += f.price.discountedPrice || 0;
        oPrice += f.price.originalPrice || 0;
      }
    }

    return { discountedPrice: dPrice, originalPrice: oPrice };
  }, [product, selectedWeight, selectedFlavor]);

  // --- HELPER: Label Formatter ---
  const getFlavorLabel = (flavorLabel) => {
    const f = product?.variants.find((v) => v.label === flavorLabel);
    const surcharge = f?.price?.discountedPrice || 0;

    if (surcharge > 0) return `${flavorLabel} (+₹${surcharge})`;
    return `${flavorLabel} (Standard)`;
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      id: product._id,
      selectedWeight: selectedWeight || "Standard",
      selectedFlavor: selectedFlavor || "Standard",
      price: priceData.discountedPrice,
      image: product.image,
    };
    for (let i = 0; i < quantity; i++) addToCart(itemToAdd, product._id);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 bg-white/80 rounded-full hover:bg-gray-100 text-gray-600 transition-colors shadow-sm"
            >
              <IoMdClose size={22} />
            </button>

            {/* --- LEFT: IMAGE --- */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-50 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-8"
              />
              <div className="absolute top-4 left-4">
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* --- RIGHT: INFO --- */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar bg-white">
              <div className="mb-1">
                <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">
                  {typeof product.category === "object"
                    ? product.category.name
                    : product.category}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
                {product.title}
              </h2>

              {/* Price Display */}
              <div className="flex items-end gap-2 mb-6 pb-4 border-b border-gray-100">
                <span className="text-3xl font-bold text-purple-700">
                  ₹{priceData.discountedPrice}
                </span>
                {priceData.originalPrice > priceData.discountedPrice && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    ₹{priceData.originalPrice}
                  </span>
                )}
                {/* Surcharge Note */}
                {selectedFlavor &&
                  product.variants.find((v) => v.label === selectedFlavor)
                    ?.price?.discountedPrice > 0 && (
                    <span className="text-[10px] text-gray-500 mb-2 ml-1">
                      (Includes Flavor Charges)
                    </span>
                  )}
              </div>

              {/* --- SELECTORS --- */}
              <div className="space-y-5 mb-8">
                {/* Weight */}
                {weightOptions.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">
                      Weight
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weightOptions.map((w) => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeight(w)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                            selectedWeight === w
                              ? "bg-purple-600 text-white border-purple-600 shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flavor */}
                {flavorOptions.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">
                      Flavor
                    </label>
                    <div className="relative">
                      <select
                        value={selectedFlavor || ""}
                        onChange={(e) => setSelectedFlavor(e.target.value)}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
                      >
                        {flavorOptions.map((f) => (
                          <option key={f} value={f}>
                            {getFlavorLabel(f)}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center w-32 border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600"
                    >
                      <FiMinus />
                    </button>
                    <div className="flex-1 text-center font-bold text-gray-900 text-sm">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* --- ACTIONS --- */}
              <div className="mt-auto flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <IoMdCart size={20} /> Add to Cart - ₹
                  {(priceData.discountedPrice * quantity).toFixed(2)}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-14 flex items-center justify-center rounded-xl border transition-colors ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {isWishlisted ? (
                    <IoMdHeart size={24} />
                  ) : (
                    <IoMdHeartEmpty size={24} />
                  )}
                </button>
              </div>

              {/* Trust Footer */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                <span className="flex items-center gap-1">
                  <FiCheckCircle className="text-green-500" /> Instant Delivery
                </span>
                <span className="flex items-center gap-1">
                  <FiCheckCircle className="text-green-500" /> 100% Fresh
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuickViewModal;
