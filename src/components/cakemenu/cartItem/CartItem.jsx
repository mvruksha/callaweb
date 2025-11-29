"use client";

import React, { useContext, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoMdAdd, IoMdClose, IoMdRemove } from "react-icons/io";
import { FiChevronDown, FiPackage } from "react-icons/fi";
import { BiDish } from "react-icons/bi";
import { CartContext } from "../../../../contexts/CartContext";

const CartItem = ({ item }) => {
  const { removeFromCart, increaseAmount, decreaseAmount, updateItemVariant } =
    useContext(CartContext);

  const {
    _id,
    id,
    title,
    image,
    selectedWeight,
    selectedFlavor,
    price,
    amount,
    variants = [],
  } = item;

  const productId = _id || id;

  // --- 1. ROBUST FILTERING ---
  const { weightOptions, flavorOptions } = useMemo(() => {
    if (!variants || variants.length === 0)
      return { weightOptions: [], flavorOptions: [] };

    const weightRegex = /(kg|gm|lb|pound)/i;

    const weights = variants
      .filter((v) => v.label && weightRegex.test(v.label))
      .map((v) => v.label);

    const flavors = variants
      .filter((v) => v.label && !weightRegex.test(v.label))
      .map((v) => v.label);

    return {
      weightOptions: [...new Set(weights)],
      flavorOptions: [...new Set(flavors)],
    };
  }, [variants]);

  // --- 2. HANDLE VARIANT CHANGES ---
  const handleVariantChange = (newWeight, newFlavor) => {
    const targetWeight = newWeight || selectedWeight;
    const targetFlavor = newFlavor || selectedFlavor;

    if (targetWeight === selectedWeight && targetFlavor === selectedFlavor)
      return;

    let newCalculatedPrice = price;
    const matchedVariant = variants.find((v) => v.label === targetWeight);

    if (matchedVariant && matchedVariant.price) {
      newCalculatedPrice =
        typeof matchedVariant.price === "object"
          ? matchedVariant.price.discountedPrice ||
            matchedVariant.price.originalPrice ||
            0
          : matchedVariant.price;
    }

    updateItemVariant(
      productId,
      selectedWeight,
      selectedFlavor,
      targetWeight,
      targetFlavor,
      newCalculatedPrice
    );
  };

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      {/* --- COLUMN 1: IMAGE (Fixed Width, Fluid Height) --- */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <Link href={`/product/${productId}`} className="block w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 80px, 96px"
          />
        </Link>
      </div>

      {/* --- COLUMN 2: DETAILS (Takes remaining space) --- */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* ROW 1: Title & Remove */}
        <div className="flex justify-between items-start gap-2">
          <Link
            href={`/product/${productId}`}
            className="text-sm sm:text-base font-bold text-gray-800 hover:text-purple-700 transition-colors line-clamp-2 leading-tight"
            title={title}
          >
            {title}
          </Link>
          <button
            onClick={() =>
              removeFromCart(productId, selectedWeight, selectedFlavor)
            }
            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1 rounded-md hover:bg-red-50"
            aria-label="Remove item"
          >
            <IoMdClose size={18} />
          </button>
        </div>

        {/* ROW 2: Variants (Fluid Wrapping) */}
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {/* Weight Select */}
          {weightOptions.length > 0 ? (
            <div className="relative group/select">
              <select
                value={selectedWeight || ""}
                onChange={(e) => handleVariantChange(e.target.value, null)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-semibold py-1 pl-2 pr-6 rounded-md focus:outline-none focus:border-purple-500 cursor-pointer max-w-[80px] sm:max-w-none"
              >
                {weightOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]" />
            </div>
          ) : (
            selectedWeight && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                {selectedWeight}
              </span>
            )
          )}

          {/* Flavor Select */}
          {flavorOptions.length > 0 ? (
            <div className="relative group/select">
              <select
                value={selectedFlavor || ""}
                onChange={(e) => handleVariantChange(null, e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-semibold py-1 pl-2 pr-6 rounded-md focus:outline-none focus:border-pink-500 cursor-pointer max-w-[100px] sm:max-w-[140px] truncate"
              >
                {flavorOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[10px]" />
            </div>
          ) : (
            selectedFlavor && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                {selectedFlavor}
              </span>
            )
          )}
        </div>

        {/* ROW 3: Quantity & Price */}
        <div className="flex justify-between items-end">
          {/* Qty Control */}
          <div className="flex items-center border border-gray-200 rounded-md h-7 sm:h-8">
            <button
              onClick={() =>
                decreaseAmount(productId, selectedWeight, selectedFlavor)
              }
              className="px-2 h-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-l-md transition-colors"
            >
              <IoMdRemove size={14} />
            </button>
            <div className="w-6 h-full flex items-center justify-center text-xs font-bold text-gray-800 bg-white border-x border-gray-100">
              {amount}
            </div>
            <button
              onClick={() =>
                increaseAmount(productId, selectedWeight, selectedFlavor)
              }
              className="px-2 h-full flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-gray-50 rounded-r-md transition-colors"
            >
              <IoMdAdd size={14} />
            </button>
          </div>

          {/* Total Price */}
          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              Rs {(price * amount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
