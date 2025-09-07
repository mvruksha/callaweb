"use client";

import React, { useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { CartContext } from "../../../../contexts/CartContext";
import { ProductContext } from "../../../../contexts/ProductContext";
import Image from "next/image";
import { IoMdArrowBack } from "react-icons/io";
import { motion } from "framer-motion";
import ProductSlider from "@/components/home/slider/ProductSlider";
import Titletag from "@/components/titletag/Titletag";

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { products } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);

  const [selectedWeight, setSelectedWeight] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  if (!products || products.length === 0) {
    return (
      <section className="h-screen flex justify-center items-center text-gray-600">
        Loading...
      </section>
    );
  }

  const product = products.find((p) => String(p._id) === String(id));

  if (!product) {
    return (
      <section className="h-screen flex justify-center items-center text-gray-600">
        Product not found
      </section>
    );
  }

  const {
    title,
    description,
    category,
    image,
    prices,
    weights,
    discount,
    flavours,
    options,
    customization,
    examples,
  } = product;

  // Default weight
  const defaultWeight = weights?.[0] || "";
  const selectedWeightValue = selectedWeight || defaultWeight;
  const currentPrice = prices?.[selectedWeightValue] || {
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
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="cakes"
        title="Cake"
      />
      <section className="mt-4 sm:mt-4 md:mt-8 lg:mt-8 xl:mt-8 2xl:mt-8 pt-2 px-4 pb-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-1 mb-6 border border-red-100
             text-red-600 bg-gray-100 rounded-xs shadow-xl
             hover:bg-red-700 hover:text-white hover:shadow-lg active:scale-95 
             transition-all duration-200 ease-in-out"
          >
            <IoMdArrowBack className="text-lg" />
            <span className="font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex justify-center items-start relative"
            >
              <div className="w-full max-w-md bg-white rounded-xs shadow-xl overflow-hidden relative">
                <div className="relative w-full h-[350px] sm:h-[400px]">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-contain"
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-xs shadow-lg">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Product Details */}
            <div className="flex flex-col justify-between sticky top-28">
              <div className="bg-white rounded-xs shadow-xl p-4 space-y-8">
                {/* Title & Category */}
                <div>
                  <h1 className="text-4xl font-bold mb-2">{title}</h1>
                  {category && (
                    <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
                      {category}
                    </p>
                  )}
                </div>

                {/* Flavours */}
                {flavours && flavours.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {flavours.map((flavour, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-xs text-sm font-medium"
                      >
                        {flavour}
                      </span>
                    ))}
                  </div>
                )}

                {/* Weight Selector */}
                {weights && weights.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {weights.map((w) => (
                      <motion.button
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 text-sm font-medium border rounded-xs transition ${
                          selectedWeightValue === w
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        {w}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-purple-800">
                    Rs {currentPrice.discountedPrice}
                  </span>
                  {currentPrice.originalPrice !==
                    currentPrice.discountedPrice && (
                    <span className="line-through text-gray-400 text-lg">
                      Rs {currentPrice.originalPrice}
                    </span>
                  )}
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b mb-4">
                  {["description", "customization", "examples"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-sm font-medium transition ${
                        activeTab === tab
                          ? "border-b-2 border-purple-700 text-purple-700"
                          : "text-gray-500"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="text-gray-700 mb-4 space-y-2">
                  {activeTab === "description" && <p>{description}</p>}
                  {activeTab === "customization" && customization && (
                    <div className="space-y-1">
                      {customization.flavour_choice && (
                        <p>Flavour Choice: {customization.flavour_choice}</p>
                      )}
                      {customization.theme_design && (
                        <p>Theme Design: {customization.theme_design}</p>
                      )}
                      {customization.price_range && (
                        <p>Price Range: {customization.price_range}</p>
                      )}
                    </div>
                  )}
                  {activeTab === "examples" && examples && (
                    <ul className="list-disc list-inside space-y-1">
                      {examples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    addToCart(product, product._id, selectedWeightValue)
                  }
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xs shadow-lg transition font-medium text-lg"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ProductSlider products={products} />
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
