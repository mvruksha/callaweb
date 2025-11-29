"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoMdArrowBack,
  IoMdStar,
  IoMdCart,
  IoMdHeartEmpty,
  IoMdHeart,
  IoMdCheckmarkCircleOutline,
} from "react-icons/io";
import {
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiChevronDown,
  FiShare2,
  FiCheckCircle,
} from "react-icons/fi";

// Contexts
import { CartContext } from "../../../../contexts/CartContext";

// Components
import Titletag from "@/components/titletag/Titletag";

// --- HELPERS ---
const getCategoryName = (category) => {
  if (!category) return "Bakery";
  if (typeof category === "string") return category;
  return category.name || "Bakery";
};

// Safe Price for Related Items
const getDisplayPrice = (product) => {
  if (!product) return 0;
  // Try to find base price (1kg or first variant)
  let p = product.price;
  if (product.variants?.length > 0) {
    // Find cheapest weight variant to show "Starting at"
    const weightVars = product.variants.filter((v) =>
      /(kg|gm|lb)/i.test(v.label)
    );
    if (weightVars.length > 0) {
      p = weightVars[0].price;
    } else {
      p = product.variants[0].price;
    }
  }
  return typeof p === "object" ? p.discountedPrice || p.originalPrice : p || 0;
};

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection State
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // 1. Get Product
        const res = await fetch(
          `https://callabackend.vercel.app/api/cakes/${id}`
        );
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        // 2. Get Related
        const allRes = await fetch(`https://callabackend.vercel.app/api/cakes`);
        const allData = await allRes.json();
        const allProducts = Array.isArray(allData)
          ? allData
          : allData.data || [];

        const currentCat = getCategoryName(data.category);
        const related = allProducts
          .filter(
            (p) =>
              getCategoryName(p.category) === currentCat && p._id !== data._id
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  // --- 2. EXTRACT VARIANTS ---
  const { weightOptions, flavorOptions, variantMap } = useMemo(() => {
    if (!product || !product.variants)
      return { weightOptions: [], flavorOptions: [], variantMap: [] };

    const weightRegex = /(kg|gm|lb|pound)/i;
    // Filter full objects, not just labels
    const weights = product.variants.filter(
      (v) => v.label && weightRegex.test(v.label)
    );
    const flavors = product.variants.filter(
      (v) => v.label && !weightRegex.test(v.label)
    );

    return {
      weightOptions: [...new Set(weights.map((v) => v.label))],
      flavorOptions: [...new Set(flavors.map((v) => v.label))],
      variantMap: product.variants, // Store full array for price lookups
    };
  }, [product]);

  // --- 3. SMART DEFAULTS (The Fix) ---
  useEffect(() => {
    if (product) {
      // A. Default Weight: First available
      if (weightOptions.length > 0 && !selectedWeight) {
        setSelectedWeight(weightOptions[0]);
      }

      // B. Default Flavor: Lowest Price
      if (flavorOptions.length > 0 && !selectedFlavor) {
        // Sort flavors by discounted price
        const sortedFlavors = [...flavorOptions].sort((aLabel, bLabel) => {
          const varA = variantMap.find((v) => v.label === aLabel);
          const varB = variantMap.find((v) => v.label === bLabel);
          return (
            (varA?.price?.discountedPrice || 0) -
            (varB?.price?.discountedPrice || 0)
          );
        });
        // Pick the cheapest (usually "Regular" @ 0 cost)
        setSelectedFlavor(sortedFlavors[0]);
      }
    }
  }, [
    product,
    weightOptions,
    flavorOptions,
    variantMap,
    selectedWeight,
    selectedFlavor,
  ]);

  // --- 4. PRICE ENGINE ---
  const priceData = useMemo(() => {
    if (!product) return { discountedPrice: 0, originalPrice: 0 };

    let dPrice = 0,
      oPrice = 0;

    // A. Base Price (Weight)
    if (selectedWeight) {
      const v = product.variants.find((v) => v.label === selectedWeight);
      if (v?.price) {
        dPrice += v.price.discountedPrice || 0;
        oPrice += v.price.originalPrice || 0;
      }
    } else {
      // Fallback
      const p = product.price;
      dPrice = typeof p === "object" ? p.discountedPrice : p || 0;
      oPrice = typeof p === "object" ? p.originalPrice : p || 0;
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

  const discountPercent =
    priceData.originalPrice > priceData.discountedPrice
      ? Math.round(
          ((priceData.originalPrice - priceData.discountedPrice) /
            priceData.originalPrice) *
            100
        )
      : 0;

  // --- HELPER: Flavor Label Formatter ---
  const getFlavorLabel = (label) => {
    const f = product?.variants.find((v) => v.label === label);
    const cost = f?.price?.discountedPrice || 0;
    if (cost > 0) return `${label} (+₹${cost})`;
    return label; // e.g. "Regular"
  };

  // --- ADD TO CART ---
  const handleAddToCart = () => {
    if (!product) return;
    const itemToAdd = {
      ...product,
      id: product._id,
      selectedWeight: selectedWeight || "Standard",
      selectedFlavor: selectedFlavor || "Standard",
      price: priceData.discountedPrice,
      image: product.image,
    };
    for (let i = 0; i < quantity; i++) addToCart(itemToAdd, product._id);
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-600">
        <h2 className="text-2xl font-bold mb-4">Oops! Product not found.</h2>
        <button
          onClick={() => router.back()}
          className="text-purple-600 hover:underline flex items-center gap-2 font-medium"
        >
          <IoMdArrowBack /> Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent="Menu"
        title={product.title}
      />

      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Nav Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-700 transition-colors text-sm font-semibold bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
          >
            <IoMdArrowBack size={18} /> Back
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white rounded-full text-gray-400 hover:text-purple-600 shadow-sm border border-gray-100 transition">
              <FiShare2 size={18} />
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-2.5 bg-white rounded-full shadow-sm border border-gray-100 transition ${
                isWishlisted
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            >
              {isWishlisted ? (
                <IoMdHeart size={18} />
              ) : (
                <IoMdHeartEmpty size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          {/* --- LEFT: VISUALS --- */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-square bg-white rounded-3xl shadow-xl shadow-purple-100/50 border border-white overflow-hidden group cursor-zoom-in"
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-10 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                priority
              />

              {/* Floating Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-6 left-6">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                    <IoMdStar className="text-yellow-300" /> {discountPercent}%
                    OFF
                  </div>
                </div>
              )}
            </motion.div>

            {/* Benefit Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <FiCheckCircle />, text: "100% Eggless" },
                { icon: <FiTruck />, text: "24hr Delivery" },
                { icon: <FiShield />, text: "Secure Pay" },
                { icon: <IoMdCheckmarkCircleOutline />, text: "Fresh Baked" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-center"
                >
                  <span className="text-purple-600 mb-1">{item.icon}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: INFO & ACTIONS --- */}
          <div className="flex flex-col">
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
              {/* Header Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {getCategoryName(product.category)}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <IoMdStar />{" "}
                    <span className="text-gray-400 font-medium">(4.8)</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight">
                  {product.title}
                </h1>
                <p className="text-gray-500 mt-3 leading-relaxed text-sm">
                  {product.description ||
                    "Indulge in our premium range of handcrafted delights."}
                </p>
              </div>

              <div className="w-full h-px bg-gray-100 mb-8"></div>

              {/* Price Block */}
              <div className="mb-8">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  Total Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                    ₹{priceData.discountedPrice}
                  </span>
                  {priceData.originalPrice > priceData.discountedPrice && (
                    <span className="text-xl text-gray-400 line-through decoration-2 decoration-red-200">
                      ₹{priceData.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6 mb-8">
                {/* 1. Weight */}
                {weightOptions.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-gray-800 mb-3 block">
                      Choose Weight
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {weightOptions.map((w) => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeight(w)}
                          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                            selectedWeight === w
                              ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm"
                              : "border-gray-100 bg-gray-50 text-gray-500 hover:border-purple-200 hover:bg-white"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Flavor */}
                {flavorOptions.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-gray-800 mb-3 block">
                      Choose Flavor
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedFlavor || ""}
                        onChange={(e) => setSelectedFlavor(e.target.value)}
                        className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-purple-200 text-gray-700 py-3.5 px-5 pr-12 rounded-xl focus:outline-none focus:border-purple-600 font-semibold cursor-pointer transition-all"
                      >
                        {flavorOptions.map((f) => (
                          <option key={f} value={f}>
                            {getFlavorLabel(f)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-600 transition-colors pointer-events-none">
                        <FiChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Quantity */}
                <div>
                  <label className="text-sm font-bold text-gray-800 mb-3 block">
                    Quantity
                  </label>
                  <div className="flex items-center w-36 bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-white hover:text-purple-600 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <div className="flex-1 text-center font-bold text-gray-900">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-white hover:text-purple-600 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Action */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gray-900 hover:bg-black text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <IoMdCart size={24} />
                Add to Cart • ₹
                {(priceData.discountedPrice * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="flex justify-center gap-8 border-b border-gray-200 mb-8">
            {["description", "shipping"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                  activeTab === tab
                    ? "text-purple-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "description" ? "Details" : "Delivery"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed shadow-sm text-center"
            >
              {activeTab === "description" ? (
                <>
                  <p className="mb-4 text-lg">{product.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto mt-8 bg-gray-50 p-6 rounded-xl">
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs uppercase mb-1">
                        Key Ingredients
                      </h4>
                      <p className="text-sm">
                        Imported Cocoa, Fresh Cream, Vanilla Bean, Organic
                        Flour.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs uppercase mb-1">
                        Allergens
                      </h4>
                      <p className="text-sm">
                        Contains Wheat, Milk, Eggs. Nut-free options available.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <ul className="text-left list-disc pl-5 space-y-3 mx-auto max-w-lg">
                  <li>
                    <strong>Standard Delivery:</strong> Within 24 hours of order
                    confirmation.
                  </li>
                  <li>
                    <strong>Same Day Delivery:</strong> Available for orders
                    placed before 4 PM.
                  </li>
                  <li>
                    <strong>Freshness Guarantee:</strong> All items are baked
                    fresh on the day of delivery.
                  </li>
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- RELATED --- */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
              You Might Also Like [Image of related products]
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <motion.div
                  key={p._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
                  onClick={() => router.push(`/product/${p._id}`)}
                >
                  <div className="relative h-56 bg-gray-50 p-6">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-gray-800 line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-purple-700 font-bold mt-1">
                      ₹{getDisplayPrice(p)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
