"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IoMdArrowDropleft,
  IoMdArrowDropright,
  IoMdClose,
  IoMdStar,
  IoMdCart,
} from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper to safely get price based on your JSON structure ---
const getPriceDisplay = (cake) => {
  if (!cake.variants || cake.variants.length === 0) {
    // Fallback if no variants exist
    return {
      discounted: cake.price?.discountedPrice || 0,
      original: cake.price?.originalPrice || 0,
      label: "Standard",
    };
  }

  // Priority 1: Try to find "1 Kg" specific variant (Case insensitive)
  let targetVariant = cake.variants.find(
    (v) => v.label.toLowerCase() === "1 kg"
  );

  // Priority 2: If no "1 Kg", try any weight-based variant (contains 'kg', 'gm', 'lb')
  // This avoids showing the price of a Flavor (like "Chocolate") as the main price
  if (!targetVariant) {
    targetVariant = cake.variants.find((v) => /(kg|gm|lb)/i.test(v.label));
  }

  // Priority 3: Fallback to the very first variant if no weight found
  if (!targetVariant) {
    targetVariant = cake.variants[0];
  }

  return {
    discounted: targetVariant?.price?.discountedPrice || 0,
    original: targetVariant?.price?.originalPrice || 0,
    label: targetVariant?.label || "",
  };
};

// --- Skeleton Component ---
const GallerySkeleton = () => (
  <div className="flex space-x-6 overflow-hidden py-2 px-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex-none w-72 h-80 bg-gray-200 rounded-2xl animate-pulse"
      />
    ))}
  </div>
);

const CakeGallery = () => {
  const [cakes, setCakes] = useState([]);
  const [selectedCake, setSelectedCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const res = await fetch("https://callabackend.vercel.app/api/cakes");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Handle array vs object response safely
        const items = Array.isArray(data) ? data : data.data || [];
        setCakes(items);
      } catch (err) {
        console.error(err);
        setError("Unable to load our delicious gallery.");
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
  }, []);

  // --- Handlers ---
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleNextModal = (e) => {
    e.stopPropagation();
    const currentIndex = cakes.findIndex((c) => c._id === selectedCake._id);
    const nextIndex = (currentIndex + 1) % cakes.length;
    setSelectedCake(cakes[nextIndex]);
  };

  const handlePrevModal = (e) => {
    e.stopPropagation();
    const currentIndex = cakes.findIndex((c) => c._id === selectedCake._id);
    const prevIndex = (currentIndex - 1 + cakes.length) % cakes.length;
    setSelectedCake(cakes[prevIndex]);
  };

  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <section className="relative py-12 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-8 flex justify-between items-end mb-8 max-w-8xl mx-auto">
        <div>
          <span className="text-purple-600 font-bold tracking-wider uppercase text-sm">
            Sweet Collections
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Masterpieces
            </span>
          </h2>
        </div>

        {/* Navigation Buttons (Desktop) */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-full border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300"
          >
            <IoMdArrowDropleft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300"
          >
            <IoMdArrowDropright size={24} />
          </button>
        </div>
      </div>

      {/* --- Gallery Slider --- */}
      <div className="relative max-w-full">
        {loading ? (
          <GallerySkeleton />
        ) : (
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 md:px-8 snap-x snap-mandatory hide-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cakes.map((cake) => {
              const { discounted, original, label } = getPriceDisplay(cake);

              return (
                <motion.div
                  key={cake._id}
                  layoutId={`card-${cake._id}`}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedCake(cake)}
                  className="flex-none w-72 md:w-80 bg-white rounded-2xl shadow-lg cursor-pointer overflow-hidden group snap-start border border-gray-100 relative"
                >
                  {/* Image Container */}
                  <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={cake.image}
                      alt={cake.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge */}
                    {cake.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-purple-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {cake.discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">
                      {cake.title}
                    </h3>

                    {/* Price Section */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs line-through">
                          ₹{original}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-purple-700 font-extrabold text-xl">
                            ₹{discounted}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1 rounded">
                            {label}
                          </span>
                        </div>
                      </div>
                      <button className="bg-purple-100 text-purple-700 p-2 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <IoMdArrowDropright size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Advanced Modal --- */}
      <AnimatePresence>
        {selectedCake && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCake(null)}
          >
            <motion.div
              layoutId={`card-${selectedCake._id}`}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCake(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors md:hidden"
              >
                <IoMdClose size={24} />
              </button>

              {/* Left: Image & Navigation */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100 group">
                <Image
                  src={selectedCake.image}
                  alt={selectedCake.title}
                  fill
                  className="object-cover"
                />

                {/* Modal Navigation Overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handlePrevModal}
                    className="p-2 bg-white/80 rounded-full hover:bg-white hover:scale-110 transition shadow-lg text-purple-900"
                  >
                    <IoMdArrowDropleft size={30} />
                  </button>
                  <button
                    onClick={handleNextModal}
                    className="p-2 bg-white/80 rounded-full hover:bg-white hover:scale-110 transition shadow-lg text-purple-900"
                  >
                    <IoMdArrowDropright size={30} />
                  </button>
                </div>
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                      {selectedCake.title}
                    </h2>
                    <button
                      onClick={() => setSelectedCake(null)}
                      className="hidden md:block p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <IoMdClose size={28} />
                    </button>
                  </div>

                  {/* Ratings Mockup */}
                  <div className="flex items-center gap-1 text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <IoMdStar key={i} />
                    ))}
                    <span className="text-gray-400 text-sm ml-2">
                      ({Math.floor(Math.random() * 200) + 50} Reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {selectedCake.description ||
                      "Experience the rich flavors and delicate texture of this masterpiece. Baked fresh daily with premium ingredients."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold uppercase">
                      Fresh Cream
                    </span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold uppercase">
                      Eggless Option
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Starting Price ({getPriceDisplay(selectedCake).label})
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-purple-700">
                          ₹{getPriceDisplay(selectedCake).discounted}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ₹{getPriceDisplay(selectedCake).original}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON - Links to Product Page */}
                  <Link
                    href={`/product/${selectedCake._id}`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-200"
                  >
                    <IoMdCart size={22} /> View Details & Order
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CakeGallery;
