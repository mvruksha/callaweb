"use client";

import React from "react";

// ProductInfo now accepts selectedWeight and prices object
const ProductInfo = ({
  title,
  prices,
  selectedWeight,
  discount,
  description,
}) => {
  const currentPrice = prices?.[selectedWeight] || {
    originalPrice: 0,
    discountedPrice: 0,
  };
  const { originalPrice, discountedPrice } = currentPrice;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-4">{title}</h1>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-2xl font-bold text-purple-800">
          Rs {discountedPrice}
        </span>
        {originalPrice !== discountedPrice && (
          <span className="line-through text-gray-400">Rs {originalPrice}</span>
        )}
      </div>

      <p className="text-gray-600 mb-8">{description}</p>
    </div>
  );
};

export default ProductInfo;
