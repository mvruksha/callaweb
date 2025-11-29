"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import Product from "@/components/cakemenu/Product";

// Helper to safely get category name whether it's an object or string
const getCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || ""; // extract 'name' from the object based on your error
};

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const swiperRef = useRef(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://callabackend.vercel.app/api/cakes"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        // Handle case where API might return { data: [...] } or just [...]
        const productsArray = Array.isArray(data) ? data : data.data || [];
        setProducts(productsArray);
      } catch (err) {
        console.error("Error fetching cakes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- EXTRACT CATEGORIES SAFELY ---
  const categories = useMemo(() => {
    if (!products.length) return ["All"];

    // Map products to just their category NAMES
    const categoryNames = products.map((p) => getCategoryName(p.category));

    // Deduplicate strings
    const uniqueCats = Array.from(new Set(categoryNames)).filter(Boolean);

    return ["All", ...uniqueCats];
  }, [products]);

  // --- FILTER SAFELY ---
  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter(
          (p) => getCategoryName(p.category) === selectedCategory
        );
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <section className="w-full py-24 bg-purple-50/30 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 text-purple-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-medium">Loading delicious cakes...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 text-center text-red-500">
        <p>Error loading products: {error}</p>
      </section>
    );
  }

  return (
    <section className="relative w-full py-12 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <span className="flex items-center gap-2 text-pink-600 font-bold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Best Sellers
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Featured{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Delights
              </span>
            </h2>
          </div>
          <div className="hidden md:block h-px flex-1 bg-gray-200 mx-8 relative top-[-10px]"></div>
        </div>

        {/* Category Tabs */}
        <div className="relative mb-10 group">
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30 transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
        </div>

        {/* Swiper */}
        <div className="relative group/slider">
          {filteredProducts.length > 0 ? (
            <>
              <Swiper
                modules={[Navigation, FreeMode, Autoplay]}
                onBeforeInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                spaceBetween={20}
                slidesPerView={1.2}
                freeMode={true}
                grabCursor={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{
                  nextEl: ".custom-next-btn",
                  prevEl: ".custom-prev-btn",
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2.2,
                    spaceBetween: 20,
                    freeMode: false,
                  },
                  1024: { slidesPerView: 3.5, spaceBetween: 24 },
                  1280: { slidesPerView: 4.5, spaceBetween: 24 },
                  1536: { slidesPerView: 5, spaceBetween: 24 },
                }}
                className="!pb-12 !px-1"
              >
                {filteredProducts.map((product) => (
                  <SwiperSlide
                    key={product._id || product.id}
                    className="h-auto"
                  >
                    <div className="h-full">
                      <Product product={product} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="custom-prev-btn absolute -left-2 md:-left-6 top-[40%] z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl text-gray-800 hover:bg-purple-600 hover:text-white transition-all duration-300 opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 translate-y-[-50%]">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="custom-next-btn absolute -right-2 md:-right-6 top-[40%] z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl text-gray-800 hover:bg-purple-600 hover:text-white transition-all duration-300 opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 translate-y-[-50%]">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-purple-50 p-6 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                No cakes found!
              </h3>
              <p className="text-gray-500">
                Try selecting a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
