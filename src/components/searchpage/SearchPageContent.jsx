"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Product from "@/components/cakemenu/Product"; // Ensure path is correct
import { FiSearch, FiFilter, FiAlertCircle, FiFrown } from "react-icons/fi";

// --- HELPERS ---

// 1. Safe String Extraction (Prevents "toLowerCase" crashes)
const getSafeString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.name) return val.name; // Handle category object
  return "";
};

// 2. Price Extractor
const getPrice = (product) => {
  if (!product) return 0;
  if (product.variants && product.variants.length > 0) {
    const p = product.variants[0].price;
    return typeof p === "object"
      ? p.discountedPrice || p.originalPrice || 0
      : p;
  }
  const rootPrice = product.price;
  if (typeof rootPrice === "object")
    return rootPrice.discountedPrice || rootPrice.originalPrice || 0;
  return rootPrice || 0;
};

// --- MAIN CONTENT COMPONENT ---
const SearchContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  // --- STATE ---
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local Filters
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState("relevance");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://callabackend.vercel.app/api/cakes");

        if (!res.ok) throw new Error("Failed to search products");

        const data = await res.json();
        // Handle array vs object response
        const items = Array.isArray(data) ? data : data.data || [];
        setAllProducts(items);
      } catch (err) {
        console.error("Search Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTER & SORT LOGIC ---
  const results = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase().trim();

    // 1. Filter by Search Query
    let filtered = allProducts.filter((cake) => {
      const title = getSafeString(cake.title).toLowerCase();
      const category = getSafeString(cake.category).toLowerCase();
      const description = getSafeString(cake.description).toLowerCase();

      return (
        title.includes(lowerQuery) ||
        category.includes(lowerQuery) ||
        description.includes(lowerQuery)
      );
    });

    // 2. Filter by Price
    filtered = filtered.filter((p) => getPrice(p) <= priceRange);

    // 3. Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => getPrice(b) - getPrice(a));
    }

    return filtered;
  }, [allProducts, query, priceRange, sortBy]);

  // --- RENDER HELPERS ---
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-[350px] animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4 w-full"></div>
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 w-1/2 rounded mb-4"></div>
      <div className="bg-gray-200 h-8 w-full rounded"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 text-center text-red-500 flex flex-col items-center">
        <FiAlertCircle size={40} className="mb-2" />
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-8 pb-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">Search Results for</p>
            <h1 className="text-3xl font-extrabold text-gray-900">
              "{query}"{" "}
              <span className="text-lg font-medium text-gray-400">
                ({results.length} items)
              </span>
            </h1>
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            {/* Price Filter */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase">
                Max Price: ₹{priceRange}
              </span>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-32 accent-purple-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
              />
            </div>

            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* RESULTS GRID */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiFrown className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              No matches found
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              We couldn't find any cakes matching "{query}". Try searching for
              generic terms like "Chocolate" or "Birthday".
            </p>
            <Link
              href="/cakes"
              className="mt-6 px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition"
            >
              Browse All Cakes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// --- WRAPPER (Required for useSearchParams) ---
export default function SearchPageContent() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
