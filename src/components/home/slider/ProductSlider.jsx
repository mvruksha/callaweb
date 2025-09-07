"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react"; // modern icons
import Product from "@/components/cakemenu/Product";

const ProductSlider = ({ products }) => {
  // extract unique categories
  const categories = [
    { id: "all", name: "All" },
    ...Array.from(new Set(products.map((p) => p.category))).map((cat, idx) => ({
      id: idx,
      name: cat,
    })),
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  // filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <section className="relative w-full px-4 md:px-8 lg:px-8 py-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-xs shadow-inner">
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Featured Cakes
        </h2>
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-5 py-1 rounded-xs text-sm font-medium transition-all duration-300 shadow-sm ${
              selectedCategory === cat.name
                ? "bg-purple-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Gradient overlays for fancy look */}
        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white/70 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white/70 to-transparent z-10 pointer-events-none"></div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="pb-4"
        >
          {filteredProducts.map((product, index) => (
            <SwiperSlide key={product._id || product.id || index}>
              <Product
                product={{ ...product, id: product._id || product.id }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="custom-prev absolute -left-4 md:-left-8 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-xs hover:bg-purple-600 hover:text-white transition-colors z-20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="custom-next absolute -right-4 md:-right-8 top-1/2 transform -translate-y-1/2 bg-white shadow-md w-10 h-10 flex items-center justify-center rounded-xs hover:bg-purple-600 hover:text-white transition-colors z-20">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default ProductSlider;
