"use client";

import React, { useContext, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsPlus, BsEyeFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { CartContext } from "../../../contexts/CartContext";
import QuickViewModal from "./QuickViewModal";

const Product = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  // --- STATE ---
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Quick View State
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const {
    _id,
    image,
    title,
    description,
    category,
    variants = [],
    variantType,
    rating,
    discount,
  } = product;

  // --- SAFE CATEGORY ---
  const categoryName =
    typeof category === "object" && category !== null
      ? category.name
      : category;

  // --- VARIANT PARSING ---
  const { weightOptions, flavorOptions } = useMemo(() => {
    if (!variants || variants.length === 0)
      return { weightOptions: [], flavorOptions: [] };
    const weightRegex = /(kg|gm|lb|pound)/i;
    const weights = variants.filter(
      (v) => v.label && weightRegex.test(v.label)
    );
    const flavors = variants.filter(
      (v) => v.label && !weightRegex.test(v.label)
    );
    return { weightOptions: weights, flavorOptions: flavors };
  }, [variants]);

  // --- DEFAULTS ---
  React.useEffect(() => {
    if (weightOptions.length > 0) setSelectedWeight(weightOptions[0]);
    if (flavorOptions.length > 0) {
      // Prioritize "Regular" flavor to show base price
      const regular = flavorOptions.find((f) =>
        f.label.toLowerCase().includes("regular")
      );
      setSelectedFlavor(regular || flavorOptions[0]);
    }
  }, [weightOptions, flavorOptions]);

  // --- PRICE CALCULATION ---
  const priceData = useMemo(() => {
    let dPrice = 0,
      oPrice = 0;

    // 1. Weight Price (Base)
    if (selectedWeight?.price) {
      dPrice += selectedWeight.price.discountedPrice || 0;
      oPrice += selectedWeight.price.originalPrice || 0;
    } else if (product.price) {
      dPrice = product.price.discountedPrice || product.price || 0;
      oPrice = product.price.originalPrice || 0;
    }

    // 2. Flavor Price (Surcharge)
    if (selectedFlavor?.price) {
      dPrice += selectedFlavor.price.discountedPrice || 0;
      oPrice += selectedFlavor.price.originalPrice || 0;
    }

    return { discountedPrice: dPrice, originalPrice: oPrice };
  }, [selectedWeight, selectedFlavor, variants, product.price]);

  // Helper for flavor dropdown display
  const getFlavorSurchargeLabel = (flavor) => {
    if (flavor.price?.discountedPrice > 0)
      return `${flavor.label} (+₹${flavor.price.discountedPrice})`;
    return flavor.label;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        ...product,
        id: _id,
        selectedWeight: selectedWeight?.label || "Standard",
        selectedFlavor: selectedFlavor?.label || "Standard",
        price: priceData.discountedPrice,
        image: image,
      },
      _id
    );
  };

  return (
    <>
      <div
        className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-200 flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* --- IMAGE AREA --- */}
        <div className="relative h-[220px] sm:h-[240px] bg-gray-50 overflow-hidden">
          <Link href={`/product/${_id}`} className="block h-full w-full">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                No Image
              </div>
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {discount > 0 && (
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                -{discount}% OFF
              </span>
            )}
            {rating?.rate > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
                <FaStar className="text-[8px]" /> {rating.rate}
              </span>
            )}
          </div>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Prevents clicking the link
              setIsQuickViewOpen(true);
            }}
            className={`absolute top-3 right-3 transition-all duration-300 transform z-10 w-9 h-9 flex items-center justify-center bg-white text-gray-600 rounded-full shadow-md hover:bg-purple-600 hover:text-white ${
              isHovered
                ? "translate-x-0 opacity-100"
                : "translate-x-4 opacity-0"
            }`}
            title="Quick View"
          >
            <BsEyeFill className="text-xs" />
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="p-4 flex flex-col flex-1">
          {categoryName && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
              {categoryName}
            </p>
          )}
          <Link href={`/product/${_id}`} className="block">
            <h2 className="text-gray-800 font-bold text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
              {title}
            </h2>
          </Link>
          <p className="text-gray-400 text-xs line-clamp-2 mb-4 h-8">
            {description || "Freshly baked with premium ingredients."}
          </p>

          <div className="mt-auto space-y-3">
            {/* Weight Pills */}
            {variantType !== "flavour" && weightOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {weightOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedWeight(opt);
                    }}
                    className={`px-2 py-1 text-[10px] font-medium border rounded-md transition-all ${
                      selectedWeight?.label === opt.label
                        ? "bg-purple-600 text-white border-purple-600 shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Flavor Dropdown */}
            {(variantType === "both" || variantType === "flavour") &&
              flavorOptions.length > 0 && (
                <div className="relative group/select">
                  <select
                    value={selectedFlavor?.label || ""}
                    onClick={(e) => e.preventDefault()}
                    onChange={(e) => {
                      const flav = flavorOptions.find(
                        (f) => f.label === e.target.value
                      );
                      setSelectedFlavor(flav);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-2 pr-6 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none hover:bg-white transition-colors"
                  >
                    {flavorOptions.map((f) => (
                      <option key={f.label} value={f.label}>
                        {getFlavorSurchargeLabel(f)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <FiChevronDown size={12} />
                  </div>
                </div>
              )}

            {/* Price & Add */}
            <div className="pt-3 flex items-center justify-between border-t border-gray-100 mt-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-extrabold text-purple-700">
                    ₹{priceData.discountedPrice}
                  </span>
                  {priceData.originalPrice > priceData.discountedPrice && (
                    <span className="text-xs text-gray-400 line-through decoration-red-400">
                      ₹{priceData.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm group/btn active:scale-95"
                title="Add to Cart"
              >
                <BsPlus className="text-2xl transform group-hover/btn:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- QUICK VIEW MODAL (Rendered via Portal) --- */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

export default Product;
