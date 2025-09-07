"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsPlus, BsEyeFill } from "react-icons/bs";
import { CartContext } from "../../../contexts/CartContext";

const Product = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [showActions, setShowActions] = useState(false);

  const { _id, image, category, title, prices, weights } = product;

  const [selectedWeight, setSelectedWeight] = useState(weights?.[0] || "");

  const currentPrice = prices?.[selectedWeight] || {
    originalPrice: 0,
    discountedPrice: 0,
  };

  const discountPercent =
    currentPrice.originalPrice > 0
      ? Math.round(
          ((currentPrice.originalPrice - currentPrice.discountedPrice) /
            currentPrice.originalPrice) *
            100
        )
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xs shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
      {/* Image */}
      <div
        className="relative h-[150px] sm:h-[150px] md:h-[250px] flex justify-center items-center bg-gray-50 cursor-pointer"
        onClick={() => setShowActions((prev) => !prev)}
      >
        <Image
          src={image}
          alt={title}
          width={500}
          height={500}
          className="h-full w-full object-contain group-hover:scale-105 transition duration-300"
        />

        {/* Action Buttons */}
        <div
          className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 
          ${showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, _id, selectedWeight);
            }}
            className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-xs shadow-md hover:bg-purple-600"
          >
            <BsPlus className="text-xl" />
          </button>
          <Link
            href={`/product/${_id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 flex items-center justify-center bg-white text-gray-700 rounded-xs shadow-md hover:text-purple-600"
          >
            <BsEyeFill className="text-xl" />
          </Link>
        </div>

        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          {category}
        </p>

        <Link href={`/product/${_id}`}>
          <h2 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h2>
        </Link>

        {/* Weight Selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {weights?.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeight(w)}
              className={`px-3 py-1 text-xs font-medium border rounded-xs transition ${
                selectedWeight === w
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-purple-800">
            Rs {currentPrice.discountedPrice}
          </span>
          {currentPrice.originalPrice !== currentPrice.discountedPrice && (
            <span className="text-sm line-through text-gray-400">
              Rs {currentPrice.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
